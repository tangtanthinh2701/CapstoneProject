import { apiClient, type ApiResponse } from '../utils/api';
import type {
  Contract,
  ContractRequest,
  ContractApproval,
  ContractTermination,
  ContractRenewal,
  ContractRenewalRequest,
  ContractTransfer,
  ContractTransferRequest,
  ContractSummary,
} from '../models/contract.model';

const BASE_PATH = '/contracts';

export const contractService = {
  // ==================== CONTRACT CRUD ====================

  async getAllContracts(
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir = 'desc',
  ): Promise<ApiResponse<Contract[]>> {
    return apiClient.get<Contract[]>(BASE_PATH, {
      page,
      size,
      sortBy,
      sortDir,
    });
  },

  async getContractById(id: number): Promise<ApiResponse<Contract>> {
    return apiClient.get<Contract>(`${BASE_PATH}/${id}`);
  },

  async getContractsByStatus(
    status: string,
    page = 0,
    size = 10,
  ): Promise<ApiResponse<Contract[]>> {
    return apiClient.get<Contract[]>(`${BASE_PATH}/status/${status}`, {
      page,
      size,
    });
  },

  async searchContracts(keyword: string, page = 0, size = 10): Promise<ApiResponse<Contract[]>> {
    return apiClient.get<Contract[]>(`${BASE_PATH}/search`, {
      keyword,
      page,
      size,
    });
  },

  async createContract(data: ContractRequest): Promise<ApiResponse<Contract>> {
    return apiClient.post<Contract>(BASE_PATH, data as unknown as Record<string, unknown>);
  },

  async updateContract(id: number, data: Partial<ContractRequest>): Promise<ApiResponse<Contract>> {
    return apiClient.put<Contract>(
      `${BASE_PATH}/${id}`,
      data as unknown as Record<string, unknown>,
    );
  },

  async deleteContract(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },

  // ==================== CONTRACT WORKFLOW ====================

  async submitForApproval(id: number): Promise<ApiResponse<Contract>> {
    return apiClient.post<Contract>(`${BASE_PATH}/${id}/submit`);
  },

  async approveContract(id: number, data: ContractApproval): Promise<ApiResponse<Contract>> {
    return apiClient.post<Contract>(
      `${BASE_PATH}/${id}/approve`,
      data as unknown as Record<string, unknown>,
    );
  },

  async rejectContract(id: number, reason: string): Promise<ApiResponse<Contract>> {
    return apiClient.post<Contract>(`${BASE_PATH}/${id}/reject`, { reason });
  },

  async terminateContract(id: number, data: ContractTermination): Promise<ApiResponse<Contract>> {
    return apiClient.post<Contract>(
      `${BASE_PATH}/${id}/terminate`,
      data as unknown as Record<string, unknown>,
    );
  },

  // ==================== CONTRACT SUMMARY ====================

  async getContractSummary(): Promise<ApiResponse<ContractSummary>> {
    return apiClient.get<ContractSummary>(`${BASE_PATH}/summary`);
  },

  async getExpiringSoonContracts(days = 30): Promise<ApiResponse<Contract[]>> {
    return apiClient.get<Contract[]>(`${BASE_PATH}/expiring-soon`, { days });
  },

  // ==================== CONTRACT RENEWALS ====================

  async createRenewalRequest(data: ContractRenewalRequest): Promise<ApiResponse<ContractRenewal>> {
    return apiClient.post<ContractRenewal>(
      `${BASE_PATH}/renewals`,
      data as unknown as Record<string, unknown>,
    );
  },

  async getRenewalsByContract(contractId: number): Promise<ApiResponse<ContractRenewal[]>> {
    return apiClient.get<ContractRenewal[]>(`${BASE_PATH}/${contractId}/renewals`);
  },

  async approveRenewal(
    renewalId: number,
    data: ContractApproval,
  ): Promise<ApiResponse<ContractRenewal>> {
    return apiClient.post<ContractRenewal>(
      `${BASE_PATH}/renewals/${renewalId}/approve`,
      data as unknown as Record<string, unknown>,
    );
  },

  async rejectRenewal(renewalId: number, reason: string): Promise<ApiResponse<ContractRenewal>> {
    return apiClient.post<ContractRenewal>(`${BASE_PATH}/renewals/${renewalId}/reject`, { reason });
  },

  // ==================== CONTRACT TRANSFERS ====================

  async createTransferRequest(
    data: ContractTransferRequest,
  ): Promise<ApiResponse<ContractTransfer>> {
    return apiClient.post<ContractTransfer>(
      '/contract-transfers',
      data as unknown as Record<string, unknown>,
    );
  },

  async getPendingTransfers(page = 0, size = 10): Promise<ApiResponse<ContractTransfer[]>> {
    return apiClient.get<ContractTransfer[]>('/contract-transfers/pending', {
      page,
      size,
    });
  },

  async getTransfersByContract(contractId: number): Promise<ApiResponse<ContractTransfer[]>> {
    return apiClient.get<ContractTransfer[]>(`/contract-transfers/contract/${contractId}`);
  },

  async approveTransfer(
    transferId: number,
    approvedBy: string,
  ): Promise<ApiResponse<ContractTransfer>> {
    return apiClient.post<ContractTransfer>(`/contract-transfers/${transferId}/approve`, {
      approvedBy,
    });
  },

  async rejectTransfer(transferId: number, reason: string): Promise<ApiResponse<ContractTransfer>> {
    return apiClient.post<ContractTransfer>(`/contract-transfers/${transferId}/reject`, { reason });
  },

  async cancelTransfer(transferId: number): Promise<ApiResponse<ContractTransfer>> {
    return apiClient.post<ContractTransfer>(`/contract-transfers/${transferId}/cancel`);
  },

  // ==================== USER CONTRACTS ====================

  async getMyContracts(page = 0, size = 10): Promise<ApiResponse<Contract[]>> {
    return apiClient.get<Contract[]>('/user/contracts', { page, size });
  },
};

export default contractService;
