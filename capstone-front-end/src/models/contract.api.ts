import api from '../utils/api';

export interface Contract {
  id: number;
  contractCode: string;
  projectId: number;
  contractType: 'OWNERSHIP' | 'INVESTMENT' | 'SERVICE' | 'CREDIT_PURCHASE';
  totalValue: number;
  startDate: string;
  endDate?: string;
  durationYears?: number;
  contractStatus: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  carbonCreditPercentage?: number;
  isRenewable?: boolean;
}

export const contractApi = {
  getAll: (params?: any) => api.get('/contracts', { params }),
  getMyContracts: (params?: any) => api.get('/contracts/my-contracts', { params }),
  getById: (id: number | string) => api.get<Contract>(`/contracts/${id}`),
  create: (data: any) => api.post('/contracts', data),

  approve: (id: number | string, data?: any) => api.post(`/contracts/${id}/approve`, data),
  reject: (id: number | string, reason: string) => api.post(`/contracts/${id}/reject`, null, { params: { reason } }),
  terminate: (id: number | string, data: any) => api.post(`/contracts/${id}/terminate`, data),

  requestRenewal: (data: any) => api.post('/contracts/renewals', data),
  approveRenewal: (renewalId: number | string, data?: any) => api.post(`/contracts/renewals/${renewalId}/approve`, data),
};
