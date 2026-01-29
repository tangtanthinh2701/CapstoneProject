package com.capston.project.back.end.service;

import com.capston.project.back.end.entity.ChatMessage;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for AI Chatbot functionality
 */
public interface ChatbotService {

    /**
     * Send a message to the chatbot and get AI response
     * 
     * @param userId      User sending the message
     * @param userMessage Message content
     * @return AI-generated response
     */
    String sendMessage(UUID userId, String userMessage);

    /**
     * Get chat history for a user's active session
     * 
     * @param userId User ID
     * @return List of chat messages
     */
    List<ChatMessage> getChatHistory(UUID userId);

    /**
     * Close the current active chat session
     * 
     * @param userId User ID
     */
    void closeSession(UUID userId);
}
