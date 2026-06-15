const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean =>
  EMAIL_PATTERN.test(email.trim());

export const isValidPassword = (password: string): boolean =>
  password.length >= 8;
