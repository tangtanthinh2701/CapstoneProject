package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {

    Optional<ChatSession> findBySessionCode(String sessionCode);

    @Query("SELECT cs FROM ChatSession cs LEFT JOIN FETCH cs.messages WHERE cs.sessionCode = :sessionCode")
    Optional<ChatSession> findBySessionCodeWithMessages(@Param("sessionCode") String sessionCode);

    Page<ChatSession> findByUserIdOrderByStartedAtDesc(UUID userId, Pageable pageable);
}

