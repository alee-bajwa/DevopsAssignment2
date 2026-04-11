/**
 * Form validation utilities
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateAccountNumber = (accountNumber) => {
  return accountNumber && accountNumber.length >= 10;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateFullName = (name) => {
  return name && name.trim().length >= 2;
};

