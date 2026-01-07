package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<Token, UUID> {
  Optional<Token> findByToken(String token);

  @Query(
      "SELECT t FROM Token t WHERE t.user.id = :userId AND t.expired = false AND t.revoked = false")
  List<Token> findAllValidTokensByUser(UUID userId);
}
