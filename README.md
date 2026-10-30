# Fastor Take-Home Assignment (React Track)

A mobile-first web application built with React 18 and Vite for Fastor's frontend assignment.

Fastor sent a corrected Figma design ("Mobile-App-Design-Task"), and this version follows it across its 4 screens:
1. Phone Number Signup (`/login`)
2. 6-Digit OTP Verification (`/otp`)
3. Home Dashboard (`/`)
4. Product Detail (`/item/:id`)

Built with AI assistance (Google Antigravity) and reviewed by me.

---

## The Flow

1. **Signup Screen (`/login`)**: The user is prompted for their 10-digit mobile number. As digits are entered, the display auto-formats into `5 + space + 5` (e.g. `98189 79450`). The "Get OTP" button remains disabled until exactly 10 digits are present. Submitting calls the Fastor register endpoint and redirects to the OTP screen.
2. **OTP Verification Screen (`/otp`)**: Displays the target phone formatted as `+91 12345 67890`. OTP inputs are arranged into two groups of three boxes separated by a hyphen, featuring auto-advance, backspace handling, and paste support. A 30-second countdown runs (`00:30`); when it reaches zero, an orange "Resend" button appears to trigger the register endpoint again and restart the timer. Submitting calls Fastor's login endpoint (`123456` default OTP) and saves token and user profile into `AuthContext`.
3. **Home Screen (`/`, protected)**:
   - Header with "Current Locations" and "Model Town, New Delhi".
   - Top row containing a card with the logged-in user's name alongside two gradient shortcut buttons: Call (`tel:` protocol link) and Wallet (displays a toast notice). The name on the home screen comes from the login response's `user_name` (the shared staging test number returns whatever name was last set on it).
   - "Best Seller" horizontal scroll row with tall rounded image cards and bottom-right price tags.
   - Promotional carousel with a 30% OFF banner and pizza artwork, horizontally swipeable with scroll-snap and 5 synced indicator dots.
   - "Popular Items" order list showing previous orders, order date, item count, an orange "Cancel Order" action (with browser confirmation), and a peach "Track Driver" action (shows toast). Tapping any best seller tile or popular item name/image navigates to its detail page.
4. **Product Detail Screen (`/item/:id`, protected)**:
   - Hero dish photo with an overlaid orange back arrow for navigation.
   - Price display (`₹14.00` for pizza) and quantity stepper with circle buttons (`-` and `+`, constrained between 1 and 20).
   - Title and description.
   - "Personal portion" selector with radio buttons and dotted leader lines connecting labels to additional prices (Personal, Medium, Familiar, Jumbo).
   - Pinned full-width "Add to cart" button showing the running total (defaults to quantity 1 and first portion). Clicking it saves the selection to `CartContext` (persisted in `localStorage`) and presents a toast notification. Unknown item IDs render a friendly not-found screen with a link home.

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node 20 and Node 24)
- npm 9+

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run automated tests (Vitest)
npm test

# 4. Build for production
npm run build
```

---

## APIs Used

The application integrates with Fastor's staging API (`https://staging.fastor.ai`). The base URL can be customized with `VITE_API_BASE`.

### 1. Register / Request OTP
- **Endpoint**: `POST /v1/pwa/user/register`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Curl Example**:
```bash
curl -X POST https://staging.fastor.ai/v1/pwa/user/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "phone=9818979450&dial_code=+91"
```
- **Response**:
```json
{"status":"Success","status_code":200,"data":"otp sent"}
```

### 2. Login with OTP
- **Endpoint**: `POST /v1/pwa/user/login`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Default OTP**: `123456`
- **Curl Example**:
```bash
curl -X POST https://staging.fastor.ai/v1/pwa/user/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "phone=9818979450&otp=123456&dial_code=+91"
```
- **Response (Success)**:
```json
{
  "status": "Success",
  "status_code": 200,
  "data": {
    "user_id": "7208",
    "user_name": "Guest",
    "token": "eyJhbGciOiJIUz..."
  }
}
```
- **Note on Error Handling**: Fastor's staging API returns HTTP 200 with `status: "Failed"` on incorrect OTPs. The client code checks `body.status !== 'Success'` to handle errors properly.
- **Note on User Name**: The name displayed on the home screen comes from the login response's `user_name` (the shared staging test number returns whatever name was last set on it).

### 3. Fetch Restaurants
- **Endpoint**: `GET /v1/m/restaurant?city_id=118`
- **Curl Example**:
```bash
curl -X GET "https://staging.fastor.ai/v1/m/restaurant?city_id=118" \
  -H "Authorization: Bearer <token>"
```
- The `getRestaurants` / `fetchRestaurants` function remains in `src/api/fastor.js` as it is part of the collection, though the new design focuses on dish and order details rather than restaurant listings.

---

## Design Implementation Details

- **Static Data & Why**: The provided Postman collection contains only register, login, and restaurant list endpoints. It provides no endpoints for dish menus, portion options, cart items, or orders. Consequently, menu dishes, prices, descriptions, portion choices, and sample popular orders are maintained in `src/data/menu.js`.
- **Currency Normalisation**: The Figma mockups occasionally mixed `$` (in portions and best seller tiles) and `₹` (in popular orders and product detail). For consistency across an Indian delivery UI using `+91` dial codes and Delhi addresses, `₹` is used uniformly throughout the app.
- **Device Chrome**: The phone status bar (9:41) and iOS on-screen keyboard shown in Figma frames 1 and 2 are device chrome. They are not drawn in CSS/DOM; inputs use `inputMode="numeric"` to summon the native numeric keypad on mobile devices.
- **Colours Sampled from Figma**:
  - Primary button: `#FF5701` (full-width, radius ~10px, white text, letter-spaced)
  - Accent orange: `#E95322` (prices, Cancel Order pill, stepper circles, radios, active carousel dot, promo banner background)
  - Light peach: `#FFDECF` (Track Driver pill background) with orange text
  - Divider lines: `#FFD8C7`
  - Auth headings: `#292E39`
  - Home and detail headings: `#391713` (dark brown)
  - Inputs: background `#F5F5F5`, border `#C7C7C7`
  - Inactive carousel dots: pale yellow `#F3E9B5`
  - Call button gradient: `#FF936D` to `#FF726B`
  - Wallet button gradient: `#7CC7ED` to `#4F79CB`
- **Typography**: Auth screens use Mulish; headings and dish titles on home/detail views use League Spartan. Both are loaded via Google Fonts in `index.html`.
- **Food Photography**: The food photos in `public/images/` are from Unsplash (free to use under the Unsplash licence).
- **PWA Configuration**: A web manifest is added in `public/manifest.webmanifest` (`name: "Fastor"`, `theme_color: #FF5701`) with corresponding meta tags in `index.html`.

---

## Automated Tests

Tests are written using Vitest and Testing Library. All external fetch calls and timers are mocked.

```bash
npm test
```

### Test Coverage (35 tests across 7 test files):
- `src/pages/LoginFlow.test.jsx` (6 tests):
  - Renders design copy, formats phone number while typing, and keeps Get OTP disabled until 10 digits
  - Shows validation error if submitted without a valid 10-digit phone number
  - Successfully submits valid phone and navigates to OTP screen
  - Shows the entered number, counts down and lets you resend the code
  - Displays error message when incorrect OTP is entered (handles HTTP 200 with Failed status)
  - Successfully authenticates with correct OTP and saves token
- `src/pages/Home.test.jsx` (4 tests):
  - Renders user name from auth and location header
  - Renders Best Seller tiles, promo carousel and items
  - Renders Popular Items and handles cancel order flow with confirmation
  - Shows track driver toast and wallet coming soon toast
- `src/pages/ProductDetail.test.jsx` (5 tests):
  - Renders item details, base unit price, and portion radio options
  - Enforces qty stepper bounds (min 1, max 20)
  - Portion selection and quantity changes update the running total price
  - Adds item to cart context and persists in localStorage with toast feedback
  - Renders not-found message and link to home for unknown item id
- `src/components/OtpInput.test.jsx` (5 tests):
  - Renders 6 input boxes by default
  - Auto-advances focus as digits are entered
  - Handles backspace moving focus back to previous input
  - Supports pasting a 6-digit code
  - Filters out non-digit characters during paste
- `src/utils/price.test.js` (6 tests):
  - Calculates total for base price and quantity 1 without extra portion cost
  - Adds portion extra cost to base price before multiplying by quantity
  - Handles decimal prices accurately
  - Falls back safely on missing or invalid inputs
  - Formats numbers with rupee symbol and two decimal places
  - Handles numeric strings gracefully
- `src/utils/validation.test.js` (7 tests):
  - Accepts valid 10-digit numbers
  - Rejects numbers with fewer or more than 10 digits
  - Rejects strings with letters or special characters
  - Rejects empty, null, or undefined inputs
  - Accepts valid 6-digit OTP
  - Rejects OTP with non-6 digit lengths
  - Rejects non-numeric characters
- `src/components/ProtectedRoute.test.jsx` (2 tests):
  - Redirects to /login when unauthenticated
  - Renders children when token exists in storage

---

## What I'd Improve Next

1. **Cart Sheet / Checkout Screen**: Add a slide-up tray or dedicated `/cart` route showing itemized selections, portion tags, subtotal, taxes, and delivery address summary.
2. **Dynamic Menu API**: Replace static `src/data/menu.js` with live backend endpoints for menus, inventory availability, and order status updates.
3. **Live Order Tracking via WebSockets**: Replace the placeholder driver tracking toast with real-time driver coordinates on a lightweight Mapbox or Leaflet view.
4. **Session Cookie Storage**: Migrate JWT token storage from `localStorage` to `httpOnly` secure cookies via a lightweight backend proxy.
