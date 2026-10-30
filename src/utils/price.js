/**
 * Calculates the total price for an item based on unit price, portion extra charge, and quantity.
 * Formula: (unitPrice + portionExtra) * quantity
 *
 * @param {number|string} unitPrice - Base unit price
 * @param {number|string} portionExtra - Additional price for selected portion
 * @param {number|string} quantity - Number of items
 * @returns {number}
 */
export function calculateItemTotal(unitPrice = 0, portionExtra = 0, quantity = 1) {
  const base = parseFloat(unitPrice) || 0;
  const extra = parseFloat(portionExtra) || 0;
  const qty = parseInt(quantity, 10) || 1;
  const total = (base + extra) * Math.max(1, qty);
  return Math.round(total * 100) / 100;
}

/**
 * Formats a numeric price into Indian Rupee representation (e.g. ₹14.00).
 *
 * @param {number|string} amount
 * @returns {string}
 */
export function formatPrice(amount = 0) {
  const num = parseFloat(amount) || 0;
  return `₹${num.toFixed(2)}`;
}
