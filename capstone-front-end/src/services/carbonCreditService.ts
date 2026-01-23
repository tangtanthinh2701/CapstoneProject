import { apiClient, type ApiResponse } from '../utils/api';
import type {
  CarbonCredit,
  CarbonCreditRequest,
  CreditVerification,
  CreditTransaction,
  CreditPurchaseRequest,
  CreditRetireRequest,
  CreditAllocationRequest,
  CreditSummary,
  RetirementCertificate,
} from '../models/carbonCredit.model';

const BASE_PATH = '/carbon-credits';

export const carbonCreditService = {
  // ==================== CARBON CREDIT CRUD ====================

  async getAllCredits(
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir = 'desc',
  ): Promise<ApiResponse<CarbonCredit[]>> {
    return apiClient.get<CarbonCredit[]>(BASE_PATH, {
      page,
      size,
      sortBy,
      sortDir,
    });
  },

  async getCreditById(id: number): Promise<ApiResponse<CarbonCredit>> {
    return apiClient.get<CarbonCredit>(`${BASE_PATH}/${id}`);
  },

  async getAvailableCredits(page = 0, size = 10): Promise<ApiResponse<CarbonCredit[]>> {
    return apiClient.get<CarbonCredit[]>(`${BASE_PATH}/available`, {
      page,
      size,
    });
  },

  async getCreditsByProject(
    projectId: number,
    page = 0,
    size = 10,
  ): Promise<ApiResponse<CarbonCredit[]>> {
    return apiClient.get<CarbonCredit[]>(`${BASE_PATH}/project/${projectId}`, {
      page,
      size,
    });
  },

  async getCreditsByStatus(
    status: string,
    page = 0,
    size = 10,
  ): Promise<ApiResponse<CarbonCredit[]>> {
    return apiClient.get<CarbonCredit[]>(`${BASE_PATH}/status/${status}`, {
      page,
      size,
    });
  },

  async createCredit(data: CarbonCreditRequest): Promise<ApiResponse<CarbonCredit>> {
    return apiClient.post<CarbonCredit>(BASE_PATH, data as unknown as Record<string, unknown>);
  },

  async updateCredit(
    id: number,
    data: Partial<CarbonCreditRequest>,
  ): Promise<ApiResponse<CarbonCredit>> {
    return apiClient.put<CarbonCredit>(
      `${BASE_PATH}/${id}`,
      data as unknown as Record<string, unknown>,
    );
  },

  async deleteCredit(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },

  // ==================== CREDIT VERIFICATION ====================

  async verifyCredit(id: number, data?: CreditVerification): Promise<ApiResponse<CarbonCredit>> {
    return apiClient.post<CarbonCredit>(
      `${BASE_PATH}/${id}/verify`,
      data as unknown as Record<string, unknown>,
    );
  },

  // ==================== CREDIT ALLOCATION ====================

  async allocateCredits(
    creditId: number,
    data: CreditAllocationRequest,
  ): Promise<ApiResponse<CarbonCredit>> {
    return apiClient.post<CarbonCredit>(
      `${BASE_PATH}/${creditId}/allocate`,
      data as unknown as Record<string, unknown>,
    );
  },

  // ==================== CREDIT TRANSACTIONS ====================

  async purchaseCredits(data: CreditPurchaseRequest): Promise<ApiResponse<CreditTransaction>> {
    return apiClient.post<CreditTransaction>(
      `${BASE_PATH}/purchase`,
      data as unknown as Record<string, unknown>,
    );
  },

  async retireCredits(data: CreditRetireRequest): Promise<ApiResponse<CreditTransaction>> {
    return apiClient.post<CreditTransaction>(
      `${BASE_PATH}/retire`,
      data as unknown as Record<string, unknown>,
    );
  },

  async getAllTransactions(page = 0, size = 10): Promise<ApiResponse<CreditTransaction[]>> {
    return apiClient.get<CreditTransaction[]>(`${BASE_PATH}/transactions`, {
      page,
      size,
    });
  },

  async getTransactionById(id: number): Promise<ApiResponse<CreditTransaction>> {
    return apiClient.get<CreditTransaction>(`${BASE_PATH}/transactions/${id}`);
  },

  async getTransactionsByUser(
    userId: string,
    page = 0,
    size = 10,
  ): Promise<ApiResponse<CreditTransaction[]>> {
    return apiClient.get<CreditTransaction[]>(`${BASE_PATH}/transactions/user/${userId}`, {
      page,
      size,
    });
  },

  async getMyTransactions(page = 0, size = 10): Promise<ApiResponse<CreditTransaction[]>> {
    return apiClient.get<CreditTransaction[]>('/user/transactions', {
      page,
      size,
    });
  },

  // ==================== RETIREMENT CERTIFICATE ====================

  async getRetirementCertificate(
    transactionId: number,
  ): Promise<ApiResponse<RetirementCertificate>> {
    return apiClient.get<RetirementCertificate>(
      `${BASE_PATH}/transactions/${transactionId}/certificate`,
    );
  },

  // ==================== CREDIT SUMMARY ====================

  async getCreditSummary(): Promise<ApiResponse<CreditSummary>> {
    return apiClient.get<CreditSummary>(`${BASE_PATH}/summary`);
  },

  async getCreditSummaryByProject(projectId: number): Promise<ApiResponse<CreditSummary>> {
    return apiClient.get<CreditSummary>(`${BASE_PATH}/project/${projectId}/summary`);
  },
};

export default carbonCreditService;
