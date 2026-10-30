# Implementation Notes

A technical walkthrough of the architecture, key decisions, and tradeoffs made while building the Fastor React assignment based on the corrected Figma design.

---

## Component & Route Structure

```
src/
├── api/
│   └── fastor.js              # Fetch client wrapper for register, login, and getRestaurants
├── components/
│   ├── OtpInput.jsx           # 6-box OTP component grouped 3-by-3 with auto-advance and paste
│   └── ProtectedRoute.jsx     # Route guard redirecting unauthenticated users to /login
├── context/
│   ├── AuthContext.jsx        # Auth state (JWT token, user profile, login, logout)
│   ├── CartContext.jsx        # Cart state with localStorage persistence
│   └── ToastContext.jsx       # Global lightweight toast notification provider
├── data/
│   └── menu.js                # Static items (best sellers, popular orders, promo slides)
├── pages/
│   ├── Home.jsx               # Screen 3: Location header, user greeting, best sellers, promo, orders
│   ├── Login.jsx              # Screen 1: Phone input with 5+5 formatting and Get OTP button
│   ├── Otp.jsx                # Screen 2: 6-digit code entry with 30s resend timer
│   └── ProductDetail.jsx      # Screen 4: Hero image, stepper, portion selection, add to cart
├── utils/
│   ├── constants.js           # Default dial code and city ID
│   ├── price.js               # Pure price calculation and currency formatting
│   └── validation.js          # 10-digit phone and 6-digit OTP regex checks
├── App.jsx                    # App shell, router setup, and context providers
├── index.css                  # Responsive stylesheet with design tokens from Figma
└── main.jsx                   # React root entry point
```

### Route Map

- `/login` -> `Login.jsx` (Public; redirects to `/` if user is already authenticated)
- `/otp` -> `Otp.jsx` (Public; receives entered phone number via navigation state, redirects to `/` if already authenticated)
- `/` -> `Home.jsx` (Protected via `ProtectedRoute`)
- `/item/:id` -> `ProductDetail.jsx` (Protected via `ProtectedRoute`; renders product by ID or shows not-found state)
- `*` -> Catch-all redirecting to `/`

---

## Authentication Flow & Timer Logic

### 1. Registration & Phone Formatting
- Screen 1 captures the user's mobile number. An `onChange` handler cleans non-digits, constrains the input to 10 digits, and dynamically displays the value formatted as `5 digits + space + 5 digits`.
- The submit button remains disabled until all 10 digits are present.
- On submission, `registerUser` calls `POST /v1/pwa/user/register`. Upon success, the app navigates to `/otp` carrying `{ phone }` in the router location state.

### 2. 6-Box OTP Input with Grouping
- `OtpInput.jsx` splits the 6 boxes into two groups of 3 separated by an uneditable dash (`[ ][ ][ ] - [ ][ ][ ]`), matching Figma Frame 2.
- Input boxes handle:
  - Numeric filtering (`inputMode="numeric"`, non-digits rejected)
  - Auto-advance on digit entry
  - Backspace navigation to the preceding input
  - Native clipboard paste handling that strips formatting and distributes digits across boxes

### 3. Countdown & Resend Timer
- `Otp.jsx` initializes a countdown timer at 30 seconds (`secondsLeft = 30`).
- A `useEffect` hook decrements `secondsLeft` every 1000ms until reaching 0.
- While `secondsLeft > 0`, the UI renders `I didn't receive a code (00:SS)`.
- When `secondsLeft === 0`, the timer label swaps for an active orange "Resend" button.
- Clicking "Resend" invokes `registerUser(phone)`, clears any previous OTP input, and resets `secondsLeft` back to 30.

### 4. Verification & Token Handling
- The "Continue" button submits to `POST /v1/pwa/user/login`.
- If the API returns an error or HTTP 200 with `status: "Failed"`, an error banner is displayed.
- On success, `AuthContext.login(token, userData)` stores the token in state and syncs to `localStorage` under `fastor_token` and `fastor_user`.

---

## Cart & Price Calculation Logic

### 1. Pure Price Function (`src/utils/price.js`)
All financial totals are computed using pure functions to ensure consistency between unit tests and UI rendering:

```javascript
export function calculateItemTotal(unitPrice = 0, portionExtra = 0, quantity = 1) {
  const base = parseFloat(unitPrice) || 0;
  const extra = parseFloat(portionExtra) || 0;
  const qty = parseInt(quantity, 10) || 1;
  const total = (base + extra) * Math.max(1, qty);
  return Math.round(total * 100) / 100;
}
```

- Base dish price (e.g. `14.00`) is summed with the selected portion's extra cost (e.g. Jumbo `+10.00`).
- The sum (`24.00`) is multiplied by the quantity (e.g. `3`), resulting in `₹72.00`.
- Amounts are formatted with `formatPrice` to output consistent two-decimal rupee strings (e.g. `₹72.00`).

### 2. Cart Context & Persistence (`src/context/CartContext.jsx`)
- Cart state maintains an array of added items: `{ id, name, portion, qty, total }`.
- State initializes synchronously from `localStorage.getItem('fastor_cart')` and updates whenever items change.
- Clicking "Add to cart" in `ProductDetail.jsx` pushes the order line to `CartContext` and triggers a toast notification displaying the added total.

---

## Visual Design & Styling Decisions

- **Color Palette**: Measured directly from the updated Figma frames:
  - Primary button: `#FF5701`
  - Accent orange: `#E95322`
  - Light peach pill: `#FFDECF` with orange text
  - Peach hairline divider: `#FFD8C7`
  - Auth headings: `#292E39`
  - Home and detail headings: `#391713`
  - Input background: `#F5F5F5`, border `#C7C7C7`
  - Carousel inactive dots: `#F3E9B5`
  - Call gradient: `#FF936D` to `#FF726B`
  - Wallet gradient: `#7CC7ED` to `#4F79CB`
- **Typography**: Google Fonts `Mulish` (for authentication screens and body copy) and `League Spartan` (for home and detail headings).
- **Layout**: Centered mobile-first container constrained to a maximum width of 430px on desktop screens, with padded pinned buttons positioned inside the column.
