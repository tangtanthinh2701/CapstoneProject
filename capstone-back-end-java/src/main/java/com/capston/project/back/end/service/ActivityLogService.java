package com.capston.project.back.end.service;

import com.capston.project.back.end.entity.ActivityLog;
import com.capston.project.back.end.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository repository;

    public void log(UUID userId, String action, String detail) {
        ActivityLog logRecord = ActivityLog.builder()
                .userId(userId)
                .action(action)
                .detail(detail)
                .build();
        repository.save(logRecord);
    }

    public Page<ActivityLog> getUserActivities(UUID userId, Pageable pageable) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
}
