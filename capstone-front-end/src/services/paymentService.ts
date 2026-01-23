import { apiClient, type ApiResponse } from '../utils/api';
import type {
  Payment,
  VNPayCreateRequest,
  VNPayCreateResponse,
  VNPayQueryResponse,
  PaymentSummary,
} from '../models/payment.model';

const BASE_PATH = '/payments';

export const paymentService = {
  // ==================== ADMIN PAYMENT MANAGEMENT ====================

  async getAllPayments(page = 0, size = 10): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<Payment[]>(`${BASE_PATH}/all`, { page, size });
  },

  async getPaymentById(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`${BASE_PATH}/${id}`);
  },

  async confirmPayment(id: number): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`${BASE_PATH}/${id}/confirm`);
  },

  async refundPayment(id: number, reason: string): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(
      `${BASE_PATH}/${id}/refund?reason=${encodeURIComponent(reason)}`,
    );
  },

  async getPaymentSummary(): Promise<ApiResponse<PaymentSummary>> {
    return apiClient.get<PaymentSummary>(`${BASE_PATH}/summary`);
  },

  // ==================== USER PAYMENT ====================

  async getMyPayments(page = 0, size = 10): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<Payment[]>(`${BASE_PATH}/my-payments`, { page, size });
  },

  // ==================== VNPAY INTEGRATION ====================

  async createVNPayPayment(data: VNPayCreateRequest): Promise<ApiResponse<VNPayCreateResponse>> {
    return apiClient.post<VNPayCreateResponse>(
      `${BASE_PATH}/vnpay/create`,
      data as unknown as Record<string, unknown>,
    );
  },

  async queryVNPayTransaction(txnRef: string): Promise<ApiResponse<VNPayQueryResponse>> {
    return apiClient.get<VNPayQueryResponse>(`${BASE_PATH}/vnpay/query/${txnRef}`);
  },
};

export default paymentService;
