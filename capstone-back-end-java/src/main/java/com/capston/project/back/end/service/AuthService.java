package com.capston.project.back.end.service;

import com.capston.project.back.end.dtos.AuthResponse;
import com.capston.project.back.end.dtos.LoginRequest;
import com.capston.project.back.end.dtos.RegisterRequest;

import com.capston.project.back.end.dtos.ResetPasswordRequest;
import com.capston.project.back.end.models.Token;
import com.capston.project.back.end.models.User;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.repository.TokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {
	private final UserRepository userRepository;
	private final TokenRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	@Transactional
	public AuthResponse register(RegisterRequest request) {
		if (userRepository.existsByUsername(request.getUsername())) {
			throw new RuntimeException("Username already exists");
		}

		User user = User.builder()
		                .fullname(request.getFullname())
		                .username(request.getUsername())
		                .password(passwordEncoder.encode(request.getPassword()))
		                .phoneNumber(request.getPhoneNumber())
		                .address(request.getAddress())
		                .dateOfBirth(request.getDateOfBirth() != null ?
		                             LocalDate.parse(request.getDateOfBirth()) : null)
		                .isActive(true)
		                .build();

		userRepository.save(user);

		String jwtToken = jwtService.generateToken(user.getUsername());
		saveUserToken(user, jwtToken);

		return AuthResponse.builder()
		                   .token(jwtToken)
		                   .userId(user.getId())
		                   .username(user.getUsername())
		                   .fullname(user.getFullname())
		                   .build();
	}

	@Transactional
	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByUsername(request.getUsername())
		                          .orElseThrow(() -> new RuntimeException("Username or password is incorrect"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new RuntimeException("Username hoặc password không đúng");
		}

		if (!user.getIsActive()) {
			throw new RuntimeException("Account has been disabled");
		}

		revokeAllUserTokens(user);
		String jwtToken = jwtService.generateToken(user.getUsername());
		saveUserToken(user, jwtToken);

		return AuthResponse.builder()
		                   .token(jwtToken)
		                   .userId(user.getId())
		                   .username(user.getUsername())
		                   .fullname(user.getFullname())
		                   .build();
	}

	@Transactional
	public User createUser(RegisterRequest request) {
		if (userRepository.existsByUsername(request.getUsername())) {
			throw new RuntimeException("Username already exists.");
		}

		User user = User.builder()
		                .fullname(request.getFullname())
		                .username(request.getUsername())
		                .password(passwordEncoder.encode(request.getPassword()))
		                .phoneNumber(request.getPhoneNumber())
		                .address(request.getAddress())
		                .dateOfBirth(request.getDateOfBirth() != null ?
		                             LocalDate.parse(request.getDateOfBirth()) : null)
		                .isActive(true)
		                .build();

		return userRepository.save(user);
	}

	@Transactional
	public void resetPassword(ResetPasswordRequest request) {
		User user = userRepository.findByUsername(request.getUsername())
		                          .orElseThrow(() -> new RuntimeException("User not found."));

		if (!user.getPhoneNumber().equals(request.getPhoneNumber())) {
			throw new RuntimeException("Phone number does not match.");
		}

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);

		revokeAllUserTokens(user);
	}

	private void saveUserToken(User user, String jwtToken) {
		Token token = Token.builder()
		                   .user(user)
		                   .token(jwtToken)
		                   .tokenType("Bearer")
		                   .expired(false)
		                   .revoked(false)
		                   .expirationDate(LocalDateTime.now().plusDays(1))
		                   .build();
		tokenRepository.save(token);
	}

	private void revokeAllUserTokens(User user) {
		var validUserTokens = tokenRepository.findAllValidTokensByUser(user.getId());
		if (validUserTokens.isEmpty()) return;

		validUserTokens.forEach(token -> {
			token.setExpired(true);
			token.setRevoked(true);
		});
		tokenRepository.saveAll(validUserTokens);
	}

}
