package com.capston.project.back.end.service;

import com.capston.project.back.end.dtos.AuthResponse;
import com.capston.project.back.end.dtos.LoginRequest;
import com.capston.project.back.end.dtos.RegisterRequest;
import com.capston.project.back.end.dtos.ResetPasswordRequest;
import com.capston.project.back.end.models.User;

public interface AuthService {
  AuthResponse register(RegisterRequest request);

  AuthResponse login(LoginRequest request);

  User createUser(RegisterRequest request);

  void resetPassword(ResetPasswordRequest request);

  void logout(String token);
}
