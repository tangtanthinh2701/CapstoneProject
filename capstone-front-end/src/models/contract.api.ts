import api from '../utils/api';

export interface Contract {
  id: number;
  contractCode: string;
  projectId: number;
  projectName?: string;
  projectCode?: string;
  contractType: 'OWNERSHIP' | 'INVESTMENT' | 'SERVICE' | 'CREDIT_PURCHASE';
  contractCategory?: string;
  totalValue: number;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  durationYears?: number;
  contractTermYears?: number;
  contractStatus: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  carbonCreditPercentage?: number;
  isRenewable?: boolean;
  content?: {
    treeCount?: number;
    carbonPercentage?: number;
    benefits?: string[];
  };
  renewalCount?: number;
  maxRenewals?: number;
  autoRenewal?: boolean;
  daysUntilExpiry?: number | null;
  earlyTerminationPenalty?: number;
  renewalTermYears?: number;
  canRenew?: boolean;
}

export const getAll = (params?: any) => api.get('/contracts', { params });
export const getMyContracts = (params?: any) => api.get('/contracts/my-contracts', { params });
export const getById = (id: number | string) => api.get<Contract>(`/contracts/${id}`);
export const getContractById = (id: number | string) => api.get<Contract>(`/contracts/${id}`);
export const create = (data: any) => api.post('/contracts', data);
export const submitContract = (id: number | string) => api.post(`/contracts/${id}/submit`);
export const approveContract = (id: number | string, data?: any) => api.post(`/contracts/${id}/approve`, data);
export const rejectContract = (id: number | string, reason: string) => api.post(`/contracts/${id}/reject`, null, { params: { reason } });
export const terminateContract = (id: number | string, data: any) => api.post(`/contracts/${id}/terminate`, data);
export const requestRenewal = (data: any) => api.post('/contracts/renewals', data);
export const approveRenewal = (renewalId: number | string, data?: any) => api.post(`/contracts/renewals/${renewalId}/approve`, data);

export const contractApi = {
  getAll,
  getMyContracts,
  getById,
  create,
  submitContract,
  approveContract,
  approve: approveContract,
  reject: rejectContract,
  terminate: terminateContract,
  requestRenewal,
  approveRenewal,
};
