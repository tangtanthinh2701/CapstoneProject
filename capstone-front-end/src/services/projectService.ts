import { apiClient, type ApiResponse } from '../utils/api';
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectPhase,
  PhaseCreateRequest,
  PhaseUpdateRequest,
  ProjectSummary,
} from '../models/project.model';

const BASE_PATH = '/projects';

export const projectService = {
  // ==================== PROJECT CRUD (ADMIN) ====================

  async createProject(data: ProjectCreateRequest): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(
      `${BASE_PATH}/create-projects`,
      data as unknown as Record<string, unknown>,
    );
  },

  async updateProject(id: number, data: ProjectUpdateRequest): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`${BASE_PATH}/${id}`, data as unknown as Record<string, unknown>);
  },

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },

  async recalculateProject(id: number): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(`${BASE_PATH}/${id}/recalculate`);
  },

  // ==================== PROJECT READ (USER) ====================

  async getAllProjects(page = 0, size = 10): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(BASE_PATH, { page, size });
  },

  async getPublicProjects(page = 0, size = 10): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(`${BASE_PATH}/public`, { page, size });
  },

  async getProjectById(id: number): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`${BASE_PATH}/${id}`);
  },

  async searchProjects(keyword: string, page = 0, size = 10): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(`${BASE_PATH}/search`, {
      keyword,
      page,
      size,
    });
  },

  async getProjectSummary(): Promise<ApiResponse<ProjectSummary>> {
    return apiClient.get<ProjectSummary>(`${BASE_PATH}/summary`);
  },

  // ==================== PHASE MANAGEMENT (ADMIN) ====================

  async addPhase(projectId: number, data: PhaseCreateRequest): Promise<ApiResponse<ProjectPhase>> {
    return apiClient.post<ProjectPhase>(
      `${BASE_PATH}/${projectId}/phases`,
      data as unknown as Record<string, unknown>,
    );
  },

  async updatePhase(
    projectId: number,
    phaseId: number,
    data: PhaseUpdateRequest,
  ): Promise<ApiResponse<ProjectPhase>> {
    return apiClient.put<ProjectPhase>(
      `${BASE_PATH}/${projectId}/phases/${phaseId}`,
      data as unknown as Record<string, unknown>,
    );
  },

  async deletePhase(projectId: number, phaseId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_PATH}/${projectId}/phases/${phaseId}`);
  },
};
