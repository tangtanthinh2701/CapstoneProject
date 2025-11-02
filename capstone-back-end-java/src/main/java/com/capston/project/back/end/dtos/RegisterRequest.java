package com.capston.project.back.end.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterRequest {
  @NotBlank(message = "Full name must not be empty")
  private String fullname;

  @NotBlank(message = "User name must not be empty")
  private String username;

  @NotBlank(message = "Password must not be empty")
  @Size(min = 6, message = "Password must be at least 6 characters")
  private String password;

  @NotBlank(message = "Phone number must not be empty")
  @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must have 10 digits")
  private String phoneNumber;

  private String email;
  private String address;
  private LocalDate dateOfBirth;
}
