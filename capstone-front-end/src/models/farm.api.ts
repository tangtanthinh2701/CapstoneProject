import api from '../utils/api';

export interface Farm {
  id: number;
  code: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  usableArea: number;
  soilType: string;
  climateZone: string;
  avgRainfall: number;
  avgTemperature: number;
  farmStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  totalBatches?: number;
  totalTrees?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddTreeToFarmPayload {
  farmId: number;
  treeSpeciesId: number;
  numberTrees: number;
  latitude: number;
  longitude: number;
  plantingDate: string;
  currentAvgHeight?: number;
  currentAvgTrunkDiameter?: number;
  currentAvgCanopyDiameter?: number;
}

export const farmApi = {
  getAll: (params?: any) => api.get('/farms', { params }),
  getMyFarms: (params?: any) => api.get('/farms/my-farms', { params }),
  getById: (id: number | string) => api.get<Farm>(`/farms/${id}`),
  getByCode: (code: string) => api.get(`/farms/code/${code}`),
  getByStatus: (status: string, params?: any) => api.get(`/farms/status/${status}`, { params }),
  search: (keyword: string, params?: any) => api.get(`/farms/search`, { params: { ...params, keyword } }),
  create: (data: any) => api.post('/farms', data),
  update: (id: number | string, data: any) => api.put(`/farms/${id}`, data),
  delete: (id: number | string) => api.delete(`/farms/${id}`),
  getTrees: (farmId: number | string) => api.get(`/farms/${farmId}/trees`),
  addTree: (farmId: number | string, data: AddTreeToFarmPayload) => api.post(`/farms/${farmId}/trees`, data),
};

// Legacy exports for backward compatibility
export const deleteFarm = (id: number | string) => api.delete(`/farms/${id}`);
export const addTreeToFarm = (data: AddTreeToFarmPayload) => api.post(`/farms/${data.farmId}/trees`, data);
