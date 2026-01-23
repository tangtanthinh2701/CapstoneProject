package com.capston.project.back.end.controller;

import com.capston.project.back.end.request.UpdateProfileRequest;
import com.capston.project.back.end.request.ChangePasswordRequest;
import com.capston.project.back.end.response.UserProfileResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller cho các chức năng của USER (profile, settings)
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    // ==================== PROFILE ====================

    /**
     * Lấy thông tin cá nhân của user đang đăng nhập
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userService.getProfileByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String username = authentication.getName();
        UserProfileResponse profile = userService.updateProfile(username, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    /**
     * Đổi mật khẩu
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String username = authentication.getName();
        userService.changePassword(username, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    // ==================== USER DASHBOARD ====================

    /**
     * Lấy thống kê cá nhân của user
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyDashboard(Authentication authentication) {
        String username = authentication.getName();
        Map<String, Object> dashboard = userService.getUserDashboard(username);
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved successfully", dashboard));
    }

    /**
     * Lấy lịch sử hoạt động gần đây
     */
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<Object>> getMyActivities(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        Object activities = userService.getUserActivities(username, page, size);
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", activities));
    }

    // ==================== USER CONTRACTS ====================

    /**
     * Lấy danh sách hợp đồng của user
     */
    @GetMapping("/contracts")
    public ResponseEntity<ApiResponse<Object>> getMyContracts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        Object contracts = userService.getUserContracts(username, page, size);
        return ResponseEntity.ok(ApiResponse.success("Contracts retrieved successfully", contracts));
    }

    // ==================== USER CREDITS ====================

    /**
     * Lấy danh sách credit được phân bổ cho user
     */
    @GetMapping("/allocations")
    public ResponseEntity<ApiResponse<Object>> getMyAllocations(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        Object allocations = userService.getUserAllocations(username, page, size);
        return ResponseEntity.ok(ApiResponse.success("Allocations retrieved successfully", allocations));
    }

    /**
     * Lấy danh sách giao dịch credit của user
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Object>> getMyTransactions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        Object transactions = userService.getUserTransactions(username, page, size);
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", transactions));
    }
}
