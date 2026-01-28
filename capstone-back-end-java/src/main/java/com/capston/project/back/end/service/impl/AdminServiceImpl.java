package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.common.Role;
import com.capston.project.back.end.common.RenewalStatus;
import com.capston.project.back.end.common.TransferStatus;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.*;
import com.capston.project.back.end.request.RegisterRequest;
import com.capston.project.back.end.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ContractRenewalRepository contractRenewalRepository;
    private final ContractTransferRepository contractTransferRepository;
    private final ProjectRepository projectRepository;
    private final FarmRepository farmRepository;
    private final CarbonCreditRepository carbonCreditRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== USER MANAGEMENT ====================

    @Override
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable, Role role, Boolean isActive, String keyword) {
        log.info("Getting all users - role: {}, isActive: {}, keyword: {}", role, isActive, keyword);

        // Ưu tiên tìm kiếm theo keyword
        if (keyword != null && !keyword.isBlank()) {
            return userRepository.searchByKeyword(keyword, pageable);
        }

        // Lọc theo role và isActive
        if (role != null && isActive != null) {
            return userRepository.findByRoleAndIsActive(role, isActive, pageable);
        }

        if (role != null) {
            return userRepository.findByRole(role, pageable);
        }

        if (isActive != null) {
            return userRepository.findByIsActive(isActive, pageable);
        }

        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public User createUser(RegisterRequest request, Role role) {
        log.info("Admin creating new user: {} with role: {}", request.getUsername(), role);

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
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
                .role(role)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        log.info("User created successfully: {}", saved.getId());

        return saved;
    }

    @Override
    public User updateUserRole(UUID userId, Role newRole) {
        log.info("Updating role for user {} to {}", userId, newRole);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setRole(newRole);
        User saved = userRepository.save(user);

        log.info("User role updated: {} -> {}", userId, newRole);
        return saved;
    }

    @Override
    public User updateUserStatus(UUID userId, Boolean isActive) {
        log.info("Updating status for user {} to {}", userId, isActive);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setIsActive(isActive);
        User saved = userRepository.save(user);

        log.info("User status updated: {} -> active={}", userId, isActive);
        return saved;
    }

    @Override
    public void deleteUser(UUID userId) {
        log.info("Deleting user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Soft delete - chỉ đánh dấu inactive
        user.setIsActive(false);
        userRepository.save(user);

        log.info("User deleted (soft delete): {}", userId);
    }

    // ==================== STATISTICS ====================

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSystemStatistics() {
        log.info("Getting system statistics");

        Map<String, Object> stats = new HashMap<>();

        // User statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByIsActiveTrue());
        stats.put("adminCount", userRepository.countByRole(Role.ADMIN));
        stats.put("farmerCount", userRepository.countByRole(Role.FARMER));
        stats.put("userCount", userRepository.countByRole(Role.USER));

        // Project statistics
        stats.put("totalProjects", projectRepository.count());

        // Farm statistics
        stats.put("totalFarms", farmRepository.count());

        // Contract statistics
        stats.put("totalContracts", contractRepository.count());
        stats.put("pendingContracts", contractRepository.countByContractStatus(ContractStatus.PENDING));
        stats.put("activeContracts", contractRepository.countByContractStatus(ContractStatus.ACTIVE));

        // Carbon credit statistics
        stats.put("totalCarbonCredits", carbonCreditRepository.count());

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> countUsersByRole() {
        Map<String, Long> counts = new HashMap<>();
        for (Role role : Role.values()) {
            counts.put(role.name(), userRepository.countByRole(role));
        }
        return counts;
    }

    // ==================== PENDING APPROVALS ====================

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPendingApprovals() {
        log.info("Getting pending approvals");

        Map<String, Object> pendingApprovals = new HashMap<>();

        // Pending contracts
        long pendingContracts = contractRepository.countByContractStatus(ContractStatus.PENDING);
        pendingApprovals.put("pendingContracts", pendingContracts);

        // Pending renewals
        long pendingRenewals = contractRenewalRepository.countByRenewalStatus(RenewalStatus.PENDING);
        pendingApprovals.put("pendingRenewals", pendingRenewals);

        // Pending transfers
        long pendingTransfers = contractTransferRepository.countByTransferStatus(TransferStatus.PENDING);
        pendingApprovals.put("pendingTransfers", pendingTransfers);

        // Total pending
        pendingApprovals.put("totalPending", pendingContracts + pendingRenewals + pendingTransfers);

        return pendingApprovals;
    }
}
