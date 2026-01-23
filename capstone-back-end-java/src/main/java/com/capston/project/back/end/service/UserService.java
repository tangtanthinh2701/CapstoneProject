package com.capston.project.back.end.service;

import com.capston.project.back.end.request.ChangePasswordRequest;
import com.capston.project.back.end.request.UpdateProfileRequest;
import com.capston.project.back.end.response.UserProfileResponse;

import java.util.Map;

/**
 * Service interface cho các chức năng của USER
 */
public interface UserService {

    // ==================== PROFILE ====================

    /**
     * Lấy profile theo username
     */
    UserProfileResponse getProfileByUsername(String username);

    /**
     * Cập nhật profile
     */
    UserProfileResponse updateProfile(String username, UpdateProfileRequest request);

    /**
     * Đổi mật khẩu
     */
    void changePassword(String username, ChangePasswordRequest request);

    // ==================== DASHBOARD ====================

    /**
     * Lấy dashboard cá nhân của user
     */
    Map<String, Object> getUserDashboard(String username);

    /**
     * Lấy lịch sử hoạt động
     */
    Object getUserActivities(String username, int page, int size);

    // ==================== USER DATA ====================

    /**
     * Lấy danh sách hợp đồng của user
     */
    Object getUserContracts(String username, int page, int size);

    /**
     * Lấy danh sách credit allocation của user
     */
    Object getUserAllocations(String username, int page, int size);

    /**
     * Lấy danh sách giao dịch của user
     */
    Object getUserTransactions(String username, int page, int size);
}
