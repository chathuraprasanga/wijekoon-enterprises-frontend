// One home for the validation rules every form shares.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(070|071|072|074|075|076|077|078)\d{7}$/;

export const required = (message: string) => (value: string | null | undefined) =>
  value?.trim() ? null : message;

// Spaces are allowed while typing (077 123 4567); callers strip them with `digitsOnly` on save.
export const digitsOnly = (value: string) => value.replace(/\s+/g, '');

export const phone = (value: string) =>
  PHONE_REGEX.test(digitsOnly(value))
    ? null
    : 'Enter a 10-digit Sri Lankan mobile number, like 077 123 4567.';

export const email = (value: string) =>
  EMAIL_REGEX.test(value) ? null : 'Enter a valid email address, like name@example.lk.';

export const optionalEmail = (value: string) =>
  !value || EMAIL_REGEX.test(value) ? null : email(value);

export const password = (value: string) =>
  value.length >= 8 ? null : 'Password must be at least 8 characters.';
