package com.capston.project.back.end.service;

import com.capston.project.back.end.request.ChatRequest;
import com.capston.project.back.end.response.ChatResponse;
import com.capston.project.back.end.response.ChatSessionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ChatbotService {

    // Session management
    ChatSessionResponse createSession(UUID userId, String userAgent, String ipAddress);
    ChatSessionResponse getSession(String sessionCode);
    void closeSession(String sessionCode);
    Page<ChatSessionResponse> getUserSessions(UUID userId, Pageable pageable);

    // Chat
    ChatResponse chat(ChatRequest request);

    // Get chat history
    List<ChatResponse> getChatHistory(String sessionCode);

    // Feedback
    void submitFeedback(Integer messageId, Boolean isHelpful, String note);

    // Project recommendation
    ChatResponse recommendProjects(String query, UUID userId);
}
