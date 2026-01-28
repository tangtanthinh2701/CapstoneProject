package com.capston.project.back.end.scheduler;

import com.capston.project.back.end.common.HealthStatus;
import com.capston.project.back.end.common.NotificationType;
import com.capston.project.back.end.common.ReferenceType;
import com.capston.project.back.end.entity.TreeBatch;
import com.capston.project.back.end.entity.TreeGrowthRecord;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.repository.ProjectPhaseRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeBatchRepository;
import com.capston.project.back.end.repository.TreeGrowthRecordRepository;
import com.capston.project.back.end.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Scheduler để quét và cảnh báo các lô cây không khỏe mạnh
 *
 * Nghiệp vụ: Chạy định kỳ quét bảng tree_growth_records
 * Nếu health_status là 'DISEASED' hoặc 'STRESSED', tạo notification cho quản lý
 * dự án
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HealthAlertScheduler {

    private final TreeGrowthRecordRepository growthRecordRepository;
    private final TreeBatchRepository treeBatchRepository;
    private final ProjectPhaseRepository phaseRepository;
    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;

    /**
     * Chạy mỗi ngày lúc 8:00 sáng
     * Quét các bản ghi có health_status = DISEASED hoặc STRESSED
     */
    @Scheduled(cron = "0 0 8 * * *") // Mỗi ngày lúc 8:00 AM
    @Transactional(readOnly = true)
    public void scanUnhealthyTrees() {
        log.info("Starting health alert scan...");

        try {
            List<TreeGrowthRecord> unhealthyRecords = growthRecordRepository.findUnhealthyRecords();

            if (unhealthyRecords.isEmpty()) {
                log.info("No unhealthy records found");
                return;
            }

            log.info("Found {} unhealthy records", unhealthyRecords.size());

            for (TreeGrowthRecord record : unhealthyRecords) {
                processUnhealthyRecord(record);
            }

            log.info("Health alert scan completed");

        } catch (Exception e) {
            log.error("Error during health alert scan: {}", e.getMessage(), e);
        }
    }

    /**
     * Chạy mỗi giờ để check các record mới (real-time hơn)
     */
    @Scheduled(cron = "0 0 * * * *") // Mỗi giờ
    @Transactional(readOnly = true)
    public void quickHealthCheck() {
        log.debug("Running quick health check...");

        try {
            // Only check records from the last hour
            List<TreeGrowthRecord> recentUnhealthy = growthRecordRepository.findByHealthStatus(HealthStatus.DISEASED);
            List<TreeGrowthRecord> stressedRecords = growthRecordRepository.findByHealthStatus(HealthStatus.STRESSED);

            recentUnhealthy.addAll(stressedRecords);

            for (TreeGrowthRecord record : recentUnhealthy) {
                // Only alert if this is a new issue (created within last hour)
                if (record.getCreatedAt() != null &&
                        record.getCreatedAt().isAfter(OffsetDateTime.now().minusHours(1))) {
                    processUnhealthyRecord(record);
                }
            }

        } catch (Exception e) {
            log.error("Error during quick health check: {}", e.getMessage(), e);
        }
    }

    private void processUnhealthyRecord(TreeGrowthRecord record) {
        try {
            // Get batch info
            TreeBatch batch = treeBatchRepository.findById(record.getBatchId()).orElse(null);
            if (batch == null) {
                log.warn("Batch not found for record: {}", record.getId());
                return;
            }

            // Get project manager
            UUID managerId = getProjectManagerId(batch);
            if (managerId == null) {
                log.warn("No manager found for batch: {}", batch.getBatchCode());
                // Send to all admins instead
                sendAlertToAdmins(record, batch);
                return;
            }

            // Create alert notification
            String title = record.getHealthStatus().equals(HealthStatus.DISEASED)
                    ? "🚨 Cảnh báo: Lô cây bị bệnh"
                    : "⚠️ Cảnh báo: Lô cây có dấu hiệu stress";

            String message = String.format(
                    "Lô cây %s tại Farm #%d có trạng thái %s. Ghi nhận ngày: %s. %s",
                    batch.getBatchCode(),
                    batch.getFarmId(),
                    record.getHealthStatus(),
                    record.getRecordedDate(),
                    record.getHealthNotes() != null ? "Ghi chú: " + record.getHealthNotes() : "");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("batchId", batch.getId());
            metadata.put("batchCode", batch.getBatchCode());
            metadata.put("farmId", batch.getFarmId());
            metadata.put("healthStatus", record.getHealthStatus());
            metadata.put("recordedDate", record.getRecordedDate().toString());
            metadata.put("quantityAlive", record.getQuantityAlive());
            metadata.put("quantityDead", record.getQuantityDead());

            notificationService.createAndSend(
                    managerId,
                    title,
                    message,
                    NotificationType.HEALTH_ALERT,
                    ReferenceType.TREE_BATCH,
                    batch.getId(),
                    metadata);

            log.info("Sent health alert for batch: {} to manager: {}", batch.getBatchCode(), managerId);

        } catch (Exception e) {
            log.error("Error processing unhealthy record {}: {}", record.getId(), e.getMessage());
        }
    }

    private void sendAlertToAdmins(TreeGrowthRecord record, TreeBatch batch) {
        String title = record.getHealthStatus().equals(HealthStatus.DISEASED)
                ? "🚨 Cảnh báo: Lô cây bị bệnh"
                : "⚠️ Cảnh báo: Lô cây có dấu hiệu stress";

        String message = String.format(
                "Lô cây %s tại Farm #%d có trạng thái %s. Ghi nhận ngày: %s.",
                batch.getBatchCode(),
                batch.getFarmId(),
                record.getHealthStatus(),
                record.getRecordedDate());

        notificationService.sendToAdmins(
                title,
                message,
                NotificationType.HEALTH_ALERT,
                ReferenceType.TREE_BATCH,
                batch.getId());
    }

    private UUID getProjectManagerId(TreeBatch batch) {
        if (batch.getPhaseId() == null) {
            return null;
        }

        return phaseRepository.findById(batch.getPhaseId())
                .map(phase -> {
                    Integer projectId = phase.getProjectId();
                    return projectRepository.findById(projectId)
                            .map(Project::getManagerId)
                            .orElse(null);
                })
                .orElse(null);
    }
}
