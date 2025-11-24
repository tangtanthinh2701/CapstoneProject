package com.capston.project.back.end.repository;

import com.capston.project.back.end.models.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TokenRepository extends JpaRepository<Token, UUID> {
  Optional<Token> findByToken(String token);

  @Query(
      "SELECT t FROM Token t WHERE t.user.id = :userId AND t.expired = false AND t.revoked = false")
  List<Token> findAllValidTokensByUser(UUID userId);
}
