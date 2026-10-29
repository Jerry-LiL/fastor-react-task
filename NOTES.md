# Implementation Notes

A technical walkthrough of the architecture, key decisions, and tradeoffs made while building the Fastor React assignment.

---

## Component & Route Structure

```
src/
├── api/
│   └── fastor.js              # Fetch client wrapper for register, login, and restaurants
├── assets/
│   └── fastor-logo.svg        # Fastor white wordmark SVG
├── components/
│   ├── LogoOverlay.jsx        # Draggable Fastor logo overlay with pointer events
│   ├── OtpInput.jsx           # 6-box OTP component with auto-advance and paste
│   ├── ProtectedRoute.jsx     # Route guard redirecting unauthenticated users to /login
│   ├── RestaurantCard.jsx     # Card component for list and horizontal scroll views
│   └── ShareButton.jsx        # Canvas composition, Web Share API, and download fallback
├── context/
│   └── AuthContext.jsx        # React context holding token, user profile, login, and logout
├── pages/
│   ├── Home.jsx               # Screen 3: Location bar, greeting card, carousels, restaurant list
│   ├── Login.jsx              # Screen 1: Mobile number input and validation
│   ├── Otp.jsx                # Screen 2: 6-digit OTP verification and resend
│   └── RestaurantDetail.jsx   # Screen 4: Hero image with draggable overlay and sheet details
├── utils/
│   ├── constants.js           # Default placeholders, city ID, and fallback SVG graphic
│   ├── overlay.js             # Pure clamping and centering mathematics
│   └── validation.js          # 10-digit phone and 6-digit OTP regex checks
├── App.jsx                    # Route hierarchy and app shell container
├── index.css                  # Single responsive stylesheet with design tokens
└── main.jsx                   # React root entry point
```

### Route Map

- `/login` -> `Login.jsx` (Public; redirects to `/` if already logged in)
- `/otp` -> `Otp.jsx` (Public; accepts phone number via router state or fallback)
- `/` -> `Home.jsx` (Protected via `ProtectedRoute`)
- `/restaurant/:id` -> `RestaurantDetail.jsx` (Protected; accepts restaurant object from router state, falls back to re-fetching by id)
- `*` -> Catch-all redirecting to `/`

---

## Authentication Flow & Token Storage Tradeoffs

### Current Implementation
Authentication is handled through `AuthContext`. On successful OTP verification:
1. The JWT token and basic user details returned by the Fastor API are saved into `localStorage` under `fastor_token` and `fastor_user`.
2. State within `AuthContext` updates immediately, causing `ProtectedRoute` to grant access to the private routes.
3. On application reload, `AuthContext` synchronously initializes from `localStorage` to prevent unauthenticated flash screens.
4. Calling `logout()` cleans both state and storage.

### Tradeoffs: localStorage vs. httpOnly Cookies

- **localStorage (Used here)**:
  - *Pros*: Completely client-side, zero backend server or reverse proxy configuration needed, works directly with external cross-origin staging APIs (`https://staging.fastor.ai`), and straightforward to inspect during development and testing.
  - *Cons*: Vulnerable to Cross-Site Scripting (XSS). Any malicious script executing in the browser origin can read the token.

- **httpOnly, Secure Cookies (Production Recommended)**:
  - *Pros*: Inaccessible to client JavaScript, mitigating token theft via XSS. Can be paired with `SameSite=Lax` or `Strict` to protect against CSRF attacks.
  - *Cons*: Requires the authentication API to reside on the same top-level domain or necessitate a backend-for-frontend (BFF) proxy to set and relay cookies.

For a standalone frontend take-home consuming an external API with permissive CORS, `localStorage` is the pragmatic standard choice.

---

## Draggable Overlay & Canvas Composition

### 1. Pointer Events for Dragging
Instead of pulling in third-party drag libraries, `LogoOverlay.jsx` utilizes standard Pointer Events:
- `onPointerDown`: Captures the pointer via `setPointerCapture(e.pointerId)` and stores the initial pointer coordinates and logo position.
- `onPointerMove`: Calculates the delta (`clientX - startX`, `clientY - startY`) and applies `clampOverlayPosition`.
- `onPointerUp` / `onPointerCancel`: Releases pointer capture and clears active dragging state.
- CSS property `touch-action: none` prevents mobile touch gestures from triggering viewport scroll while dragging.

### 2. Clamping Mathematics
The helper `clampOverlayPosition(pos, bounds)` ensures:
- `x` is constrained between `0` and `containerWidth - itemWidth`.
- `y` is constrained between `0` and `containerHeight - itemHeight`.
This prevents the overlay from ever escaping the visible area of the hero photo.

### 3. Canvas Composition & Scaling
The share feature renders to an off-screen HTML5 `<canvas>`:
- The overlay's display coordinates are translated into proportional ratios:
  `relX = x / containerWidth`
  `relY = y / containerHeight`
  `relW = itemWidth / containerWidth`
  `relH = itemHeight / containerHeight`
- These ratios are applied to the canvas's render dimensions (`800x500` or natural image dimensions), making the positioning resolution-independent.
- A rounded semi-transparent pill is drawn behind the Fastor logo on the canvas to ensure high contrast regardless of the background imagery.

---

## CORS & The Tainted Canvas Caveat

When drawing images from third-party domains (such as external AWS S3 buckets) onto an HTML `<canvas>`, the browser's security model marks the canvas as **tainted** unless the remote server responds with appropriate CORS headers (`Access-Control-Allow-Origin`).
- Staging S3 buckets often lack CORS headers or return 404 for specific uploaded assets.
- Attempting `canvas.toBlob()` or `canvas.toDataURL()` on a tainted canvas throws a `SecurityError`.
- **Handling Strategy**:
  1. All external images are requested with `img.crossOrigin = 'anonymous'`.
  2. If the background image fails to load or triggers an error, the canvas falls back to drawing a dark gradient card accented with Fastor branding and the restaurant name.
  3. The blob generation step is wrapped in a `try...catch`. If a tainted canvas exception occurs, an un-tainted local fallback canvas is instantly created and exported, accompanied by a polite feedback notice informing the user that CORS restrictions prevented direct export of the external host image.

---

## What I'd Add Next

1. **State Persistence for Draft Reviews / Bookings**: Retain active filter selections and search states using query parameters or session storage.
2. **Pinch-to-Scale and Rotation**: Enable two-finger gestures on mobile for resizing or angling the overlay logo prior to generating the share graphic.
3. **Optimized Image CDN / Proxy**: Route remote restaurant images through an edge worker (e.g. Cloudflare Worker or Next.js Image Optimization) to resize, convert to WebP, and provide clean CORS headers for export.
4. **End-to-End Testing**: Introduce Playwright tests running against mock service workers (MSW) to verify multi-step user journeys in actual browser engines.
