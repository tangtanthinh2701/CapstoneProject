package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.BatchStatus;
import com.capston.project.back.end.entity.Farm;
import com.capston.project.back.end.entity.TreeBatch;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.ProjectPhaseRepository;
import com.capston.project.back.end.repository.TreeBatchRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.request.TreeBatchRequest;
import com.capston.project.back.end.service.TreeBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TreeBatchServiceImpl implements TreeBatchService {

    private final TreeBatchRepository treeBatchRepository;
    private final FarmRepository farmRepository;
    private final TreeSpeciesRepository treeSpeciesRepository;
    private final ProjectPhaseRepository projectPhaseRepository;

    // ==================== CRUD ====================

    @Override
    public TreeBatch createTreeBatch(TreeBatchRequest request) {
        log.info("Creating tree batch for farm: {}", request.getFarmId());

        // Validate farm exists
        if (!farmRepository.existsById(request.getFarmId())) {
            throw new ResourceNotFoundException("Farm not found: " + request.getFarmId());
        }

        // Validate tree species exists
        if (!treeSpeciesRepository.existsById(request.getTreeSpeciesId())) {
            throw new ResourceNotFoundException("Tree species not found: " + request.getTreeSpeciesId());
        }

        // Validate phase exists (if provided)
        if (request.getPhaseId() != null && !projectPhaseRepository.existsById(request.getPhaseId())) {
            throw new ResourceNotFoundException("Project phase not found: " + request.getPhaseId());
        }

        // Validate planting area
        if (request.getPlantingAreaM2() != null) {
            validatePlantingArea(request.getFarmId(), request.getPlantingAreaM2(), null);
        }

        // Generate batch code
        String batchCode = generateBatchCode(request.getFarmId());

        TreeBatch batch = TreeBatch.builder()
                .batchCode(batchCode)
                .farmId(request.getFarmId())
                .treeSpeciesId(request.getTreeSpeciesId())
                .phaseId(request.getPhaseId())
                .quantityPlanted(request.getQuantityPlanted())
                .plantingDate(request.getPlantingDate())
                .plantingAreaM2(request.getPlantingAreaM2())
                .supplierName(request.getSupplierName())
                .unitCost(request.getUnitCost())
                .totalCost(request.getTotalCost())
                .notes(request.getNotes())
                .createdBy(request.getCreatedBy())
                .batchStatus(BatchStatus.ACTIVE)
                .build();

        TreeBatch saved = treeBatchRepository.save(batch);
        log.info("Tree batch created: {}", saved.getBatchCode());

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public TreeBatch getTreeBatchById(Integer id) {
        return treeBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public TreeBatch getTreeBatchByCode(String batchCode) {
        return treeBatchRepository.findByBatchCode(batchCode)
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + batchCode));
    }

    @Override
    public TreeBatch updateTreeBatch(Integer id, TreeBatchRequest request) {
        log.info("Updating tree batch: {}", id);

        TreeBatch batch = getTreeBatchById(id);

        // Validate planting area if changed
        if (request.getPlantingAreaM2() != null &&
                (batch.getPlantingAreaM2() == null ||
                        !batch.getPlantingAreaM2().equals(request.getPlantingAreaM2()))) {
            validatePlantingArea(batch.getFarmId(), request.getPlantingAreaM2(), id);
        }

        // Update fields
        if (request.getQuantityPlanted() != null) {
            batch.setQuantityPlanted(request.getQuantityPlanted());
        }
        if (request.getPlantingDate() != null) {
            batch.setPlantingDate(request.getPlantingDate());
        }
        if (request.getPlantingAreaM2() != null) {
            batch.setPlantingAreaM2(request.getPlantingAreaM2());
        }
        if (request.getSupplierName() != null) {
            batch.setSupplierName(request.getSupplierName());
        }
        if (request.getUnitCost() != null) {
            batch.setUnitCost(request.getUnitCost());
        }
        if (request.getTotalCost() != null) {
            batch.setTotalCost(request.getTotalCost());
        }
        if (request.getNotes() != null) {
            batch.setNotes(request.getNotes());
        }

        TreeBatch saved = treeBatchRepository.save(batch);
        log.info("Tree batch updated: {}", saved.getBatchCode());

        return saved;
    }

    @Override
    public void deleteTreeBatch(Integer id) {
        log.info("Deleting tree batch: {}", id);

        TreeBatch batch = getTreeBatchById(id);
        batch.setBatchStatus(BatchStatus.REMOVED);
        treeBatchRepository.save(batch);

        log.info("Tree batch marked as REMOVED: {}", batch.getBatchCode());
    }

    // ==================== LIST & FILTER ====================

    @Override
    @Transactional(readOnly = true)
    public Page<TreeBatch> getAllTreeBatches(Pageable pageable) {
        return treeBatchRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreeBatch> getTreeBatchesByFarmId(Integer farmId) {
        return treeBatchRepository.findByFarmId(farmId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreeBatch> getTreeBatchesByPhaseId(Integer phaseId) {
        return treeBatchRepository.findByPhaseId(phaseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreeBatch> getTreeBatchesBySpeciesId(Integer speciesId) {
        return treeBatchRepository.findByTreeSpeciesId(speciesId);
    }

    // ==================== STATISTICS ====================

    @Override
    @Transactional(readOnly = true)
    public Integer getTotalTreesByFarmId(Integer farmId) {
        Integer total = treeBatchRepository.sumQuantityPlantedByFarmId(farmId);
        return total != null ? total : 0;
    }

    @Override
    @Transactional(readOnly = true)
    public Object getAreaInfoByFarmId(Integer farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + farmId));

        BigDecimal usedArea = treeBatchRepository.sumPlantingAreaByFarmId(farmId);
        if (usedArea == null)
            usedArea = BigDecimal.ZERO;

        BigDecimal usableArea = farm.getUsableArea() != null ? farm.getUsableArea() : farm.getArea();
        BigDecimal availableArea = usableArea.subtract(usedArea);

        Map<String, Object> areaInfo = new HashMap<>();
        areaInfo.put("farmId", farmId);
        areaInfo.put("totalArea", farm.getArea());
        areaInfo.put("usableArea", usableArea);
        areaInfo.put("usedArea", usedArea);
        areaInfo.put("availableArea", availableArea);
        areaInfo.put("usagePercentage", usableArea.compareTo(BigDecimal.ZERO) > 0
                ? usedArea.divide(usableArea, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal(100))
                : BigDecimal.ZERO);

        return areaInfo;
    }

    // ==================== VALIDATION ====================

    @Override
    public void validatePlantingArea(Integer farmId, BigDecimal newArea, Integer excludeBatchId) {
        log.info("Validating planting area for farm: {}, newArea: {}", farmId, newArea);

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + farmId));

        BigDecimal usableArea = farm.getUsableArea() != null ? farm.getUsableArea() : farm.getArea();

        // Calculate current used area (excluding the batch being updated)
        BigDecimal currentUsedArea = treeBatchRepository.sumPlantingAreaByFarmId(farmId);
        if (currentUsedArea == null)
            currentUsedArea = BigDecimal.ZERO;

        // If updating, subtract the old area of this batch
        if (excludeBatchId != null) {
            TreeBatch existingBatch = treeBatchRepository.findById(excludeBatchId).orElse(null);
            if (existingBatch != null && existingBatch.getPlantingAreaM2() != null) {
                currentUsedArea = currentUsedArea.subtract(existingBatch.getPlantingAreaM2());
            }
        }

        BigDecimal totalAfterAdd = currentUsedArea.add(newArea);

        if (totalAfterAdd.compareTo(usableArea) > 0) {
            throw new IllegalArgumentException(
                    String.format("Planting area exceeds available space. Usable: %s m², Used: %s m², Requested: %s m²",
                            usableArea, currentUsedArea, newArea));
        }

        log.info("Planting area validation passed. Available: {} m²", usableArea.subtract(currentUsedArea));
    }

    // ==================== HELPER ====================

    private String generateBatchCode(Integer farmId) {
        long count = treeBatchRepository.countByFarmId(farmId);
        return String.format("BATCH-%d-%04d", farmId, count + 1);
    }
}
