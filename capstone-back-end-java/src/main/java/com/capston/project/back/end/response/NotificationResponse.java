package com.capston.project.back.end.response;

import com.capston.project.back.end.common.NotificationType;
import com.capston.project.back.end.common.ReferenceType;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Integer id;
    private UUID userId;
    private String title;
    private String message;
    private NotificationType notificationType;
    private ReferenceType referenceType;
    private Integer referenceId;
    private Boolean isRead;
    private OffsetDateTime readAt;
    private Map<String, Object> metadata;
    private OffsetDateTime createdAt;
}

