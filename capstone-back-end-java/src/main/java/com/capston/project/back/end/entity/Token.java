package com.capston.project.back.end.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Token {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private UUID id;

  @Column(unique = true, nullable = false)
  private String token;

  @Column(name = "token_type", nullable = false, length = 50)
  private String tokenType;

  @Column(name = "expiration_date")
  private LocalDateTime expirationDate;

  @Column(nullable = false)
  private Boolean revoked;

  @Column(nullable = false)
  private Boolean expired;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;
}
