/**
 * Generates a unique 12-digit account number.
 * Format: BV + timestamp-based suffix padded to 12 digits total.
 */
function generateAccountNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BV${timestamp}${random}`;
}

module.exports = { generateAccountNumber };
