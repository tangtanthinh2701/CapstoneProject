import { API_BASE_URL } from '../utils/api';

export interface ChatMessage {
  id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  modelUsed?: string | null;
  tokensUsed?: number | null;
  responseTimeMs?: number | null;
  referencedProjects?: string | null;
  referencedCredits?: string | null;
  isHelpful?: boolean | null;
  feedbackNote?: string | null;
  createdAt: string;
  sessionId: number;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  message: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
  pageInfo?: any;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ==================== APIs ====================

export const sendMessage = async (message: string): Promise<SendMessageResponse> => {
  const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Không thể gửi tin nhắn');
  }

  const json: ApiResponse<SendMessageResponse> = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'Gửi tin nhắn thất bại');
  }

  return json.data;
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/chatbot/history`, {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải lịch sử chat');
  }

  const json: ApiResponse<ChatMessage[]> = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'Tải lịch sử thất bại');
  }

  return json.data;
};

export const closeSession = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chatbot/close-session`, {
    method: 'POST',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Không thể đóng session');
  }

  const json: ApiResponse<null> = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'Đóng session thất bại');
  }
};

export const chatbotApi = {
  sendMessage,
  getChatHistory,
  closeSession,
};
