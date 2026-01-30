package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.MessageRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_messages_session", columnList = "session_id, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "model_used", length = 100)
    private String modelUsed;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "referenced_projects", columnDefinition = "jsonb")
    private List<Map<String, Object>> referencedProjects;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "referenced_credits", columnDefinition = "jsonb")
    private List<Map<String, Object>> referencedCredits;

    @Column(name = "is_helpful")
    private Boolean isHelpful;

    @Column(name = "feedback_note", columnDefinition = "TEXT")
    private String feedbackNote;

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Helper method
    public Integer getSessionId() {
        return session != null ? session.getId() : null;
    }
}
