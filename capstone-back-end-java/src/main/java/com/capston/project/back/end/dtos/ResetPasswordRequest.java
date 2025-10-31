package com.capston.project.back.end.dtos;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
  @NotBlank(message = "User name must not be empty")
  private String username;

  @NotBlank(message = "New password must not be empty")
  @Size(min = 6, message = "New password must be at least 6 characters")
  private String newPassword;

  @NotBlank(message = "Phone number must not be empty")
  private String phoneNumber;
}
