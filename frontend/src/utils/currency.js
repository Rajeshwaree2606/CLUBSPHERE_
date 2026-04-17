/**
 * Format amount to Indian Rupee currency
 * @param {number} amount - The amount to format
 * @param {boolean} withDecimals - Include decimal places (default: false)
 * @returns {string} - Formatted rupee amount (e.g., "₹1,000" or "₹1,000.00")
 */
export const formatCurrency = (amount, withDecimals = false) => {
  if (amount === null || amount === undefined) return '₹0';
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '₹0';

  // Format with Indian numbering system (lakhs, crores)
  const formatted = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });

  return `₹${formatted}`;
};

/**
 * Format amount without currency symbol (for display in lists, etc.)
 * @param {number} amount
 * @param {boolean} withDecimals
 * @returns {string}
 */
export const formatAmount = (amount, withDecimals = false) => {
  if (amount === null || amount === undefined) return '0';
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '0';

  return numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });
};
