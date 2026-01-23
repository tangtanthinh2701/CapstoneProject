package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.MessageRole;
import com.capston.project.back.end.common.SessionStatus;
import com.capston.project.back.end.entity.ChatMessage;
import com.capston.project.back.end.entity.ChatSession;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.ChatMessageRepository;
import com.capston.project.back.end.repository.ChatSessionRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.request.ChatRequest;
import com.capston.project.back.end.response.ChatResponse;
import com.capston.project.back.end.response.ChatSessionResponse;
import com.capston.project.back.end.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatbotServiceImpl implements ChatbotService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ProjectRepository projectRepository;

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    // ==================== SESSION MANAGEMENT ====================

    @Override
    public ChatSessionResponse createSession(UUID userId, String userAgent, String ipAddress) {
        log.info("Creating new chat session for user: {}", userId);

        String sessionCode = generateSessionCode();

        ChatSession session = ChatSession.builder()
                .sessionCode(sessionCode)
                .userId(userId)
                .sessionStatus(SessionStatus.ACTIVE)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .startedAt(OffsetDateTime.now())
                .lastMessageAt(OffsetDateTime.now())
                .build();

        ChatSession saved = chatSessionRepository.save(session);
        log.info("Chat session created: {}", sessionCode);

        return mapToSessionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatSessionResponse getSession(String sessionCode) {
        ChatSession session = chatSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionCode));
        return mapToSessionResponse(session);
    }

    @Override
    public void closeSession(String sessionCode) {
        log.info("Closing chat session: {}", sessionCode);

        ChatSession session = chatSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionCode));

        session.close();
        chatSessionRepository.save(session);

        log.info("Chat session closed: {}", sessionCode);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChatSessionResponse> getUserSessions(UUID userId, Pageable pageable) {
        return chatSessionRepository.findByUserIdOrderByStartedAtDesc(userId, pageable)
                .map(this::mapToSessionResponse);
    }

    // ==================== CHAT ====================

    @Override
    public ChatResponse chat(ChatRequest request) {
        log.info("Processing chat message for session: {}", request.getSessionCode());
        long startTime = System.currentTimeMillis();

        // Find session
        ChatSession session = chatSessionRepository.findBySessionCode(request.getSessionCode())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + request.getSessionCode()));

        if (session.getSessionStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active");
        }

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role(MessageRole.USER)
                .content(request.getMessage())
                .createdAt(OffsetDateTime.now())
                .build();
        chatMessageRepository.save(userMessage);

        // Generate AI response
        String aiResponseContent = generateAIResponse(request.getMessage(), session);

        int responseTimeMs = (int) (System.currentTimeMillis() - startTime);

        // Save AI message
        ChatMessage aiMessage = ChatMessage.builder()
                .session(session)
                .role(MessageRole.ASSISTANT)
                .content(aiResponseContent)
                .modelUsed(openAiModel)
                .responseTimeMs(responseTimeMs)
                .createdAt(OffsetDateTime.now())
                .build();
        ChatMessage savedAiMessage = chatMessageRepository.save(aiMessage);

        // Update session
        session.setLastMessageAt(OffsetDateTime.now());
        chatSessionRepository.save(session);

        log.info("Chat response generated in {}ms for session: {}", responseTimeMs, request.getSessionCode());

        return mapToResponse(savedAiMessage);
    }

    // ==================== CHAT HISTORY ====================

    @Override
    @Transactional(readOnly = true)
    public List<ChatResponse> getChatHistory(String sessionCode) {
        ChatSession session = chatSessionRepository.findBySessionCodeWithMessages(sessionCode)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionCode));

        return session.getMessages().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ==================== FEEDBACK ====================

    @Override
    public void submitFeedback(Integer messageId, Boolean isHelpful, String note) {
        log.info("Submitting feedback for message: {}", messageId);

        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        message.setIsHelpful(isHelpful);
        message.setFeedbackNote(note);
        chatMessageRepository.save(message);

        log.info("Feedback submitted for message: {}", messageId);
    }

    // ==================== PROJECT RECOMMENDATION ====================

    @Override
    public ChatResponse recommendProjects(String query, UUID userId) {
        log.info("Generating project recommendations for user: {}", userId);
        long startTime = System.currentTimeMillis();

        // Get or create session for recommendations
        String sessionCode = "RECOMMEND-" + UUID.randomUUID().toString().substring(0, 8);
        ChatSession session = ChatSession.builder()
                .sessionCode(sessionCode)
                .userId(userId)
                .sessionStatus(SessionStatus.ACTIVE)
                .startedAt(OffsetDateTime.now())
                .lastMessageAt(OffsetDateTime.now())
                .build();
        session = chatSessionRepository.save(session);

        // Generate recommendation response
        String recommendationContent = generateProjectRecommendation(query);

        int responseTimeMs = (int) (System.currentTimeMillis() - startTime);

        // Save recommendation message
        ChatMessage recommendMessage = ChatMessage.builder()
                .session(session)
                .role(MessageRole.ASSISTANT)
                .content(recommendationContent)
                .modelUsed(openAiModel)
                .responseTimeMs(responseTimeMs)
                .createdAt(OffsetDateTime.now())
                .build();
        ChatMessage saved = chatMessageRepository.save(recommendMessage);

        return mapToResponse(saved);
    }

    // ==================== HELPER METHODS ====================

    private String generateSessionCode() {
        return "CHAT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateAIResponse(String userMessage, ChatSession session) {
        // Check if OpenAI API key is configured
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            return generateFallbackResponse(userMessage);
        }

        try {
            // TODO: Implement actual OpenAI API call
            // For now, return a fallback response
            return generateFallbackResponse(userMessage);
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
            return generateFallbackResponse(userMessage);
        }
    }

    private String generateFallbackResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.contains("dự án") || lowerMessage.contains("project")) {
            return "Hiện tại hệ thống có nhiều dự án trồng rừng và bảo vệ môi trường. " +
                   "Bạn có thể xem danh sách dự án tại mục 'Dự án' trên menu. " +
                   "Nếu bạn cần tìm kiếm dự án cụ thể, hãy cho tôi biết thêm về nhu cầu của bạn!";
        }

        if (lowerMessage.contains("tín chỉ") || lowerMessage.contains("carbon") || lowerMessage.contains("credit")) {
            return "Tín chỉ carbon là chứng nhận quyền phát thải một lượng CO2 nhất định. " +
                   "Bạn có thể mua tín chỉ carbon để bù đắp lượng khí thải của mình hoặc đầu tư vào các dự án xanh. " +
                   "Hãy xem mục 'Carbon Credits' để biết thêm chi tiết!";
        }

        if (lowerMessage.contains("hợp đồng") || lowerMessage.contains("contract")) {
            return "Để tham gia dự án, bạn cần ký kết hợp đồng với chúng tôi. " +
                   "Hợp đồng sẽ quy định rõ quyền lợi và nghĩa vụ của các bên. " +
                   "Bạn có thể xem và quản lý hợp đồng tại mục 'Hợp đồng' trong tài khoản của mình.";
        }

        if (lowerMessage.contains("thanh toán") || lowerMessage.contains("payment")) {
            return "Hệ thống hỗ trợ thanh toán qua VNPay và nhiều phương thức khác. " +
                   "Bạn có thể thanh toán trực tuyến an toàn và nhanh chóng. " +
                   "Mọi giao dịch đều được mã hóa và bảo mật.";
        }

        if (lowerMessage.contains("xin chào") || lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            return "Xin chào! Tôi là trợ lý AI của hệ thống quản lý tín chỉ carbon. " +
                   "Tôi có thể giúp bạn tìm hiểu về các dự án, tín chỉ carbon, hợp đồng và nhiều hơn nữa. " +
                   "Bạn cần hỗ trợ gì hôm nay?";
        }

        return "Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống quản lý tín chỉ carbon. " +
               "Tôi có thể giúp bạn với các câu hỏi về:\n" +
               "• Dự án trồng rừng và bảo vệ môi trường\n" +
               "• Tín chỉ carbon và cách mua/bán\n" +
               "• Hợp đồng và quy trình tham gia\n" +
               "• Thanh toán và giao dịch\n\n" +
               "Hãy cho tôi biết bạn cần hỗ trợ gì nhé!";
    }

    private String generateProjectRecommendation(String query) {
        // TODO: Implement actual project recommendation logic with AI
        return "Dựa trên yêu cầu của bạn, tôi đề xuất một số dự án phù hợp:\n\n" +
               "1. **Dự án Trồng rừng Miền Trung** - Phù hợp cho đầu tư dài hạn\n" +
               "2. **Dự án Bảo vệ Rừng Ngập mặn** - Lợi nhuận ổn định\n" +
               "3. **Dự án Phục hồi Rừng Tây Nguyên** - Tiềm năng cao\n\n" +
               "Bạn có muốn biết thêm chi tiết về dự án nào không?";
    }

    private ChatSessionResponse mapToSessionResponse(ChatSession session) {
        return ChatSessionResponse.builder()
                .id(session.getId())
                .sessionCode(session.getSessionCode())
                .userId(session.getUserId())
                .sessionStatus(session.getSessionStatus())
                .messageCount(session.getMessages() != null ? session.getMessages().size() : 0)
                .startedAt(session.getStartedAt())
                .lastMessageAt(session.getLastMessageAt())
                .closedAt(session.getClosedAt())
                .build();
    }

    private ChatResponse mapToResponse(ChatMessage message) {
        return ChatResponse.builder()
                .messageId(message.getId())
                .sessionCode(message.getSession().getSessionCode())
                .role(message.getRole())
                .content(message.getContent())
                .modelUsed(message.getModelUsed())
                .responseTimeMs(message.getResponseTimeMs())
                .referencedProjects(message.getReferencedProjects())
                .referencedCredits(message.getReferencedCredits())
                .isHelpful(message.getIsHelpful())
                .createdAt(message.getCreatedAt())
                .build();
    }
}

