package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Integer sessionId);
}

