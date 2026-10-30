const DEFAULT_API_BASE = 'https://staging.fastor.ai';

export const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  DEFAULT_API_BASE;

/**
 * Sends OTP to the specified phone number.
 * @param {string} phone
 * @param {string} dialCode
 * @returns {Promise<any>}
 */
export async function registerUser(phone, dialCode = '+91') {
  const body = new URLSearchParams();
  body.append('phone', phone);
  body.append('dial_code', dialCode);

  const response = await fetch(`${API_BASE}/v1/pwa/user/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.status !== 'Success') {
    const errorMsg =
      (json && (json.error_message || json.message)) ||
      'Failed to send OTP. Please try again.';
    const err = new Error(errorMsg);
    err.response = json;
    throw err;
  }

  return json;
}

/**
 * Verifies OTP and returns user data including JWT token.
 * Note: Fastor API can return HTTP 200 with status="Failed" on incorrect OTP.
 * @param {string} phone
 * @param {string} otp
 * @param {string} dialCode
 * @returns {Promise<{ token: string, user_name?: string, [key: string]: any }>}
 */
export async function loginWithOtp(phone, otp, dialCode = '+91') {
  const body = new URLSearchParams();
  body.append('phone', phone);
  body.append('otp', otp);
  body.append('dial_code', dialCode);

  const response = await fetch(`${API_BASE}/v1/pwa/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.status !== 'Success') {
    const errorMsg =
      (json && (json.error_message || json.message)) ||
      'Incorrect OTP. Please try again.';
    const err = new Error(errorMsg);
    err.response = json;
    throw err;
  }

  return json.data;
}

/**
 * Fetches restaurant listing for a city.
 * @param {string} token
 * @param {number|string} cityId
 * @returns {Promise<Array<any>>}
 */
export async function fetchRestaurants(token, cityId = 118) {
  if (!token) {
    throw new Error('Authentication token is required to fetch restaurants.');
  }

  const response = await fetch(`${API_BASE}/v1/m/restaurant?city_id=${cityId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.status !== 'Success') {
    const errorMsg =
      (json && (json.error_message || json.message)) ||
      'Failed to load restaurants.';
    const err = new Error(errorMsg);
    err.response = json;
    throw err;
  }

  return json.data?.results || [];
}

/**
 * Alias for fetchRestaurants to match collection naming.
 */
export const getRestaurants = fetchRestaurants;

