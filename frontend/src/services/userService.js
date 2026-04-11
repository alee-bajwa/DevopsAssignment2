/**
 * User service
 */
import api from './api';

const userService = {
  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    const response = await api.put('/api/users/me', userData);
    
    // Update user in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    const response = await api.put('/api/users/me/password', passwordData);
    return response.data;
  }
};

export default userService;

