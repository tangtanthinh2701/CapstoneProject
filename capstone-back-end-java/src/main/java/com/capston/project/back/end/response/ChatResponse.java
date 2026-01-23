package com.capston.project.back.end.response;

import com.capston.project.back.end.common.MessageRole;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private Integer messageId;
    private String sessionCode;
    private MessageRole role;
    private String content;
    private String modelUsed;
    private Integer responseTimeMs;
    private List<Map<String, Object>> referencedProjects;
    private List<Map<String, Object>> referencedCredits;
    private Boolean isHelpful;
    private OffsetDateTime createdAt;
}

