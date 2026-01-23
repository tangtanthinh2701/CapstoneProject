import { apiClient, type ApiResponse } from '../utils/api';
import type {
  ChatSession,
  ChatMessage,
  ChatMessageRequest,
  ChatMessageResponse,
} from '../models/chatbot.model';

const BASE_PATH = '/chatbot';

export const chatbotService = {
  // ==================== SESSION MANAGEMENT ====================

  async createSession(): Promise<ApiResponse<ChatSession>> {
    return apiClient.post<ChatSession>(`${BASE_PATH}/sessions`);
  },

  async getSession(sessionCode: string): Promise<ApiResponse<ChatSession>> {
    return apiClient.get<ChatSession>(`${BASE_PATH}/sessions/${sessionCode}`);
  },

  async getMySessions(page = 0, size = 10): Promise<ApiResponse<ChatSession[]>> {
    return apiClient.get<ChatSession[]>(`${BASE_PATH}/sessions`, {
      page,
      size,
    });
  },

  // ==================== MESSAGES ====================

  async sendMessage(
    sessionCode: string,
    data: ChatMessageRequest,
  ): Promise<ApiResponse<ChatMessageResponse>> {
    return apiClient.post<ChatMessageResponse>(
      `${BASE_PATH}/sessions/${sessionCode}/messages`,
      data as unknown as Record<string, unknown>,
    );
  },

  async getSessionMessages(
    sessionCode: string,
    page = 0,
    size = 50,
  ): Promise<ApiResponse<ChatMessage[]>> {
    return apiClient.get<ChatMessage[]>(`${BASE_PATH}/sessions/${sessionCode}/messages`, {
      page,
      size,
    });
  },
};

export default chatbotService;
