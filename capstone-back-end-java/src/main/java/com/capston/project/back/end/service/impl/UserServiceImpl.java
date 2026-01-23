package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.*;
import com.capston.project.back.end.request.ChangePasswordRequest;
import com.capston.project.back.end.request.UpdateProfileRequest;
import com.capston.project.back.end.response.UserProfileResponse;
import com.capston.project.back.end.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final CarbonCreditAllocationRepository allocationRepository;
    private final CreditTransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== PROFILE ====================

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return mapToProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Cập nhật các trường được phép
        if (request.getFullname() != null) {
            user.setFullname(request.getFullname());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getSex() != null) {
            user.setSex(request.getSex());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        User saved = userRepository.save(user);
        log.info("Profile updated for user: {}", username);

        return mapToProfileResponse(saved);
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", username);

        // Validate confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", username);
    }

    // ==================== DASHBOARD ====================

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserDashboard(String username) {
        log.info("Getting dashboard for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Map<String, Object> dashboard = new HashMap<>();

        // User info
        dashboard.put("userId", user.getId());
        dashboard.put("username", user.getUsername());
        dashboard.put("fullname", user.getFullname());
        dashboard.put("role", user.getRole());

        // Contract count
        long contractCount = contractRepository.countByPartyAIdOrPartyBId(user.getId(), user.getId());
        dashboard.put("contractCount", contractCount);

        // Allocation count
        long allocationCount = allocationRepository.countByOwnerId(user.getId());
        dashboard.put("allocationCount", allocationCount);

        // Transaction count
        long transactionCount = transactionRepository.countByBuyerIdOrSellerId(user.getId(), user.getId());
        dashboard.put("transactionCount", transactionCount);

        return dashboard;
    }

    @Override
    @Transactional(readOnly = true)
    public Object getUserActivities(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        // Activity logs table doesn't exist in database schema
        // Return empty page for now
        return org.springframework.data.domain.Page.empty(pageable);
    }

    // ==================== USER DATA ====================

    @Override
    @Transactional(readOnly = true)
    public Object getUserContracts(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return contractRepository.findByPartyAIdOrPartyBId(user.getId(), user.getId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Object getUserAllocations(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Pageable pageable = PageRequest.of(page, size, Sort.by("allocatedAt").descending());
        return allocationRepository.findByOwnerId(user.getId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Object getUserTransactions(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        return transactionRepository.findByBuyerIdOrSellerId(user.getId(), user.getId(), pageable);
    }

    // ==================== HELPER METHODS ====================

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .sex(user.getSex())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
