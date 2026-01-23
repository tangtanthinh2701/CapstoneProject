package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.ChatRequest;
import com.capston.project.back.end.response.ChatResponse;
import com.capston.project.back.end.response.ChatSessionResponse;
import com.capston.project.back.end.service.ChatbotService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    /**
     * Tạo phiên chat mới
     */
    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionResponse> createSession(
            Authentication authentication,
            HttpServletRequest request) {

        UUID userId = getUserIdFromAuth(authentication);
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIP(request);

        ChatSessionResponse response = chatbotService.createSession(userId, userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin phiên chat
     */
    @GetMapping("/sessions/{sessionCode}")
    public ResponseEntity<ChatSessionResponse> getSession(@PathVariable String sessionCode) {
        return ResponseEntity.ok(chatbotService.getSession(sessionCode));
    }

    /**
     * Đóng phiên chat
     */
    @PostMapping("/sessions/{sessionCode}/close")
    public ResponseEntity<Void> closeSession(@PathVariable String sessionCode) {
        chatbotService.closeSession(sessionCode);
        return ResponseEntity.ok().build();
    }

    /**
     * Lấy danh sách phiên chat của user
     */
    @GetMapping("/sessions")
    public ResponseEntity<Page<ChatSessionResponse>> getUserSessions(
            Authentication authentication,
            Pageable pageable) {
        UUID userId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(chatbotService.getUserSessions(userId, pageable));
    }

    /**
     * Gửi tin nhắn và nhận phản hồi từ AI
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = chatbotService.chat(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy lịch sử chat của một phiên
     */
    @GetMapping("/sessions/{sessionCode}/messages")
    public ResponseEntity<List<ChatResponse>> getChatHistory(@PathVariable String sessionCode) {
        return ResponseEntity.ok(chatbotService.getChatHistory(sessionCode));
    }

    /**
     * Gửi feedback cho một tin nhắn
     */
    @PostMapping("/messages/{messageId}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable Integer messageId,
            @RequestBody Map<String, Object> feedback) {

        Boolean isHelpful = (Boolean) feedback.get("isHelpful");
        String note = (String) feedback.get("note");

        chatbotService.submitFeedback(messageId, isHelpful, note);
        return ResponseEntity.ok().build();
    }

    /**
     * Gợi ý dự án phù hợp
     */
    @PostMapping("/recommend-projects")
    public ResponseEntity<ChatResponse> recommendProjects(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        UUID userId = getUserIdFromAuth(authentication);
        String query = request.get("query");
        ChatResponse response = chatbotService.recommendProjects(query, userId);
        return ResponseEntity.ok(response);
    }

    // ==================== HELPER METHODS ====================

    private UUID getUserIdFromAuth(Authentication authentication) {
        if (authentication == null)
            return null;
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
