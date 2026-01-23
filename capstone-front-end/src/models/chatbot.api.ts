// Chatbot API - Fully compliant with the API guide
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8088/api';

export interface ChatSession {
  id: number;
  sessionCode: string;
  userId: string;
  createdAt: string;
  lastMessageAt?: string;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  senderType: 'USER' | 'BOT';
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ==================== APIs ====================

export const createSession = () =>
  axios.post<ChatSession>(`${API_BASE_URL}/chat/sessions`, null, {
    headers: getAuthHeader(),
  });

export const sendMessage = (sessionCode: string, data: SendMessageRequest) =>
  axios.post<ChatMessage>(`${API_BASE_URL}/chat/sessions/${sessionCode}/messages`, data, {
    headers: getAuthHeader(),
  });

export const getSessionMessages = (sessionCode: string) =>
  axios.get<ChatMessage[]>(`${API_BASE_URL}/chat/sessions/${sessionCode}/messages`, {
    headers: getAuthHeader(),
  });

// For convenience
export const chatbotApi = {
  createSession,
  sendMessage,
  getSessionMessages,
};
