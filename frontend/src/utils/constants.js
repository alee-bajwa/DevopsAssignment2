/**
 * Application constants
 */

export const API_BASE_URL = 'http://haki-bank-api-env.eba-kyvzrkx9.ap-southeast-1.elasticbeanstalk.com/';

export const COLORS = {
  primary: '#0066CC',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40'
};

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  BILL_PAYMENT: 'bill_payment',
  FEE: 'fee',
  ADJUSTMENT: 'adjustment'
};

export const TRANSACTION_DIRECTIONS = {
  CREDIT: 'credit',
  DEBIT: 'debit'
};

export const ACCOUNT_TYPES = {
  MAIN: 'main',
  SAVINGS: 'savings'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

