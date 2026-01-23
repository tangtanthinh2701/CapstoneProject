import { apiClient, type ApiResponse } from '../utils/api';
import type {
  TreeSpecies,
  TreeSpeciesCreateRequest,
  TreeSpeciesUpdateRequest,
  TreeBatch,
  TreeBatchCreateRequest,
  TreeBatchUpdateRequest,
  TreeGrowthRecord,
  TreeGrowthRecordCreateRequest,
  TreeGrowthRecordUpdateRequest,
  BatchCO2Summary,
  FarmCO2Summary,
} from '../models/treeSpecies.model';

// ==================== TREE SPECIES SERVICE ====================

export const treeSpeciesService = {
  // ADMIN CRUD
  async createSpecies(data: TreeSpeciesCreateRequest): Promise<ApiResponse<TreeSpecies>> {
    return apiClient.post<TreeSpecies>('/tree-species', data as unknown as Record<string, unknown>);
  },

  async updateSpecies(
    id: number,
    data: TreeSpeciesUpdateRequest,
  ): Promise<ApiResponse<TreeSpecies>> {
    return apiClient.put<TreeSpecies>(
      `/tree-species/${id}`,
      data as unknown as Record<string, unknown>,
    );
  },

  async deleteSpecies(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/tree-species/${id}`);
  },

  // USER READ
  async getAllSpecies(page = 0, size = 20): Promise<ApiResponse<TreeSpecies[]>> {
    return apiClient.get<TreeSpecies[]>('/tree-species', { page, size });
  },

  async getSpeciesById(id: number): Promise<ApiResponse<TreeSpecies>> {
    return apiClient.get<TreeSpecies>(`/tree-species/${id}`);
  },

  async getTopCarbonSpecies(limit = 10): Promise<ApiResponse<TreeSpecies[]>> {
    return apiClient.get<TreeSpecies[]>('/tree-species/top-carbon', { limit });
  },
};

// ==================== TREE BATCH SERVICE ====================

export const treeBatchService = {
  // ADMIN CRUD
  async createBatch(data: TreeBatchCreateRequest): Promise<ApiResponse<TreeBatch>> {
    return apiClient.post<TreeBatch>('/tree-batches', data as unknown as Record<string, unknown>);
  },

  async updateBatch(id: number, data: TreeBatchUpdateRequest): Promise<ApiResponse<TreeBatch>> {
    return apiClient.put<TreeBatch>(
      `/tree-batches/${id}`,
      data as unknown as Record<string, unknown>,
    );
  },

  async deleteBatch(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/tree-batches/${id}`);
  },

  // USER READ
  async getAllBatches(page = 0, size = 10): Promise<ApiResponse<TreeBatch[]>> {
    return apiClient.get<TreeBatch[]>('/tree-batches', { page, size });
  },

  async getBatchById(id: number): Promise<ApiResponse<TreeBatch>> {
    return apiClient.get<TreeBatch>(`/tree-batches/${id}`);
  },

  async getBatchesByFarm(farmId: number): Promise<ApiResponse<TreeBatch[]>> {
    return apiClient.get<TreeBatch[]>(`/tree-batches/farm/${farmId}`);
  },

  async getBatchesByPhase(phaseId: number): Promise<ApiResponse<TreeBatch[]>> {
    return apiClient.get<TreeBatch[]>(`/tree-batches/phase/${phaseId}`);
  },
};

// ==================== TREE GROWTH RECORD SERVICE ====================

export const treeGrowthRecordService = {
  // ADMIN CRUD
  async createRecord(data: TreeGrowthRecordCreateRequest): Promise<ApiResponse<TreeGrowthRecord>> {
    return apiClient.post<TreeGrowthRecord>(
      '/tree-growth-records',
      data as unknown as Record<string, unknown>,
    );
  },

  async updateRecord(
    id: number,
    data: TreeGrowthRecordUpdateRequest,
  ): Promise<ApiResponse<TreeGrowthRecord>> {
    return apiClient.put<TreeGrowthRecord>(
      `/tree-growth-records/${id}`,
      data as unknown as Record<string, unknown>,
    );
  },

  async deleteRecord(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/tree-growth-records/${id}`);
  },

  async calculateCO2(id: number): Promise<ApiResponse<TreeGrowthRecord>> {
    return apiClient.post<TreeGrowthRecord>(`/tree-growth-records/${id}/calculate-co2`);
  },

  // READ
  async getRecordsByBatch(batchId: number): Promise<ApiResponse<TreeGrowthRecord[]>> {
    return apiClient.get<TreeGrowthRecord[]>(`/tree-growth-records/batch/${batchId}`);
  },

  async getLatestRecord(batchId: number): Promise<ApiResponse<TreeGrowthRecord>> {
    return apiClient.get<TreeGrowthRecord>(`/tree-growth-records/batch/${batchId}/latest`);
  },

  async getTotalCO2ByBatch(batchId: number): Promise<ApiResponse<BatchCO2Summary>> {
    return apiClient.get<BatchCO2Summary>(`/tree-growth-records/batch/${batchId}/total-co2`);
  },

  async getTotalCO2ByFarm(farmId: number): Promise<ApiResponse<FarmCO2Summary>> {
    return apiClient.get<FarmCO2Summary>(`/tree-growth-records/farm/${farmId}/total-co2`);
  },

  async getUnhealthyRecords(): Promise<ApiResponse<TreeGrowthRecord[]>> {
    return apiClient.get<TreeGrowthRecord[]>('/tree-growth-records/unhealthy');
  },
};
