import api from '../utils/api';

export interface TreeGrowthRecord {
    id: number;
    batchId: number;
    recordedDate: string;
    quantityAlive: number;
    quantityDead: number;
    avgHeightCm: number;
    avgTrunkDiameterCm: number;
    avgCanopyDiameterCm: number;
    healthStatus: string;
    co2AbsorbedKg: number;
    environmentFactor: number;
    healthNotes: string;
    recordedBy: string | null;
    createdAt: string;
}

export interface GrowthRecordSummary {
    latestCO2Kg: number;
    latestRecordDate: string;
    totalCO2Kg: number;
    batchCode: string;
    totalCO2Tons: number;
    batchId: number;
}

export interface FarmGrowthSummary {
    farmName: string;
    totalCO2Kg: number;
    totalCO2Tons: number;
    totalTrees: number;
    farmId: number;
}

export const treeGrowthRecordApi = {
    // Create new record
    create: (data: Partial<TreeGrowthRecord>) => api.post('/tree-growth-records', data),

    // Update record
    update: (id: number, data: Partial<TreeGrowthRecord>) => api.put(`/tree-growth-records/${id}`, data),

    // Get all records (paginated usually, but keeping simple for now)
    getAll: () => api.get('/tree-growth-records'),

    // Get record by ID
    getById: (id: number) => api.get(`/tree-growth-records/${id}`),

    // Get records by batch ID
    getByBatchId: (batchId: number) => api.get(`/tree-growth-records/batch/${batchId}`),

    // Get latest record for a batch
    getLatest: (batchId: number) => api.get(`/tree-growth-records/batch/${batchId}/latest`),

    // Calculate CO2 for a record
    calculateCO2: (id: number) => api.post(`/tree-growth-records/${id}/calculate-co2`),

    // Get total CO2 by batch
    getTotalCO2ByBatch: (batchId: number) => api.get(`/tree-growth-records/batch/${batchId}/total-co2`),

    // Get total CO2 by farm
    getTotalCO2ByFarm: (farmId: number) => api.get(`/tree-growth-records/farm/${farmId}/total-co2`),

    // Get unhealthy batches
    getUnhealthyBatches: () => api.get('/tree-growth-records/unhealthy'),
};
