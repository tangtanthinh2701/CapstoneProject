package com.capston.project.back.end.service;

import com.capston.project.back.end.common.NotificationType;
import com.capston.project.back.end.common.ReferenceType;
import com.capston.project.back.end.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotificationService {

    // Create & Send
    NotificationResponse createAndSend(UUID userId, String title, String message,
                                       NotificationType type, ReferenceType refType,
                                       Integer refId, Map<String, Object> metadata);

    // Send to multiple users
    void sendToMultipleUsers(List<UUID> userIds, String title, String message,
                            NotificationType type, ReferenceType refType, Integer refId);

    // Send to all admins
    void sendToAdmins(String title, String message, NotificationType type,
                     ReferenceType refType, Integer refId);

    // Get notifications
    Page<NotificationResponse> getByUserId(UUID userId, Pageable pageable);
    List<NotificationResponse> getUnreadByUserId(UUID userId);
    Long countUnreadByUserId(UUID userId);

    // Mark as read
    void markAsRead(Integer notificationId);
    void markAllAsRead(UUID userId);

    // Delete
    void deleteNotification(Integer id);
    void deleteAllByUserId(UUID userId);
}

