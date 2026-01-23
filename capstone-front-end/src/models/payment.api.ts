import api from '../utils/api';

export interface PaymentTransaction {
  id: number;
  paymentCode: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
}

export const paymentApi = {
  createVnpay: (data: any) => api.post('/payments/vnpay/create', data),
  vnpayReturn: (params: any) => api.get('/payments/vnpay/return', { params }),
  getMyHistory: (params?: any) => api.get('/user/transactions', { params }),
  getAll: (params?: any) => api.get('/admin/transactions', { params }),
};
