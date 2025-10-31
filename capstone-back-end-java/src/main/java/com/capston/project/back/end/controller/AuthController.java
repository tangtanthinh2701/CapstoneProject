package com.capston.project.back.end.controller;

import com.capston.project.back.end.dtos.AuthResponse;
import com.capston.project.back.end.dtos.LoginRequest;
import com.capston.project.back.end.dtos.RegisterRequest;
import com.capston.project.back.end.dtos.ResetPasswordRequest;
import com.capston.project.back.end.models.User;
import com.capston.project.back.end.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/create-user")
	public ResponseEntity<User> createUser(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.ok(authService.createUser(request));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		authService.resetPassword(request);
		return ResponseEntity.ok("Reset password thành công");
	}
}
