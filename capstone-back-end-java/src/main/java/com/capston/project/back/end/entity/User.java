package com.capston.project.back.end.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

import java.util.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private UUID id;

  @Column(name = "fullname", length = 100)
  private String fullname;

  @Column(nullable = false, unique = true, length = 100)
  private String username;

  @Column(nullable = false, length = 100)
  private String password;

  @Column(name = "phone_number", nullable = false, length = 10)
  private String phoneNumber;

  @Column(length = 100)
  private String email;

  @Column(length = 200)
  private String address;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "is_active")
  private Boolean isActive = true;

  @Column(name = "date_of_birth")
  private LocalDateTime dateOfBirth;

  @Column(name = "sex")
  private Boolean sex;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
  private List<Token> tokens;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
