package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

import java.util.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "fullname", length = 100)
  private String fullname;

  @Column(nullable = false, unique = true, length = 100)
  private String username;

  @Column(nullable = false, length = 100)
  @JsonIgnore
  private String password;

  @Column(name = "phone_number", nullable = false, length = 10)
  private String phoneNumber;

  @Column(length = 100)
  private String email;

  @Column(length = 200)
  private String address;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", length = 20)
  @Builder.Default
  private Role role = Role.USER;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private OffsetDateTime updatedAt;

  @Column(name = "is_active")
  @Builder.Default
  private Boolean isActive = true;

  @Column(name = "date_of_birth")
  private LocalDate dateOfBirth;

  @Column(name = "sex")
  private Boolean sex;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
  @JsonIgnore
  private List<Token> tokens;

  public boolean isAdmin() {
    return Role.ADMIN.equals(this.role);
  }

}
