package com.capston.project.back.end.response;

import com.capston.project.back.end.common.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
  private String token;
  @Builder.Default
  private String tokenType = "Bearer";
  private UUID userId;
  private String username;
  private String fullName;
  private Role role;
}
