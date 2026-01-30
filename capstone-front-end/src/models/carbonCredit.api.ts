import api from '../utils/api';
import type {
  CarbonCredit,
  CarbonCreditRequest,
  CreditSummary,
  CreditAllocation
} from './carbonCredit.model';

export const carbonCreditApi = {
  // Main CRUD
  getAll: (params?: any) => api.get<CarbonCredit[]>('/carbon-credits', { params }),
  getById: (id: number | string) => api.get<CarbonCredit>(`/carbon-credits/${id}`),
  getByCode: (code: string) => api.get<CarbonCredit>(`/carbon-credits/code/${code}`),
  getByStatus: (status: string, params?: any) => api.get<CarbonCredit[]>(`/carbon-credits/status/${status}`, { params }),
  getByProject: (projectId: number | string, params?: any) => api.get<CarbonCredit[]>(`/carbon-credits/project/${projectId}`, { params }),
  getAvailable: (params?: any) => api.get<CarbonCredit[]>('/carbon-credits/available', { params }),

  create: (data: CarbonCreditRequest) => api.post<CarbonCredit>('/carbon-credits', data),
  update: (id: number | string, data: Partial<CarbonCreditRequest>) => api.put<CarbonCredit>(`/carbon-credits/${id}`, data),
  delete: (id: number | string) => api.delete(`/carbon-credits/${id}`),

  // Verification
  verify: (id: number | string) => api.post<CarbonCredit>(`/carbon-credits/${id}/verify`),

  // Summary
  getSummary: () => api.get<CreditSummary>('/carbon-credits/summary'),
  getSummaryByProject: (projectId: number | string) => api.get<CreditSummary>(`/carbon-credits/summary/project/${projectId}`),

  // Allocations
  allocate: (creditId: number | string) => api.post(`/carbon-credits/${creditId}/allocate`),
  getAllocationsByCredit: (creditId: number | string) => api.get<CreditAllocation[]>(`/carbon-credits/${creditId}/allocations`),
  getAllocationsByOwner: (ownerId: string) => api.get<CreditAllocation[]>(`/carbon-credits/allocations/owner/${ownerId}`),
  claimAllocation: (allocationId: number | string) => api.post(`/carbon-credits/allocations/${allocationId}/claim`),

  // Transactions
  purchase: (data: { creditId: number; quantity: number; notes?: string }) => api.post('/carbon-credits/purchase', data),
};
