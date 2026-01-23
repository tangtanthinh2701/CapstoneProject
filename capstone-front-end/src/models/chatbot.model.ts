// ==================== CHATBOT INTERFACES ====================

export interface ChatSession {
  id: number;
  sessionCode: string;
  userId: string;
  userName?: string;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  sessionCode?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatMessageRequest {
  message: string;
}

export interface ChatMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}
