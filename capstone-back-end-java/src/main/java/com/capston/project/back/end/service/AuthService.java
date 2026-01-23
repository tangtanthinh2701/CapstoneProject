package com.capston.project.back.end.service;

import com.capston.project.back.end.response.AuthResponse;
import com.capston.project.back.end.request.LoginRequest;
import com.capston.project.back.end.request.RegisterRequest;
import com.capston.project.back.end.request.ResetPasswordRequest;
import com.capston.project.back.end.entity.User;

public interface AuthService {
  AuthResponse register(RegisterRequest request);

  AuthResponse registerAdmin(RegisterRequest request);

  AuthResponse login(LoginRequest request);

  User createUser(RegisterRequest request);

  void resetPassword(ResetPasswordRequest request);

  void forgotPassword(String email);

  void verifyOtpAndResetPassword(String email, String otp, String newPassword);

  void logout(String token);
}
