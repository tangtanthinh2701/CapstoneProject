import { apiClient, type ApiResponse } from '../utils/api';
import type {
  Farm,
  FarmCreateRequest,
  FarmUpdateRequest,
  FarmAreaInfo,
  FarmSummary,
} from '../models/farm.model';

const BASE_PATH = '/farms';

export const farmService = {
  // ==================== FARM CRUD (ADMIN) ====================

  async createFarm(data: FarmCreateRequest): Promise<ApiResponse<Farm>> {
    return apiClient.post<Farm>(BASE_PATH, data as unknown as Record<string, unknown>);
  },

  async updateFarm(id: number, data: FarmUpdateRequest): Promise<ApiResponse<Farm>> {
    return apiClient.put<Farm>(`${BASE_PATH}/${id}`, data as unknown as Record<string, unknown>);
  },

  async deleteFarm(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },

  // ==================== FARM READ ====================

  async getAllFarms(page = 0, size = 10): Promise<ApiResponse<Farm[]>> {
    return apiClient.get<Farm[]>(BASE_PATH, { page, size });
  },

  async getFarmById(id: number): Promise<ApiResponse<Farm>> {
    return apiClient.get<Farm>(`${BASE_PATH}/${id}`);
  },

  async getFarmAreaInfo(id: number): Promise<ApiResponse<FarmAreaInfo>> {
    return apiClient.get<FarmAreaInfo>(`${BASE_PATH}/${id}/area-info`);
  },

  async getFarmSummary(): Promise<ApiResponse<FarmSummary>> {
    return apiClient.get<FarmSummary>(`${BASE_PATH}/summary`);
  },

  async getFarmsByProject(projectId: number): Promise<ApiResponse<Farm[]>> {
    return apiClient.get<Farm[]>(`${BASE_PATH}/project/${projectId}`);
  },
};
