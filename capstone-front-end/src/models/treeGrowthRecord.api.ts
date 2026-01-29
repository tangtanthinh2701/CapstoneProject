import axios from 'axios';

import { API_BASE_URL } from '../utils/api';

export interface TreeGrowthRecord {
    id: number;
    batchId: number;
    recordedDate: string;
    quantityAlive: number;
    avgHeightCm: number;
    avgTrunkDiameterCm?: number;
    healthStatus: string;
    notes?: string;
    recordedById?: string;
}

export interface CreateGrowthRecordRequest {
    batchId: number;
    recordedDate: string;
    quantityAlive: number;
    avgHeightCm: number;
    avgTrunkDiameterCm?: number;
    healthStatus: string;
    notes?: string;
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

// ==================== APIs ====================

export const createGrowthRecord = (data: CreateGrowthRecordRequest) =>
    axios.post<TreeGrowthRecord>(`${API_BASE_URL}/tree-growth-records`, data, {
        headers: getAuthHeader(),
    });

export const getRecordsByBatch = (batchId: number) =>
    axios.get<TreeGrowthRecord[]>(`${API_BASE_URL}/tree-growth-records/batch/${batchId}`, {
        headers: getAuthHeader(),
    });

export const calculateGrowthRecordCO2 = (id: number) =>
    axios.post(`${API_BASE_URL}/tree-growth-records/${id}/calculate-co2`, null, {
        headers: getAuthHeader(),
    });

export const getCO2SummaryByBatch = (batchId: number) =>
    axios.get(`${API_BASE_URL}/tree-growth-records/batch/${batchId}/co2-summary`, {
        headers: getAuthHeader(),
    });

export const treeGrowthRecordApi = {
    createGrowthRecord,
    getRecordsByBatch,
    calculateGrowthRecordCO2,
    getCO2SummaryByBatch,
};
