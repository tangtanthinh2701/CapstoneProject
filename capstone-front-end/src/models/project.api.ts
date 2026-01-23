import api from '../utils/api';

export interface Project {
  id: number;
  code: string;
  name: string;
  description?: string;
  managerId?: string;
  projectStatus: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalBudget?: number;
  actualCost?: number;
  targetCo2Kg?: number;
  actualCo2Kg?: number;
  isPublic: boolean;
  createdAt: string;
  phases?: ProjectPhase[];
  manager?: any; // User type
}

export interface ProjectPhase {
  id: number;
  projectId: number;
  phaseNumber: number;
  phaseName: string;
  description?: string;
  phaseStatus: 'PLANNING' | 'PLANTING' | 'GROWING' | 'MATURE' | 'HARVESTING' | 'COMPLETED';
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate: string;
  actualEndDate?: string;
  budget?: number;
  actualCost?: number;
  targetCo2Kg?: number;
  actualCo2Kg?: number;
  notes?: string;
}

export const projectApi = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getPublic: (params?: any) => api.get('/projects/public', { params }),
  search: (keyword: string, params?: any) => api.get('/projects/search', { params: { ...params, keyword } }),
  getById: (id: number | string) => api.get<Project>(`/projects/${id}`),
  create: (data: any) => api.post('/projects/create-projects', data),
  update: (id: number | string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number | string) => api.delete(`/projects/${id}`),

  // Phase management
  addPhase: (projectId: number | string, data: any) => api.post(`/projects/${projectId}/phases`, data),

  // Partner management
  addPartner: (projectId: number | string, data: any) => api.post(`/projects/${projectId}/partners`, data),
  removePartner: (projectId: number | string, partnerId: string) => api.delete(`/projects/${projectId}/partners/${partnerId}`),

  // Farm assignment
  assignFarm: (projectId: number | string, farmId: number | string) => api.post(`/projects/${projectId}/farms/${farmId}`),
  removeFarm: (projectId: number | string, farmId: number | string) => api.delete(`/projects/${projectId}/farms/${farmId}`),
};
