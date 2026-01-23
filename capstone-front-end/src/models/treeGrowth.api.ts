import api from '../utils/api';

export interface TreeGrowthRecord {
    id: number;
    batchId: number;
    recordedDate: string;
    quantityAlive: number;
    quantityDead?: number;
    avgHeightCm?: number;
    avgTrunkDiameterCm?: number;
    avgCanopyDiameterCm?: number;
    healthStatus?: 'HEALTHY' | 'DISEASED' | 'STRESSED';
    co2AbsorbedKg?: number;
    healthNotes?: string;
}

export const treeGrowthApi = {
    create: (data: any) => api.post('/tree-growth-records', data),
    calculateCo2: (id: number | string) => api.post(`/tree-growth-records/${id}/calculate-co2`),
    getSummary: (batchId: number | string) => api.get(`/tree-growth-records/batch/${batchId}/co2-summary`),
    getRecordsByBatchId: (batchId: number | string) => api.get('/tree-growth-records', { params: { batchId } }),
};
