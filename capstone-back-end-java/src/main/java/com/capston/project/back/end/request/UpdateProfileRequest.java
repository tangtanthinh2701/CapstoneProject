package com.capston.project.back.end.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullname;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must have 10 digits")
    private String phoneNumber;

    @Email(message = "Invalid email format")
    private String email;

    private String address;
    private Boolean sex;
    private LocalDate dateOfBirth;
}

