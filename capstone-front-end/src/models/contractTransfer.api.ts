import axios from 'axios';

import { API_BASE_URL } from '../utils/api';

export interface ContractTransfer {
  id: number;
  contractId: number;
  contractCode?: string;
  fromUserId: string;
  fromUserFullname?: string;
  toUserId: string;
  toUserFullname?: string;
  transferPercentage: number;
  transferAmount: number;
  transferStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface CreateTransferRequest {
  contractId: number;
  toUserId: string;
  transferPercentage: number;
  transferAmount: number;
  notes?: string;
}

export interface PageResponse<T> {
  data: T[];
  pageInfo: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const contractTransferApi = {
  // ==================== USER ENDPOINTS ====================
  createTransferRequest: (data: CreateTransferRequest) =>
    axios.post<ContractTransfer>(`${API_BASE_URL}/contract-transfers`, data, {
      headers: getAuthHeader(),
    }),

  getMyTransfers: () =>
    axios.get<ContractTransfer[]>(`${API_BASE_URL}/contract-transfers/my-transfers`, {
      headers: getAuthHeader(),
    }),

  cancelTransfer: (transferId: number) =>
    axios.post(`${API_BASE_URL}/contract-transfers/${transferId}/cancel`, null, {
      headers: getAuthHeader(),
    }),

  // ==================== ADMIN ENDPOINTS ====================
  getAllTransfers: (page = 0, size = 10) =>
    axios.get<PageResponse<ContractTransfer>>(`${API_BASE_URL}/contract-transfers`, {
      params: { page, size },
      headers: getAuthHeader(),
    }),

  getPendingTransfers: (page = 0, size = 10) =>
    axios.get<PageResponse<ContractTransfer>>(`${API_BASE_URL}/contract-transfers/pending`, {
      params: { page, size },
      headers: getAuthHeader(),
    }),

  approveTransfer: (transferId: number, approvedBy: string) =>
    axios.post(`${API_BASE_URL}/contract-transfers/${transferId}/approve`, null, {
      params: { approvedBy },
      headers: getAuthHeader(),
    }),

  rejectTransfer: (transferId: number, reason: string) =>
    axios.post(`${API_BASE_URL}/contract-transfers/${transferId}/reject`, null, {
      params: { reason },
      headers: getAuthHeader(),
    }),

  // ==================== SHARED ENDPOINTS ====================
  getTransferById: (transferId: number) =>
    axios.get<ContractTransfer>(`${API_BASE_URL}/contract-transfers/${transferId}`, {
      headers: getAuthHeader(),
    }),

  getTransfersByContract: (contractId: number) =>
    axios.get<ContractTransfer[]>(`${API_BASE_URL}/contract-transfers/contract/${contractId}`, {
      headers: getAuthHeader(),
    }),
};
