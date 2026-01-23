package com.capston.project.back.end.service;

import com.capston.project.back.end.common.Role;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.request.RegisterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;
import java.util.UUID;

/**
 * Service interface cho các chức năng quản trị của ADMIN
 */
public interface AdminService {

    // ==================== USER MANAGEMENT ====================

    /**
     * Lấy danh sách users với các filter
     */
    Page<User> getAllUsers(Pageable pageable, Role role, Boolean isActive, String keyword);

    /**
     * Lấy thông tin user theo ID
     */
    User getUserById(UUID id);

    /**
     * Tạo user mới với role được chỉ định
     */
    User createUser(RegisterRequest request, Role role);

    /**
     * Cập nhật role của user
     */
    User updateUserRole(UUID userId, Role newRole);

    /**
     * Cập nhật trạng thái active của user
     */
    User updateUserStatus(UUID userId, Boolean isActive);

    /**
     * Xóa user (soft delete)
     */
    void deleteUser(UUID userId);

    // ==================== STATISTICS ====================

    /**
     * Lấy thống kê tổng quan hệ thống
     */
    Map<String, Object> getSystemStatistics();

    /**
     * Đếm số user theo role
     */
    Map<String, Long> countUsersByRole();

    // ==================== PENDING APPROVALS ====================

    /**
     * Lấy danh sách các yêu cầu chờ phê duyệt
     */
    Map<String, Object> getPendingApprovals();
}

