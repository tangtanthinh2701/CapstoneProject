package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.SessionStatus;
import com.capston.project.back.end.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {
    Optional<ChatSession> findByUserIdAndSessionStatus(UUID userId, SessionStatus status);
}
