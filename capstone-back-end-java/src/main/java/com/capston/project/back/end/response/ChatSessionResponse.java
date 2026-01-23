package com.capston.project.back.end.response;

import com.capston.project.back.end.common.SessionStatus;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionResponse {
    private Integer id;
    private String sessionCode;
    private UUID userId;
    private SessionStatus sessionStatus;
    private Integer messageCount;
    private OffsetDateTime startedAt;
    private OffsetDateTime lastMessageAt;
    private OffsetDateTime closedAt;
}

