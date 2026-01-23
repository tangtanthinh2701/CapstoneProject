import api from '../utils/api';

export interface ChatSession {
    id: number;
    sessionCode: string;
    sessionStatus: string;
    startedAt: string;
}

export interface ChatMessage {
    id: number;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    createdAt: string;
}

export const chatApi = {
    createSession: () => api.post<ChatSession>('/chat/sessions'),
    sendMessage: (sessionCode: string, content: string) =>
        api.post(`/chat/sessions/${sessionCode}/messages`, { content }),
    getMessages: (sessionCode: string) =>
        api.get<ChatMessage[]>(`/chat/sessions/${sessionCode}/messages`),
};
