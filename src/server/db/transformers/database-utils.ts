import { z } from "zod";
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
// ✅ Date input (Date object or string) → output string (ISO using your util)
export const zDateToString = z.preprocess(
  (val) => {
    try {
      return toISOString(val as Date | string);
    } catch {
      return val; // let Zod handle validation error
    }
  },
  z.string().refine(
    (str) => {
      const parsed = new Date(str);
      return !isNaN(parsed.getTime());
    },
    {
      message: "Invalid date string",
    },
  ),
);

// ✅ Array of strings → string (JSON.stringify)
export const zStringArrayToJSONString = z.preprocess(
  (val) => {
    if (Array.isArray(val) && val.every((v) => typeof v === "string")) {
      return JSON.stringify(val);
    }
    return val;
  },
  z.string().refine(
    (str) => {
      try {
        const parsed = JSON.parse(str);
        return (
          Array.isArray(parsed) && parsed.every((v) => typeof v === "string")
        );
      } catch {
        return false;
      }
    },
    {
      message: "Invalid array string (must be JSON stringified string[])",
    },
  ),
);

// ✅ Number input → string output
export const zNumberToString = z.preprocess(
  (val) => {
    if (typeof val === "number" && !isNaN(val)) {
      return val.toString();
    }
    return val;
  },
  z.string().refine((str) => !isNaN(Number(str)), {
    message: "Invalid number string",
  }),
);
