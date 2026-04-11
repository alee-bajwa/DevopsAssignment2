/**
 * Account service
 */
import api from './api';

const accountService = {
  /**
   * Get user accounts
   */
  getAccounts: async () => {
    const response = await api.get('/api/accounts/me');
    return response.data;
  },

  /**
   * Get account balance
   */
  getBalance: async () => {
    const response = await api.get('/api/accounts/me/balance');
    return response.data;
  }
};

export default accountService;

