package com.capston.project.back.end.util;

import com.capston.project.back.end.common.Role;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    public UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    public boolean isAdmin() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.ADMIN;
    }

    public boolean isFarmer() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.FARMER;
    }

    public boolean isUser() {
        User user = getCurrentUser();
        return user != null && user.getRole() == Role.USER;
    }
}
