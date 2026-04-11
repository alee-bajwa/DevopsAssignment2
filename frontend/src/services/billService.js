/**
 * Bill service
 */
import api from './api';

const billService = {
  /**
   * Get all bill services
   */
  getBillServices: async () => {
    const response = await api.get('/api/bills/services');
    return response.data;
  },

  /**
   * Pay a bill
   */
  payBill: async (billData) => {
    const response = await api.post('/api/bills/pay', billData);
    return response.data;
  }
};

export default billService;

