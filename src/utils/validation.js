/**
 * Validates whether the given phone number is exactly 10 digits.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhoneNumber(phone) {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.trim();
  return /^\d{10}$/.test(cleaned);
}

/**
 * Validates whether the given OTP is exactly 6 digits.
 * @param {string} otp
 * @returns {boolean}
 */
export function isValidOtp(otp) {
  if (typeof otp !== 'string') return false;
  const cleaned = otp.trim();
  return /^\d{6}$/.test(cleaned);
}
