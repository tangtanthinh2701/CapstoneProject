package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.Role;
import com.capston.project.back.end.response.AuthResponse;
import com.capston.project.back.end.request.LoginRequest;
import com.capston.project.back.end.request.RegisterRequest;

import com.capston.project.back.end.request.ResetPasswordRequest;
import com.capston.project.back.end.entity.Token;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.service.AuthService;
import com.capston.project.back.end.service.EmailService;
import com.capston.project.back.end.service.JwtService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.repository.TokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Random;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
  private final UserRepository userRepository;
  private final TokenRepository tokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final EmailService emailService;

  // In-memory OTP storage (email -> OtpData)
  private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

  // Inner class to store OTP and expiry time
  private static class OtpData {
    String otp;
    OffsetDateTime expiry;

    OtpData(String otp, OffsetDateTime expiry) {
      this.otp = otp;
      this.expiry = expiry;
    }

    boolean isExpired() {
      return OffsetDateTime.now().isAfter(expiry);
    }
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new RuntimeException("Tên đăng nhập đã tồn tại.");
    }

    User user = User.builder()
        .fullname(request.getFullname())
        .username(request.getUsername())
        .password(passwordEncoder.encode(request.getPassword()))
        .phoneNumber(request.getPhoneNumber())
        .email(request.getEmail())
        .address(request.getAddress())
        .dateOfBirth(request.getDateOfBirth())
        .sex(request.getSex())
        .role(validateAndGetRole(request.getRole()))
        .isActive(true)
        .build();

    userRepository.save(user);

    String jwtToken = jwtService.generateToken(user.getUsername());
    saveUserToken(user, jwtToken);

    return AuthResponse.builder()
        .token(jwtToken)
        .userId(user.getId())
        .username(user.getUsername())
        .fullName(user.getFullname())
        .role(user.getRole())
        .build();
  }

  @Override
  @Transactional
  public AuthResponse registerAdmin(RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new RuntimeException("Tên đăng nhập đã tồn tại.");
    }

    User user = User.builder()
        .fullname(request.getFullname())
        .username(request.getUsername())
        .password(passwordEncoder.encode(request.getPassword()))
        .phoneNumber(request.getPhoneNumber())
        .email(request.getEmail())
        .address(request.getAddress())
        .dateOfBirth(request.getDateOfBirth())
        .sex(request.getSex())
        .role(Role.ADMIN)
        .isActive(true)
        .build();

    userRepository.save(user);

    String jwtToken = jwtService.generateToken(user.getUsername());
    saveUserToken(user, jwtToken);

    return AuthResponse.builder()
        .token(jwtToken)
        .userId(user.getId())
        .username(user.getUsername())
        .fullName(user.getFullname())
        .role(user.getRole())
        .build();
  }

  @Transactional
  public AuthResponse login(LoginRequest request) {
    User user = userRepository
        .findByUsername(request.getUsername())
        .orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc mật khẩu không chính xác."));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }

    if (!user.getIsActive()) {
      throw new RuntimeException("Tài khoản đã bị vô hiệu hóa.");
    }

    revokeAllUserTokens(user);
    String jwtToken = jwtService.generateToken(user.getUsername());
    saveUserToken(user, jwtToken);

    return AuthResponse.builder()
        .token(jwtToken)
        .userId(user.getId())
        .username(user.getUsername())
        .fullName(user.getFullname())
        .role(user.getRole())
        .build();
  }

  @Transactional
  public User createUser(RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new RuntimeException("Tên đăng nhập đã tồn tại.");
    }

    User user = User.builder()
        .fullname(request.getFullname())
        .username(request.getUsername())
        .password(passwordEncoder.encode(request.getPassword()))
        .phoneNumber(request.getPhoneNumber())
        .email(request.getEmail())
        .address(request.getAddress())
        .sex(request.getSex())
        .dateOfBirth(request.getDateOfBirth())
        .role(request.getRole() != null ? request.getRole() : Role.USER)
        .isActive(true)
        .build();

    return userRepository.save(user);
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    User user = userRepository
        .findByUsername(request.getUsername())
        .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

    if (!user.getPhoneNumber().equals(request.getPhoneNumber())) {
      throw new RuntimeException("Số điện thoại không khớp.");
    }

    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);

    revokeAllUserTokens(user);
  }

  @Override
  @Transactional
  public void forgotPassword(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống."));

    // Generate 6-digit OTP
    String otp = String.format("%06d", new Random().nextInt(999999));

    // Store OTP in memory with 10 minutes expiry
    OffsetDateTime expiry = OffsetDateTime.now().plusMinutes(10);
    otpStorage.put(email, new OtpData(otp, expiry));

    // Clean up expired OTPs (optional, to prevent memory leak)
    cleanupExpiredOtps();

    // Send OTP via email
    emailService.sendOtpEmail(email, otp);
  }

  @Override
  @Transactional
  public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Email không tồn tại."));

    // Retrieve OTP from storage
    OtpData otpData = otpStorage.get(email);

    if (otpData == null) {
      throw new RuntimeException("Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã mới.");
    }

    if (otpData.isExpired()) {
      otpStorage.remove(email);
      throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
    }

    if (!otpData.otp.equals(otp)) {
      throw new RuntimeException("Mã OTP không chính xác.");
    }

    // OTP is valid, reset password
    otpStorage.remove(email); // Remove used OTP
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    revokeAllUserTokens(user);
  }

  @Transactional
  public void logout(String token) {
    Token storedToken = tokenRepository.findByToken(token)
        .orElseThrow(() -> new RuntimeException("Token does not exist"));

    storedToken.setExpired(true);
    storedToken.setRevoked(true);
    tokenRepository.save(storedToken);
  }

  private void saveUserToken(User user, String jwtToken) {
    Token token = Token.builder()
        .user(user)
        .token(jwtToken)
        .tokenType("Bearer")
        .expired(false)
        .revoked(false)
        .expirationDate(OffsetDateTime.now().plusDays(1))
        .build();
    tokenRepository.save(token);
  }

  private void revokeAllUserTokens(User user) {
    var validUserTokens = tokenRepository.findAllValidTokensByUser(user.getId());
    if (validUserTokens.isEmpty())
      return;

    validUserTokens.forEach(
        token -> {
          token.setExpired(true);
          token.setRevoked(true);
        });
    tokenRepository.saveAll(validUserTokens);
  }

  // Clean up expired OTPs from memory
  private void cleanupExpiredOtps() {
    otpStorage.entrySet().removeIf(entry -> entry.getValue().isExpired());
  }

  private Role validateAndGetRole(Role requestedRole) {
    if (requestedRole == null) {
      return Role.USER;
    }
    if (requestedRole == Role.ADMIN) {
      throw new RuntimeException("Không thể đăng ký với quyền ADMIN.");
    }
    return requestedRole;
  }
}
