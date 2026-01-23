package com.capston.project.back.end.security;

import com.capston.project.back.end.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    com.capston.project.back.end.entity.User user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User does not exist"));

    // Create authority with ROLE_ prefix for Spring Security
    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

    return new User(
        user.getUsername(),
        user.getPassword(),
        user.getIsActive(),  // enabled
        true,                // accountNonExpired
        true,                // credentialsNonExpired
        true,                // accountNonLocked
        Collections.singletonList(authority)
    );
  }
}
