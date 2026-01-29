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
  getById: (id: number | string) => api.get<Project>(`/projects/${id}`),
  getByCode: (code: string) => api.get(`/projects/code/${code}`),
  getByStatus: (status: string, params?: any) => api.get(`/projects/status/${status}`, { params }),
  search: (keyword: string, params?: any) => api.get('/projects/search', { params: { ...params, keyword } }),
  create: (data: any) => api.post('/projects/create-projects', data),
  update: (id: number | string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number | string) => api.delete(`/projects/${id}`),

  // Phase management
  getPhases: (projectId: number | string) => api.get(`/projects/${projectId}/phases`),
  addPhase: (projectId: number | string, data: any) => api.post(`/projects/${projectId}/phases`, data),
  updatePhase: (projectId: number | string, phaseId: number | string, data: any) => api.put(`/projects/${projectId}/phases/${phaseId}`, data),
  deletePhase: (projectId: number | string, phaseId: number | string) => api.delete(`/projects/${projectId}/phases/${phaseId}`),

  // Recalculation
  recalculate: (projectId: number | string) => api.post(`/projects/${projectId}/recalculate`),
  recalculateAll: () => api.post('/projects/recalculate-all'),

  // Partner management
  addPartner: (projectId: number | string, data: any) => api.post(`/projects/${projectId}/partners`, data),
  removePartner: (projectId: number | string, partnerUserId: string) => api.delete(`/projects/${projectId}/partners/${partnerUserId}`),
};
