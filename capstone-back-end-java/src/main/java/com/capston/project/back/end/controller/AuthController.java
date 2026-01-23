package com.capston.project.back.end.controller;

import com.capston.project.back.end.response.AuthResponse;
import com.capston.project.back.end.request.LoginRequest;
import com.capston.project.back.end.request.RegisterRequest;
import com.capston.project.back.end.request.ResetPasswordRequest;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }

  @PostMapping("/register-admin")
  public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.registerAdmin(request));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  // TODO: should moving to user controller
  @PostMapping("/create-user")
  public ResponseEntity<User> createUser(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.createUser(request));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ResponseEntity.ok("Password reset successful.");
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<String> forgotPassword(@RequestBody java.util.Map<String, String> request) {
    String email = request.get("email");
    authService.forgotPassword(email);
    return ResponseEntity.ok("OTP sent successfully to your email.");
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<String> verifyOtpAndResetPassword(@RequestBody java.util.Map<String, String> request) {
    String email = request.get("email");
    String otp = request.get("otp");
    String newPassword = request.get("newPassword");
    authService.verifyOtpAndResetPassword(email, otp, newPassword);
    return ResponseEntity.ok("Password reset successful.");
  }

  @PostMapping("/logout")
  public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);
      authService.logout(token);
      return ResponseEntity.ok("Logout successful");
    }
    throw new RuntimeException("Token is invalid");
  }
}
