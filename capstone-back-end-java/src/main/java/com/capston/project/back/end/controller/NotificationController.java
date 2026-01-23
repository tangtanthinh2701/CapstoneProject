package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.response.NotificationResponse;
import com.capston.project.back.end.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * Lấy danh sách notifications của user (phân trang)
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            Authentication authentication,
            Pageable pageable) {
        UUID userId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(notificationService.getByUserId(userId, pageable));
    }

    /**
     * Lấy danh sách notifications chưa đọc
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(notificationService.getUnreadByUserId(userId));
    }

    /**
     * Đếm số notifications chưa đọc
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> countUnread(
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        Long count = notificationService.countUnreadByUserId(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Đánh dấu một notification đã đọc
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Đánh dấu tất cả notifications đã đọc
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa một notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Integer id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xóa tất cả notifications của user
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotifications(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        notificationService.deleteAllByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
