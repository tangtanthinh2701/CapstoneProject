import axios from 'axios';
import type {
  Partner,
  PartnerRequest,
  ProjectPartner,
  ProjectPartnerRequest,
  ApiResponse,
} from '../models/partner.model';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const partnerService = {
  // ==================== PARTNER CRUD ====================

  async getAllPartners(
    page = 0,
    size = 10,
    sortBy = 'id',
    sortDir = 'desc',
  ): Promise<ApiResponse<Partner[]>> {
    const response = await api.get('/partners', {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  async getPartnerById(id: number): Promise<ApiResponse<Partner>> {
    const response = await api.get(`/partners/${id}`);
    return response.data;
  },

  async createPartner(data: PartnerRequest): Promise<ApiResponse<Partner>> {
    const response = await api.post('/partners', data);
    return response.data;
  },

  async updatePartner(
    id: number,
    data: PartnerRequest,
  ): Promise<ApiResponse<Partner>> {
    const response = await api.put(`/partners/${id}`, data);
    return response.data;
  },

  async deletePartner(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
  },

  async searchPartners(
    keyword: string,
    page = 0,
    size = 10,
  ): Promise<ApiResponse<Partner[]>> {
    const response = await api.get('/partners/search', {
      params: { keyword, page, size },
    });
    return response.data;
  },

  // ==================== PROJECT PARTNER ====================

  async createProjectPartner(
    data: ProjectPartnerRequest,
  ): Promise<ApiResponse<ProjectPartner>> {
    const response = await api.post('/partners/project-partner', data);
    return response.data;
  },

  async getProjectPartnerById(
    id: number,
  ): Promise<ApiResponse<ProjectPartner>> {
    const response = await api.get(`/partners/project-partner/${id}`);
    return response.data;
  },

  async updateProjectPartner(
    id: number,
    data: ProjectPartnerRequest,
  ): Promise<ApiResponse<ProjectPartner>> {
    const response = await api.put(`/partners/project-partner/${id}`, data);
    return response.data;
  },

  async deleteProjectPartner(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/partners/project-partner/${id}`);
    return response.data;
  },

  async getPartnersByProjectId(
    projectId: number,
  ): Promise<ApiResponse<ProjectPartner[]>> {
    const response = await api.get(`/partners/project/${projectId}`);
    return response.data;
  },

  async getProjectsByPartnerId(
    partnerId: number,
  ): Promise<ApiResponse<ProjectPartner[]>> {
    const response = await api.get(`/partners/${partnerId}/projects`);
    return response.data;
  },
};
