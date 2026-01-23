package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.Role;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.request.RegisterRequest;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller cho các chức năng quản trị của ADMIN
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    // ==================== USER MANAGEMENT ====================

    /**
     * Lấy danh sách tất cả users (phân trang, lọc, tìm kiếm)
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String keyword) {

        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> userPage = adminService.getAllUsers(pageable, role, isActive, keyword);

        return ResponseEntity.ok(ApiResponse.success(
                "Users retrieved successfully",
                userPage.getContent(),
                buildPageInfo(userPage)
        ));
    }

    /**
     * Lấy thông tin chi tiết user
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable UUID id) {
        User user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Tạo user mới (Admin có thể tạo user với bất kỳ role nào)
     */
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(
            @Valid @RequestBody RegisterRequest request,
            @RequestParam(defaultValue = "USER") Role role) {
        User user = adminService.createUser(request, role);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", user));
    }

    /**
     * Cập nhật role của user
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable UUID id,
            @RequestParam Role role) {
        User user = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", user));
    }

    /**
     * Cập nhật trạng thái active của user (khóa/mở khóa tài khoản)
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam Boolean isActive) {
        User user = adminService.updateUserStatus(id, isActive);
        String message = isActive ? "User activated successfully" : "User deactivated successfully";
        return ResponseEntity.ok(ApiResponse.success(message, user));
    }

    /**
     * Xóa user (soft delete)
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    // ==================== STATISTICS ====================

    /**
     * Lấy thống kê tổng quan hệ thống
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStatistics() {
        Map<String, Object> stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }

    /**
     * Đếm số user theo role
     */
    @GetMapping("/users/count-by-role")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countUsersByRole() {
        Map<String, Long> counts = adminService.countUsersByRole();
        return ResponseEntity.ok(ApiResponse.success(counts));
    }

    // ==================== PENDING APPROVALS ====================

    /**
    /**
     * Lấy danh sách các yêu cầu chờ phê duyệt (contracts, renewals, transfers)
     */
    @GetMapping("/pending-approvals")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingApprovals() {
        Map<String, Object> pendingApprovals = adminService.getPendingApprovals();
        return ResponseEntity.ok(ApiResponse.success("Pending approvals retrieved", pendingApprovals));
    }

    // ==================== HELPER METHODS ====================

    private ApiResponse.PageInfo buildPageInfo(Page<?> page) {
        return ApiResponse.PageInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}

