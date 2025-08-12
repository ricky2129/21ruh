import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

/**
 * Checks if a given string is a valid email address.
 * The validation is based on the following RegEx pattern: ^\S+@\S+\.\S+$
 * @param {string} email The email address to validate.
 * @returns {boolean} True if the given string is a valid email address, false otherwise.
 */
export const validateEmail = (email) => {
  const emailPattern = /^\S+@\S+\.\S+$/;

  return emailPattern.test(email);
};
/**
 * Replaces the url params in a given url with the provided params.
 * Example:
 * resolveUrlParams('https://example.com/:id', { id: '123' }) // 'https://example.com/123'
 * @param {string} url The url to replace the params in.
 * @param {Object.<string,string>=} params The parameters to replace in the url.
 * @return {string} The url with the replaced parameters.
 */
export const resolveUrlParams = (
  url: string,
  params: { [key: string]: string } = {},
) => {
  let updatedUrl = url;
  Object.keys(params).forEach((key) => {
    updatedUrl = updatedUrl.replace(`:${key}`, params[key]);
  });
  return updatedUrl;
};

/**
 * Converts a given value from a given unit to seconds.
 * @param {number} value The value to convert.
 * @param {string} unit The unit of the given value. Can be one of "seconds", "minutes", "hours".
 * @returns {number} The given value converted to seconds.
 */
export const convertToSeconds = (value: number, unit: string): number => {
  switch (unit) {
    case "seconds":
      return value;
    case "minutes":
      return value * 60;
    case "hours":
      return value * 60 * 60;
    default:
      return value;
  }
};

/**
 * Converts a given duration in seconds to the nearest time unit (seconds, minutes, hours).
 * @param {number} seconds The duration in seconds.
 * @returns {string} The given duration converted to the nearest time unit (seconds, minutes, hours).
 */
export const convertSecondsToNearestTime = (seconds: number): string => {
  const duration = dayjs.duration(seconds, "seconds");

  const hours = duration.hours();
  const minutes = duration.minutes();

  if (hours > 0) {
    return `${hours} Hour`;
  } else if (minutes > 0) {
    return `${minutes} Min`;
  } else {
    return `${seconds} Sec`;
  }
};

/**
 * Validate a given string to ensure it matches the following pattern:
 * (<word>:<word> <word>:<word> ...)
 *
 * @param {string} value The string to validate.
 * @returns {Promise<void>} A promise that resolves if the string is valid, or rejects if it is not.
 */
export const validateTagPair = (_: any, value: string) => {
  const regex = /^(\w+:\w+\s)*(\w+:\w+)$/;

  if (regex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject("");
};

/**
 * Validate a given string to ensure it matches the format of a github repository URL:
 * https://github.com/<owner>/<repo>
 *
 * @param {string} value The string to validate.
 * @returns {Promise<void>} A promise that resolves if the string is valid, or rejects if it is not.
 */
export const validateGithubRepo = (_: any, value: string) => {
  const regex = /^https:\/\/github.com\/(.*?)\/(.*?)$/;
  if (regex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject("");
};

/**
 * Validates if the input string is a comma-separated list of alphanumeric words.
 *
 * The string can contain letters, numbers, spaces, and commas. It ensures that
 * no invalid characters are present.
 *
 * @param {string} _ Unused parameter.
 * @param {string} value The string to validate.
 * @returns {Promise<void>} A promise that resolves if the string is valid, or rejects if it is not.
 */
export const validateCommaSeparatedTags = (_: unknown, value: string) => {
  const regex = /^[a-zA-Z0-9\s,]+$/;
  if (regex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject("");
};
