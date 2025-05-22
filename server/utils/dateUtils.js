// server/utils/dateUtils.js
/**
 * Validates that end date is after start date
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
};

/**
 * Calculate the number of days between two dates
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {number} - Number of days
 */
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  return diffDays;
};

module.exports = {
  isValidDateRange,
  calculateDays
};