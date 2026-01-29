package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.MessageRole;
import com.capston.project.back.end.common.SessionStatus;
import com.capston.project.back.end.entity.ChatMessage;
import com.capston.project.back.end.entity.ChatSession;
import com.capston.project.back.end.repository.ChatMessageRepository;
import com.capston.project.back.end.repository.ChatSessionRepository;
import com.capston.project.back.end.service.ChatbotService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatbotServiceImpl implements ChatbotService {

    @Value("${github.models.api.token}")
    private String githubToken;

    @Value("${github.models.api.url:https://models.inference.ai.azure.com/chat/completions}")
    private String apiUrl;

    @Value("${github.models.model:gpt-4o}")
    private String model;

    @Value("${openai.system.prompt}")
    private String systemPrompt;

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("=== CHATBOT SERVICE INITIALIZED ===");
        log.info("API URL: {}", apiUrl);
        log.info("Model: {}", model);
        log.info("Token loaded: {}",
                githubToken != null && !githubToken.isEmpty() ? "YES (length: " + githubToken.length() + ")"
                        : "NO/EMPTY");

        // Set Java DNS cache TTL to 60 seconds (default is forever)
        java.security.Security.setProperty("networkaddress.cache.ttl", "60");
        java.security.Security.setProperty("networkaddress.cache.negative.ttl", "10");

        // Test DNS resolution at startup
        try {
            InetAddress[] addresses = InetAddress.getAllByName("models.inference.ai.azure.com");
            log.info("DNS resolved: {} addresses found", addresses.length);
            for (InetAddress addr : addresses) {
                log.info("  - {}", addr.getHostAddress());
            }
        } catch (Exception e) {
            log.warn("DNS resolution failed at startup: {}", e.getMessage());
        }
    }

    @Override
    public String sendMessage(UUID userId, String userMessage) {
        log.info("Processing chatbot message from user: {}", userId);

        // 1. Tìm hoặc tạo session
        ChatSession session = sessionRepository
                .findByUserIdAndSessionStatus(userId, SessionStatus.ACTIVE)
                .orElseGet(() -> createNewSession(userId));

        // 2. Lưu tin nhắn user
        saveMessage(session, MessageRole.USER, userMessage);

        // 3. Gọi ChatGPT API
        String botResponse = callChatGPT(session.getId(), userMessage);

        // 4. Lưu phản hồi bot
        saveMessage(session, MessageRole.ASSISTANT, botResponse);

        return botResponse;
    }

    @Override
    public List<ChatMessage> getChatHistory(UUID userId) {
        ChatSession session = sessionRepository
                .findByUserIdAndSessionStatus(userId, SessionStatus.ACTIVE)
                .orElse(null);

        if (session == null) {
            return List.of();
        }

        return messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
    }

    @Override
    public void closeSession(UUID userId) {
        sessionRepository.findByUserIdAndSessionStatus(userId, SessionStatus.ACTIVE)
                .ifPresent(session -> {
                    session.setSessionStatus(SessionStatus.CLOSED);
                    session.setClosedAt(OffsetDateTime.now());
                    sessionRepository.save(session);
                });
    }

    // ==================== HELPER METHODS ====================

    private String callChatGPT(Integer sessionId, String userMessage) {
        // Lấy lịch sử chat (10 tin nhắn gần nhất để tiết kiệm tokens)
        List<ChatMessage> history = messageRepository
                .findBySessionIdOrderByCreatedAtDesc(sessionId, PageRequest.of(0, 10))
                .stream()
                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                .toList();

        // Build messages cho GitHub Models API
        List<Map<String, String>> messages = new ArrayList<>();

        // System prompt (vai trò của bot)
        messages.add(Map.of(
                "role", "system",
                "content", systemPrompt));

        // Thêm lịch sử chat
        for (ChatMessage msg : history) {
            String role = msg.getRole().equals(MessageRole.USER) ? "user" : "assistant";
            messages.add(Map.of("role", role, "content", msg.getContent()));
        }

        // Thêm tin nhắn mới
        messages.add(Map.of("role", "user", "content", userMessage));

        // Gọi GitHub Models API using HttpURLConnection
        HttpURLConnection conn = null;
        try {
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("messages", messages);
            requestBody.put("model", model);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 500);

            String jsonBody = objectMapper.writeValueAsString(requestBody);

            log.info("Calling GitHub Models API: {} with model: {}", apiUrl, model);

            // Create connection
            URL url = new URL(apiUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + githubToken);
            conn.setConnectTimeout(30000); // 30 seconds
            conn.setReadTimeout(60000);    // 60 seconds
            conn.setDoOutput(true);

            // Send request
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Read response
            int responseCode = conn.getResponseCode();
            log.info("GitHub Models API response code: {}", responseCode);

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(
                            responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream(),
                            StandardCharsets.UTF_8))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }

            if (responseCode >= 400) {
                log.error("GitHub Models API error response: {}", response);
                return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
            }

            // Parse response
            JsonNode root = objectMapper.readTree(response.toString());
            String aiResponse = root.path("choices").get(0)
                    .path("message").path("content").asText();

            log.info("GitHub Models response received, length: {}", aiResponse.length());
            return aiResponse;

        } catch (java.net.UnknownHostException e) {
            log.error("DNS ERROR: Cannot resolve {}. Please check:", apiUrl);
            log.error("  1. Internet connection");
            log.error("  2. VPN/Proxy settings (try disabling Cloudflare WARP if installed)");
            log.error("  3. Add to hosts file: 51.12.47.32 models.inference.ai.azure.com");
            return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet hoặc tắt VPN/Proxy.";
        } catch (Exception e) {
            log.error("GitHub Models API error: {}", e.getMessage(), e);
            return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private void saveMessage(ChatSession session, MessageRole role, String content) {
        ChatMessage message = ChatMessage.builder()
                .session(session)
                .role(role)
                .content(content)
                .build();
        messageRepository.save(message);
    }

    private ChatSession createNewSession(UUID userId) {
        log.info("Creating new chat session for user: {}", userId);

        // Generate unique session code
        String sessionCode = "CHAT-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ChatSession session = ChatSession.builder()
                .sessionCode(sessionCode)
                .userId(userId)
                .sessionStatus(SessionStatus.ACTIVE)
                .startedAt(OffsetDateTime.now())
                .build();
        return sessionRepository.save(session);
    }
}
