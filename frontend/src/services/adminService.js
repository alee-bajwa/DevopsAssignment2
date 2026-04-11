/**
 * Admin service
 */
import api from './api';

const adminService = {
  /**
   * Get admin dashboard statistics
   */
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  /**
   * Get all users
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Get all transactions
   */
  getTransactions: async (params = {}) => {
    const response = await api.get('/api/admin/transactions', { params });
    return response.data;
  },

  /**
   * Get admin actions
   */
  getActions: async (params = {}) => {
    const response = await api.get('/api/admin/actions', { params });
    return response.data;
  }
};

export default adminService;

