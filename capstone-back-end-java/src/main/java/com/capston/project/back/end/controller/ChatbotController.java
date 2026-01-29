package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.ChatMessage;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.ChatbotService;
import com.capston.project.back.end.util.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Controller xử lý AI Chatbot với ChatGPT
 * User/Farmer có thể chat với AI để tư vấn về carbon offsetting
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final SecurityUtils securityUtils;

    /**
     * Gửi tin nhắn đến chatbot
     */
    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request) {

        UUID userId = securityUtils.getCurrentUserId();
        log.info("Chatbot message from user {}: {}", userId, request.getMessage());

        String response = chatbotService.sendMessage(userId, request.getMessage());

        ChatResponse chatResponse = ChatResponse.builder()
                .message(response)
                .timestamp(OffsetDateTime.now())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", chatResponse));
    }

    /**
     * Lấy lịch sử chat
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getHistory() {
        UUID userId = securityUtils.getCurrentUserId();
        List<ChatMessage> history = chatbotService.getChatHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved", history));
    }

    /**
     * Đóng session chat hiện tại
     */
    @PostMapping("/close-session")
    public ResponseEntity<ApiResponse<Void>> closeSession() {
        UUID userId = securityUtils.getCurrentUserId();
        chatbotService.closeSession(userId);
        return ResponseEntity.ok(ApiResponse.success("Chat session closed", null));
    }

    // ==================== DTOs ====================

    @Data
    public static class ChatRequest {
        @NotBlank(message = "Message cannot be blank")
        private String message;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class ChatResponse {
        private String message;
        private OffsetDateTime timestamp;
    }
}
