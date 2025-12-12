package com.capston.project.back.end.service;

import io.jsonwebtoken.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

public interface JwtService {
  String generateToken(String username);

  String extractUsername(String token);

  Date extractExpiration(String token);

  <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver);

  Boolean isTokenExpired(String token);

  Boolean validateToken(String token, UserDetails userDetails);
}
