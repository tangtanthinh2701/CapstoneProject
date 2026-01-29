import api from '../utils/api';

export interface TreeBatch {
    id: number;
    batchCode: string;
    farmId: number;
    treeSpeciesId: number;
    phaseId?: number;
    quantityPlanted: number;
    plantingDate: string;
    plantingAreaM2?: number;
    supplierName?: string;
    unitCost?: number;
    totalCost?: number;
    batchStatus: 'ACTIVE' | 'COMPLETED' | 'REMOVED';
    notes?: string;
}

export const treeBatchApi = {
    getAll: (params?: any) => api.get('/tree-batches', { params }),
    getById: (id: number | string) => api.get<TreeBatch>(`/tree-batches/${id}`),
    getByCode: (code: string) => api.get(`/tree-batches/code/${code}`),
    create: (data: any) => api.post('/tree-batches', data),
    update: (id: number | string, data: any) => api.put(`/tree-batches/${id}`, data),
    delete: (id: number | string) => api.delete(`/tree-batches/${id}`),
    getTotalTreesByFarm: (farmId: number | string) => api.get(`/tree-batches/farm/${farmId}/total-trees`),
    getTotalAreaByFarm: (farmId: number | string) => api.get(`/tree-batches/farm/${farmId}/total-area`),
};
