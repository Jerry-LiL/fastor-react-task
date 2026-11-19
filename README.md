# Fastor React Task

Take-home for Fastor's frontend role: a mobile-first React app built from their corrected Figma ("Mobile-App-Design-Task"). Four screens:

1. Sign up with a phone number (`/login`)
2. 6-digit OTP with a 30s resend timer (`/otp`)
3. Home: best sellers, promo carousel, recent orders (`/`)
4. Product detail with quantity, portion choice and add to cart (`/item/:id`)

## Stack

React 18, Vite, React Router 6, Vitest + React Testing Library.

## Running

```bash
npm install
npm run dev
npm test
npm run build
```

The staging OTP is `123456`.

## API

Uses Fastor's staging API (`https://staging.fastor.ai`, override with `VITE_API_BASE`):

- `POST /v1/pwa/user/register` sends the OTP
- `POST /v1/pwa/user/login` verifies it and returns a token
- `GET /v1/m/restaurant?city_id=118` is wired up in `src/api/fastor.js` but not used by the new design

```bash
curl -X POST https://staging.fastor.ai/v1/pwa/user/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "phone=9818979450&otp=123456&dial_code=+91"
```

## Notes

- The API has no menu, portion or order endpoints, so dishes and past orders live in `src/data/menu.js`.
- The Figma mixes `$` and `₹`; I used `₹` everywhere since the rest of the design is Indian (+91, Delhi).
- Token, user and cart are kept in `localStorage`; home and product pages are behind a protected route.
- Food photos in `public/images/` are from Unsplash.

## TODO

- Cart / checkout screen
- Real menu and order endpoints
- Driver tracking instead of the placeholder toast
