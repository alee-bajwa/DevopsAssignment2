/**
 * Transaction service
 */
import api from './api';

const transactionService = {
  /**
   * Get user transactions
   */
  getTransactions: async (params = {}) => {
    const response = await api.get('/api/transactions/me', { params });
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id) => {
    const response = await api.get(`/api/transactions/${id}`);
    return response.data;
  },

  /**
   * Transfer money
   */
  transfer: async (transferData) => {
    const response = await api.post('/api/transactions/transfer', transferData);
    return response.data;
  },

  /**
   * Withdraw money
   */
  withdraw: async (withdrawData) => {
    const response = await api.post('/api/transactions/withdraw', withdrawData);
    return response.data;
  },

  /**
   * Deposit money (admin only)
   */
  deposit: async (depositData) => {
    const response = await api.post('/api/transactions/deposit', depositData);
    return response.data;
  }
};

export default transactionService;

