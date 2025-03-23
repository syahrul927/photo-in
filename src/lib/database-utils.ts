/**
 * Converts a JavaScript Date object or a date string to an ISO 8601 formatted string.
 * ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
 *
 * @param {Date | string} date - The Date object or date string to convert.
 * @returns {string} ISO 8601 formatted date string.
 * @throws {Error} If the provided date is invalid.
 */
export function toISOString(date: Date | string): string {
  // If the input is a string, convert it to a Date object
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Ensure the date is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date provided.");
  }

  // Return the ISO 8601 formatted string
  return dateObj.toISOString();
}
