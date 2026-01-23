package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.NotificationType;
import com.capston.project.back.end.common.ReferenceType;
import com.capston.project.back.end.entity.Notification;
import com.capston.project.back.end.repository.NotificationRepository;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.response.NotificationResponse;
import com.capston.project.back.end.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public NotificationResponse createAndSend(UUID userId, String title, String message,
                                              NotificationType type, ReferenceType refType,
                                              Integer refId, Map<String, Object> metadata) {
        log.info("Creating notification for user: {}, type: {}", userId, type);

        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .notificationType(type)
                .referenceType(refType)
                .referenceId(refId)
                .metadata(metadata)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(saved);

        // Send real-time via WebSocket
        sendWebSocketNotification(userId, response);

        log.info("Notification sent to user: {}", userId);
        return response;
    }

    @Override
    public void sendToMultipleUsers(List<UUID> userIds, String title, String message,
                                    NotificationType type, ReferenceType refType, Integer refId) {
        for (UUID userId : userIds) {
            createAndSend(userId, title, message, type, refType, refId, null);
        }
    }

    @Override
    public void sendToAdmins(String title, String message, NotificationType type,
                            ReferenceType refType, Integer refId) {
        List<UUID> adminIds = userRepository.findAllAdminIds();
        sendToMultipleUsers(adminIds, title, message, type, refType, refId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getByUserId(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadByUserId(UUID userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long countUnreadByUserId(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Integer notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.markAsRead();
            notificationRepository.save(notification);
        });
    }

    @Override
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Override
    public void deleteNotification(Integer id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public void deleteAllByUserId(UUID userId) {
        notificationRepository.deleteAllByUserId(userId);
    }

    // ==================== HELPER METHODS ====================

    private void sendWebSocketNotification(UUID userId, NotificationResponse notification) {
        try {
            // Send to user-specific queue
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    notification
            );
            log.debug("WebSocket notification sent to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification: {}", e.getMessage());
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .metadata(notification.getMetadata())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

