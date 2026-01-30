package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.HealthStatus;
import com.capston.project.back.end.entity.*;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.*;
import com.capston.project.back.end.request.TreeGrowthRecordRequest;
import com.capston.project.back.end.service.ApprovalWebSocketService;
import com.capston.project.back.end.service.TreeGrowthRecordService;
import com.capston.project.back.end.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TreeGrowthRecordServiceImpl implements TreeGrowthRecordService {

    private final TreeGrowthRecordRepository growthRecordRepository;
    private final TreeBatchRepository treeBatchRepository;
    private final TreeSpeciesRepository treeSpeciesRepository;
    private final FarmEnvironmentRecordRepository environmentRecordRepository;
    private final FarmRepository farmRepository;
    private final ProjectRepository projectRepository;
    private final ProjectPhaseRepository projectPhaseRepository;
    private final SecurityUtils securityUtils;
    private final ApprovalWebSocketService webSocketService;

    // ==================== CRUD ====================

    @Override
    public TreeGrowthRecord createGrowthRecord(TreeGrowthRecordRequest request) {
        log.info("Creating growth record for batch: {}", request.getBatchId());

        TreeBatch batch = treeBatchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + request.getBatchId()));

        // For FARMER role, verify they manage the farm of this batch
        if (securityUtils.isFarmer()) {
            Farm farm = farmRepository.findById(batch.getFarmId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + batch.getFarmId()));
            if (farm.getCreatedBy() == null || !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not authorized to create records for this farm");
            }
        }

        BigDecimal environmentFactor = request.getEnvironmentFactor();
        if (environmentFactor == null) {
            environmentFactor = getEnvironmentFactor(batch.getFarmId(), request.getRecordedDate());
        }

        // NEW LOGIC: Calculate cumulative deaths
        int newDeaths = request.getQuantityDead() != null ? request.getQuantityDead() : 0;
        int previousCumulativeDeaths = getCumulativeDeathsBeforeDate(request.getBatchId(), request.getRecordedDate());
        int totalCumulativeDeaths = previousCumulativeDeaths + newDeaths;

        int quantityPlanted = batch.getQuantityPlanted();
        int quantityAlive = quantityPlanted - totalCumulativeDeaths;

        // Validation: Cannot have more deaths than planted
        if (quantityAlive < 0) {
            throw new IllegalArgumentException(
                    String.format(
                            "Total cumulative deaths (%d) cannot exceed quantity planted (%d). Previous deaths: %d, New deaths: %d",
                            totalCumulativeDeaths, quantityPlanted, previousCumulativeDeaths, newDeaths));
        }

        // Validation: New deaths cannot be negative
        if (newDeaths < 0) {
            throw new IllegalArgumentException("Number of new deaths cannot be negative");
        }

        log.info("Batch {}: Planted={}, PreviousDeaths={}, NewDeaths={}, TotalDeaths={}, Alive={}",
                batch.getBatchCode(), quantityPlanted, previousCumulativeDeaths, newDeaths,
                totalCumulativeDeaths, quantityAlive);

        // Set recordedBy from security context if not provided
        UUID recordedBy = request.getRecordedBy() != null ? request.getRecordedBy() : securityUtils.getCurrentUserId();

        TreeGrowthRecord record = TreeGrowthRecord.builder()
                .batchId(request.getBatchId())
                .recordedDate(request.getRecordedDate())
                .quantityAlive(quantityAlive)
                .quantityDead(newDeaths) // Store only NEW deaths in this record
                .avgHeightCm(request.getAvgHeightCm())
                .avgTrunkDiameterCm(request.getAvgTrunkDiameterCm())
                .avgCanopyDiameterCm(request.getAvgCanopyDiameterCm())
                .healthStatus(request.getHealthStatus() != null ? request.getHealthStatus() : HealthStatus.HEALTHY)
                .healthNotes(request.getHealthNotes())
                .environmentFactor(environmentFactor)
                .recordedBy(recordedBy)
                .build();

        BigDecimal co2Absorbed = calculateCO2Absorbed(batch, record);
        record.setCo2AbsorbedKg(co2Absorbed);

        TreeGrowthRecord saved = growthRecordRepository.save(record);
        log.info("Growth record created with CO2: {} kg, Alive: {}, New deaths: {}",
                co2Absorbed, quantityAlive, newDeaths);

        updateProjectCO2(batch);

        // Notify if health issue detected
        if (saved.getHealthStatus() != HealthStatus.HEALTHY) {
            Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
            if (farm != null && farm.getCreatedBy() != null) {
                webSocketService.notifyTreeHealthIssue(
                        farm.getCreatedBy(),
                        saved.getBatchId(),
                        batch.getBatchCode(),
                        saved.getHealthStatus().name(),
                        saved.getHealthNotes());
            }
        }

        // Notify if significant deaths occurred
        if (newDeaths > 0) {
            Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
            if (farm != null && farm.getCreatedBy() != null) {
                double deathRate = (newDeaths * 100.0) / quantityPlanted;
                if (deathRate > 5.0) { // Alert if more than 5% mortality in one record
                    webSocketService.notifyTreeHealthIssue(
                            farm.getCreatedBy(),
                            saved.getBatchId(),
                            batch.getBatchCode(),
                            "HIGH_MORTALITY",
                            String.format("%d cây chết (%.1f%% của tổng số cây trồng)", newDeaths, deathRate));
                }
            }
        }

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public TreeGrowthRecord getGrowthRecordById(Integer id) {
        return growthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Growth record not found: " + id));
    }

    @Override
    public TreeGrowthRecord updateGrowthRecord(Integer id, TreeGrowthRecordRequest request) {
        log.info("Updating growth record: {}", id);

        TreeGrowthRecord record = getGrowthRecordById(id);
        TreeBatch batch = treeBatchRepository.findById(record.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found"));

        // For FARMER role, verify access
        if (securityUtils.isFarmer()) {
            Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
            if (farm == null || farm.getCreatedBy() == null
                    || !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not authorized to update records for this farm");
            }
        }

        LocalDate recordDate = record.getRecordedDate();
        if (request.getRecordedDate() != null) {
            recordDate = request.getRecordedDate();
            record.setRecordedDate(recordDate);
        }

        // NEW LOGIC: Recalculate quantityAlive when quantityDead is updated
        if (request.getQuantityDead() != null) {
            int newDeaths = request.getQuantityDead();

            // Validation: New deaths cannot be negative
            if (newDeaths < 0) {
                throw new IllegalArgumentException("Number of deaths cannot be negative");
            }

            // Get cumulative deaths BEFORE this record (excluding this record)
            int previousCumulativeDeaths = getCumulativeDeathsBeforeDate(record.getBatchId(), recordDate);
            int totalCumulativeDeaths = previousCumulativeDeaths + newDeaths;

            int quantityPlanted = batch.getQuantityPlanted();
            int quantityAlive = quantityPlanted - totalCumulativeDeaths;

            // Validation: Cannot have more deaths than planted
            if (quantityAlive < 0) {
                throw new IllegalArgumentException(
                        String.format(
                                "Total cumulative deaths (%d) cannot exceed quantity planted (%d). Previous deaths: %d, This record deaths: %d",
                                totalCumulativeDeaths, quantityPlanted, previousCumulativeDeaths, newDeaths));
            }

            log.info("Updating record {}: Planted={}, PreviousDeaths={}, NewDeaths={}, TotalDeaths={}, Alive={}",
                    id, quantityPlanted, previousCumulativeDeaths, newDeaths, totalCumulativeDeaths, quantityAlive);

            record.setQuantityDead(newDeaths);
            record.setQuantityAlive(quantityAlive);
        }

        if (request.getAvgHeightCm() != null)
            record.setAvgHeightCm(request.getAvgHeightCm());
        if (request.getAvgTrunkDiameterCm() != null)
            record.setAvgTrunkDiameterCm(request.getAvgTrunkDiameterCm());
        if (request.getAvgCanopyDiameterCm() != null)
            record.setAvgCanopyDiameterCm(request.getAvgCanopyDiameterCm());
        if (request.getHealthStatus() != null)
            record.setHealthStatus(request.getHealthStatus());
        if (request.getHealthNotes() != null)
            record.setHealthNotes(request.getHealthNotes());
        if (request.getEnvironmentFactor() != null)
            record.setEnvironmentFactor(request.getEnvironmentFactor());

        // Ensure recordedBy is updated if not set
        if (record.getRecordedBy() == null) {
            record.setRecordedBy(securityUtils.getCurrentUserId());
        }

        BigDecimal co2Absorbed = calculateCO2Absorbed(batch, record);
        record.setCo2AbsorbedKg(co2Absorbed);

        TreeGrowthRecord saved = growthRecordRepository.save(record);
        updateProjectCO2(batch);

        // Notify if health issue detected
        if (saved.getHealthStatus() != HealthStatus.HEALTHY) {
            Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
            if (farm != null && farm.getCreatedBy() != null) {
                webSocketService.notifyTreeHealthIssue(
                        farm.getCreatedBy(),
                        saved.getBatchId(),
                        batch.getBatchCode(),
                        saved.getHealthStatus().name(),
                        saved.getHealthNotes());
            }
        }

        return saved;
    }

    @Override
    public void deleteGrowthRecord(Integer id) {
        log.info("Deleting growth record: {}", id);
        TreeGrowthRecord record = getGrowthRecordById(id);
        TreeBatch batch = treeBatchRepository.findById(record.getBatchId()).orElse(null);

        // For FARMER role, verify access
        if (securityUtils.isFarmer()) {
            if (batch != null) {
                Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
                if (farm == null || farm.getCreatedBy() == null
                        || !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "You are not authorized to delete records for this farm");
                }
            }
        }

        growthRecordRepository.delete(record);

        if (batch != null) {
            updateProjectCO2(batch);
        }
    }

    // ==================== LIST & FILTER ====================

    @Override
    @Transactional(readOnly = true)
    public Page<TreeGrowthRecord> getAllGrowthRecords(Pageable pageable) {
        // FARMER: Only see records from their own farms' batches
        if (securityUtils.isFarmer()) {
            java.util.UUID currentUserId = securityUtils.getCurrentUserId();

            // Filter records by batch ownership (via farm)
            Page<TreeGrowthRecord> allRecords = growthRecordRepository.findAll(pageable);

            List<TreeGrowthRecord> filteredRecords = allRecords.getContent().stream()
                    .filter(record -> {
                        TreeBatch batch = treeBatchRepository.findById(record.getBatchId()).orElse(null);
                        if (batch == null)
                            return false;

                        Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
                        return farm != null && farm.getCreatedBy() != null
                                && farm.getCreatedBy().equals(currentUserId);
                    })
                    .toList();

            return new org.springframework.data.domain.PageImpl<>(
                    filteredRecords,
                    pageable,
                    filteredRecords.size());
        }

        // ADMIN: See all records
        return growthRecordRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreeGrowthRecord> getGrowthRecordsByBatchId(Integer batchId) {
        return growthRecordRepository.findByBatchIdOrderByRecordedDateDesc(batchId);
    }

    @Override
    @Transactional(readOnly = true)
    public TreeGrowthRecord getLatestGrowthRecord(Integer batchId) {
        return growthRecordRepository.findLatestByBatchId(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("No growth records found for batch: " + batchId));
    }

    // ==================== CO2 CALCULATION ====================

    private BigDecimal calculateCO2Absorbed(TreeBatch batch, TreeGrowthRecord record) {
        TreeSpecies species = treeSpeciesRepository.findById(batch.getTreeSpeciesId())
                .orElseThrow(() -> new ResourceNotFoundException("Tree species not found"));

        BigDecimal baseRate = species.getBaseCarbonRate();
        if (baseRate == null)
            baseRate = BigDecimal.ZERO;

        int quantityAlive = record.getQuantityAlive();
        BigDecimal envFactor = record.getEnvironmentFactor() != null ? record.getEnvironmentFactor() : BigDecimal.ONE;

        long daysSincePlanting = ChronoUnit.DAYS.between(batch.getPlantingDate(), record.getRecordedDate());
        if (daysSincePlanting < 0)
            daysSincePlanting = 0;
        BigDecimal yearsFactor = new BigDecimal(daysSincePlanting).divide(new BigDecimal(365), 4, RoundingMode.HALF_UP);

        return baseRate
                .multiply(yearsFactor)
                .multiply(envFactor)
                .multiply(new BigDecimal(quantityAlive))
                .setScale(4, RoundingMode.HALF_UP);
    }

    @Override
    public TreeGrowthRecord calculateAndUpdateCO2(Integer recordId) {
        TreeGrowthRecord record = getGrowthRecordById(recordId);
        TreeBatch batch = treeBatchRepository.findById(record.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found"));

        // For FARMER role, verify access
        if (securityUtils.isFarmer()) {
            Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
            if (farm == null || farm.getCreatedBy() == null
                    || !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not authorized to perform calculations for this farm");
            }
        }

        BigDecimal co2 = calculateCO2Absorbed(batch, record);
        record.setCo2AbsorbedKg(co2);
        TreeGrowthRecord saved = growthRecordRepository.save(record);
        updateProjectCO2(batch);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getCO2SummaryByBatchId(Integer batchId) {
        TreeBatch batch = treeBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + batchId));

        BigDecimal totalCO2 = growthRecordRepository.sumCO2AbsorbedByBatchId(batchId);
        if (totalCO2 == null)
            totalCO2 = BigDecimal.ZERO;

        TreeGrowthRecord latest = growthRecordRepository.findLatestByBatchId(batchId).orElse(null);

        Map<String, Object> summary = new HashMap<>();
        summary.put("batchId", batchId);
        summary.put("batchCode", batch.getBatchCode());
        summary.put("totalCO2Kg", totalCO2);
        summary.put("totalCO2Tons", totalCO2.divide(new BigDecimal(1000), 4, RoundingMode.HALF_UP));
        summary.put("latestRecordDate", latest != null ? latest.getRecordedDate() : null);
        summary.put("latestCO2Kg", latest != null ? latest.getCo2AbsorbedKg() : BigDecimal.ZERO);
        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getCO2SummaryByFarmId(Integer farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + farmId));

        BigDecimal totalCO2 = growthRecordRepository.sumCO2AbsorbedByFarmId(farmId);
        if (totalCO2 == null)
            totalCO2 = BigDecimal.ZERO;

        Integer totalTrees = treeBatchRepository.sumQuantityPlantedByFarmId(farmId);
        if (totalTrees == null)
            totalTrees = 0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("farmId", farmId);
        summary.put("farmName", farm.getName());
        summary.put("totalTrees", totalTrees);
        summary.put("totalCO2Kg", totalCO2);
        summary.put("totalCO2Tons", totalCO2.divide(new BigDecimal(1000), 4, RoundingMode.HALF_UP));
        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreeGrowthRecord> getUnhealthyRecords() {
        if (securityUtils.isFarmer()) {
            // For Farmers, only return unhealthy records from their managed farms
            return growthRecordRepository.findUnhealthyRecords().stream()
                    .filter(record -> {
                        TreeBatch batch = treeBatchRepository.findById(record.getBatchId()).orElse(null);
                        if (batch == null)
                            return false;
                        Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
                        return farm != null && securityUtils.getCurrentUserId().equals(farm.getCreatedBy());
                    })
                    .collect(java.util.stream.Collectors.toList());
        }
        return growthRecordRepository.findUnhealthyRecords();
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get cumulative deaths BEFORE a given date (excluding the date itself)
     * This is used to calculate how many trees have died before creating/updating a
     * record
     * 
     * @param batchId    The batch ID
     * @param beforeDate The date to check before (exclusive)
     * @return Total cumulative deaths before the given date
     */
    private int getCumulativeDeathsBeforeDate(Integer batchId, LocalDate beforeDate) {
        List<TreeGrowthRecord> previousRecords = growthRecordRepository
                .findByBatchIdOrderByRecordedDateDesc(batchId)
                .stream()
                .filter(r -> r.getRecordedDate().isBefore(beforeDate))
                .toList();

        int totalDeaths = 0;
        for (TreeGrowthRecord record : previousRecords) {
            if (record.getQuantityDead() != null) {
                totalDeaths += record.getQuantityDead();
            }
        }

        log.debug("Batch {}: Cumulative deaths before {}: {}", batchId, beforeDate, totalDeaths);
        return totalDeaths;
    }

    private BigDecimal getEnvironmentFactor(Integer farmId, LocalDate date) {
        Optional<FarmEnvironmentRecord> envRecord = environmentRecordRepository.findByFarmIdAndRecordedDate(farmId,
                date);
        if (envRecord.isPresent() && envRecord.get().getOverallFactor() != null)
            return envRecord.get().getOverallFactor();

        Optional<FarmEnvironmentRecord> latestRecord = environmentRecordRepository.findLatestByFarmId(farmId);
        if (latestRecord.isPresent() && latestRecord.get().getOverallFactor() != null)
            return latestRecord.get().getOverallFactor();

        return BigDecimal.ONE;
    }

    private void updateProjectCO2(TreeBatch batch) {
        Integer phaseId = batch.getPhaseId();
        if (phaseId == null)
            return;

        BigDecimal phaseActualCO2 = growthRecordRepository.sumLatestCO2ByPhaseId(phaseId);
        ProjectPhase phase = projectPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Project phase not found"));

        projectPhaseRepository.updateComputedFields(phaseId, phase.getActualCost(), phaseActualCO2);

        Integer projectId = phase.getProjectId();
        BigDecimal projectBudget = projectPhaseRepository.sumBudgetByProjectId(projectId);
        BigDecimal projectTargetCO2 = projectPhaseRepository.sumTargetCarbonByProjectId(projectId);
        BigDecimal projectActualCO2 = projectPhaseRepository.sumCurrentCarbonByProjectId(projectId);

        projectRepository.updateComputedFields(projectId, projectBudget, projectTargetCO2, projectActualCO2);
    }
}
