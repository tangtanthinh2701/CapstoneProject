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
    create: (data: any) => api.post('/tree-batches', data),
    getMyAllocations: (params?: any) => api.get('/user/allocations', { params }),
};
