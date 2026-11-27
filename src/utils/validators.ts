// One home for the validation rules every form shares.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(07[0124-8]|011|02[1-7]|03[1-8]|04[1-7]|05[1-7]|06[3-7]|081|091)\d{7}$/;

export const required = (message: string) => (value: string | null | undefined) =>
  value?.trim() ? null : message;

// Spaces are allowed while typing (077 123 4567); callers strip them with `digitsOnly` on save.
export const digitsOnly = (value: string) => value.replace(/\s+/g, '');

export const phone = (value: string) =>
  PHONE_REGEX.test(digitsOnly(value))
    ? null
    : 'Enter a 10-digit Sri Lankan mobile or landline number, like 077 123 4567.';

export const email = (value: string) =>
  EMAIL_REGEX.test(value) ? null : 'Enter a valid email address, like name@example.lk.';

export const optionalEmail = (value: string) =>
  !value || EMAIL_REGEX.test(value) ? null : email(value);

export const password = (value: string) =>
  value.length >= 8 ? null : 'Password must be at least 8 characters.';

// Banking identifiers stay strings so leading zeros survive.
export const accountNumber = (value: string) =>
  /^[A-Za-z0-9-]{4,34}$/.test(value.trim())
    ? null
    : 'Account number must be 4–34 letters, digits or dashes.';
