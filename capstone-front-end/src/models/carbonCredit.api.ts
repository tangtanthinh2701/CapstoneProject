import api from '../utils/api';

export interface CarbonCredit {
  id: number;
  creditCode: string;
  totalCo2Tons: number;
  creditsIssued: number;
  creditsAvailable: number;
  basePricePerCredit: number;
  creditStatus: string;
}

export const carbonCreditApi = {
  getAll: (params?: any) => api.get('/carbon-credits', { params }),
  mint: (data: any) => api.post('/carbon-credits', data),
  verify: (id: number | string) => api.post(`/carbon-credits/${id}/verify`),
  purchase: (data: { creditId: number | string; quantity: number }) => api.post('/carbon-credits/purchase', data),
  retire: (data: { creditId: number | string; quantity: number; reason: string }) => api.post('/carbon-credits/retire', data),
  getSummary: () => api.get('/carbon-credits/summary'),
};
