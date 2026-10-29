# Fastor Take-Home Assignment (React Track)

A mobile-first web application built with React 18 and Vite for Fastor's frontend assignment. It implements a phone number and OTP authentication flow, a restaurant discovery home view, and a restaurant detail page featuring a draggable Fastor logo superimposed onto the restaurant image with native image sharing and download fallbacks.

Built with AI assistance (Google Antigravity) and reviewed by me.

---

## The Flow

1. **Login Screen (`/login`)**: The user enters a 10-digit mobile number. Submitting calls the Fastor registration endpoint and routes to the OTP verification screen.
2. **OTP Verification Screen (`/otp`)**: A 6-box input field supporting auto-advancing, backspace navigation, and pasting a full code. Entering the default OTP (`123456`) authenticates the user, stores the JWT token, and redirects to the Home screen. A resend button is provided to re-trigger OTP dispatch.
3. **Home Screen (`/`)**: Displays the pre-order location header, a user greeting card with quick action triggers (Offers and Wallet), a horizontally scrollable "Your taste" section, a promo banner carousel, and a vertical "Popular Ones" listing with restaurant cards. Clicking any restaurant routes to its detail view.
4. **Restaurant Detail Screen (`/restaurant/:id`)**: Shows the hero image with the Fastor logo placed at the visual center. Users can drag the logo across the hero image using mouse or touch gestures (constrained within the image bounds).
5. **Share Feature**: Clicking "Share" combines the restaurant picture and the repositioned Fastor logo onto an off-screen HTML5 canvas, exports a PNG blob, and invokes `navigator.share` on compatible mobile browsers (or triggers an automatic file download as a fallback).

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

The application interfaces with the Fastor staging API (`https://staging.fastor.ai`). The base URL is configurable via the `VITE_API_BASE` environment variable (defaults to `https://staging.fastor.ai`).

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
- **Note on Error Handling**: The Fastor staging API returns HTTP 200 with `status: "Failed"` and `error_message: "Incorrect OTP"` on invalid codes. The API client checks `body.status !== 'Success'` rather than relying solely on HTTP status codes.

### 3. Fetch Restaurants
- **Endpoint**: `GET /v1/m/restaurant?city_id=118`
- **Header**: `Authorization: Bearer <token>`
- **Curl Example**:
```bash
curl -X GET "https://staging.fastor.ai/v1/m/restaurant?city_id=118" \
  -H "Authorization: Bearer <token>"
```
- **Response**:
```json
{
  "status": "Success",
  "status_code": 200,
  "data": {
    "results": [
      {
        "restaurant_id": "75",
        "restaurant_name": "VYB",
        "address_complete": "Address, ssasasa, Andhra Pradesh, 110009, India",
        "logo": "https://fastor-d2c-shared-bucket-1.s3.ap-south-1.amazonaws.com/sugandham/uploads/1f4e8121-bda8-4c3b-b46f-a21a9389f276.png"
      }
    ],
    "meta": {
      "total_pages": 3,
      "total_count": 56
    }
  }
}
```

---

## Design Choices & Architecture

- **Modest, Clean Stack**: React 18 with Vite, standard `react-router-dom` v6, and vanilla CSS with design tokens. No heavy UI framework libraries (such as MUI or Tailwind) were added, keeping the bundle lightweight and the DOM footprint small.
- **Mobile-First Viewport**: The layout is styled mobile-first with a centered 430px maximum width container on desktop screens to preserve the native mobile app feel.
- **Design Tokens**: Coral primary color `#FF6D6A` (`#FF5552` on hover), neutral gray palette, and Google Fonts (`Urbanist` and `Inter`) closely matching the reference Figma design.
- **Pointer Events for Dragging**: The draggable logo overlay relies on pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) paired with `setPointerCapture` and `touch-action: none`. This works across modern desktop mice, trackpads, iOS Safari, and Android Chrome without requiring third-party drag-and-drop libraries.
- **Clamping Logic**: Boundary calculation lives in a pure utility (`clampOverlayPosition`) that enforces containment within the hero image frame at all times.

---

## Assumptions & Fallbacks

- **Incomplete API Fields**: The staging API response provides only `restaurant_id`, `restaurant_name`, `address_complete`, and `logo`. Crucial design elements like rating, cuisine types, price for two, and offer descriptions do not exist in the API schema. These are provided as explicit static constants (`RESTAURANT_DEFAULTS` in `src/utils/constants.js`) to adhere to the Figma design mockups.
- **Malformed Address Handling**: The API frequently returns the literal string `"null"` for `address_complete`. The UI detects this string and falls back to `"Connaught Place, New Delhi"`.
- **Remote Image Availability & CORS**: Staging image URLs point to an AWS S3 bucket that currently returns 404 or lacks permissive CORS response headers for third-party canvas manipulation. The application implements an `onError` fallback to an inline SVG placeholder, and an un-tainted canvas fallback that generates a clean branded card if cross-origin image retrieval is blocked.
- **Approximated Figma Layout**: I couldn't open the Figma file itself without a login, only its public preview thumbnail (all four screens at low resolution). Padding, radii and font sizes are eyeballed from that, so they won't be pixel exact.

---

## How Sharing Works & Browser Support

1. The user moves the Fastor logo overlay to their desired position on the restaurant hero image.
2. Clicking "Share" computes the normalized relative coordinates (`x / containerWidth`, `y / containerHeight`) of the logo.
3. An off-screen canvas is drawn at high resolution (800x500):
   - The base restaurant image is drawn with `crossOrigin = 'anonymous'`.
   - The Fastor logo SVG and background pill are composited at the computed proportional offset.
4. The canvas is converted to a PNG file blob using `canvas.toBlob()`.
5. If `navigator.canShare && navigator.canShare({ files: [file] })` evaluates to true (typically on mobile Safari, Android Chrome, and modern Edge/Chrome on mobile), the native system share sheet opens.
6. If the Web Share API is unsupported or rejects with a non-abort error, the application automatically triggers a file download of the composite PNG and notifies the user.
7. If the canvas is tainted due to external host CORS restrictions, the system falls back to generating a branded graphic containing the restaurant name and positioned logo, ensuring the user always receives a valid export.

---

## What I'd Improve Next

- **Infinite Scrolling / Pagination**: Add cursor or page-based infinite scroll for the restaurant list using the `meta.total_pages` returned by the API.
- **Search & Filtering**: Add a live search bar and filter chips for cuisine types or vegetarian-friendly tags on the home screen.
- **HttpOnly Cookie Auth**: Transition from `localStorage` JWT token storage to secure, `httpOnly`, `SameSite=Lax` session cookies managed by a backend or BFF.
- **Proxy Image Endpoint**: Implement a lightweight image proxy on the server side to attach proper `Access-Control-Allow-Origin: *` headers, ensuring arbitrary third-party S3 images never taint the HTML5 canvas.
- **Gesture Enhancements**: Add pinch-to-zoom and rotation support for the superimposed logo alongside the current translation drag behavior.
