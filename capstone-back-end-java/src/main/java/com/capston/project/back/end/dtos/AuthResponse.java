package com.capston.project.back.end.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
  private String token;
  private String tokenType = "Bearer"; // When using builder to create instance, if not set, this field will null
  private Long userId;
  private String username;
  private String fullName;
}
