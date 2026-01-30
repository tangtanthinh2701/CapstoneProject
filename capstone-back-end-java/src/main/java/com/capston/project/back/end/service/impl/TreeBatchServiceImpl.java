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
import com.capston.project.back.end.response.TreeBatchResponse;
import com.capston.project.back.end.service.TreeBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.capston.project.back.end.util.SecurityUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TreeBatchServiceImpl implements TreeBatchService {

    private final TreeBatchRepository treeBatchRepository;
    private final FarmRepository farmRepository;
    private final TreeSpeciesRepository treeSpeciesRepository;
    private final ProjectPhaseRepository projectPhaseRepository;
    private final SecurityUtils securityUtils;

    // ==================== CRUD ====================

    @Override
    public TreeBatchResponse createTreeBatch(TreeBatchRequest request) {
        log.info("Creating tree batch for farm: {}", request.getFarmId());

        // For FARMER role, verify they manage this farm
        if (securityUtils.isFarmer()) {
            Farm farm = farmRepository.findById(request.getFarmId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + request.getFarmId()));
            if (farm.getCreatedBy() == null || !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not authorized to manage this farm");
            }
        }

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
                .createdBy(securityUtils.getCurrentUserId()) // Set correctly from context
                .batchStatus(BatchStatus.ACTIVE)
                .build();

        TreeBatch saved = treeBatchRepository.save(batch);
        log.info("Tree batch created: {}", saved.getBatchCode());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TreeBatchResponse getTreeBatchById(Integer id) {
        TreeBatch batch = treeBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + id));
        return mapToResponse(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public TreeBatchResponse getTreeBatchByCode(String batchCode) {
        TreeBatch batch = treeBatchRepository.findByBatchCode(batchCode)
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + batchCode));
        return mapToResponse(batch);
    }

    @Override
    public TreeBatchResponse updateTreeBatch(Integer id, TreeBatchRequest request) {
        log.info("Updating tree batch: {}", id);

        TreeBatch batch = treeBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + id));

        // For FARMER role, verify they manage the farm of this batch
        if (securityUtils.isFarmer()) {
            Farm farm = farmRepository.findById(batch.getFarmId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farm not found: " + batch.getFarmId()));
            if (farm.getCreatedBy() == null || !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not authorized to update batches in this farm");
            }
        }

        // Validate planting area if changed
        if (request.getPlantingAreaM2() != null &&
                (batch.getPlantingAreaM2() == null ||
                        !batch.getPlantingAreaM2().equals(request.getPlantingAreaM2()))) {
            validatePlantingArea(batch.getFarmId(), request.getPlantingAreaM2(), id);
        }

        // Update fields
        if (request.getFarmId() != null && !request.getFarmId().equals(batch.getFarmId())) {
            if (!farmRepository.existsById(request.getFarmId())) {
                throw new ResourceNotFoundException("Farm not found: " + request.getFarmId());
            }
            batch.setFarmId(request.getFarmId());
        }

        if (request.getTreeSpeciesId() != null && !request.getTreeSpeciesId().equals(batch.getTreeSpeciesId())) {
            if (!treeSpeciesRepository.existsById(request.getTreeSpeciesId())) {
                throw new ResourceNotFoundException("Tree species not found: " + request.getTreeSpeciesId());
            }
            batch.setTreeSpeciesId(request.getTreeSpeciesId());
        }

        if (request.getPhaseId() != null && !request.getPhaseId().equals(batch.getPhaseId())) {
            if (!projectPhaseRepository.existsById(request.getPhaseId())) {
                throw new ResourceNotFoundException("Project phase not found: " + request.getPhaseId());
            }
            batch.setPhaseId(request.getPhaseId());
        }

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

        return mapToResponse(saved);
    }

    @Override
    public void deleteTreeBatch(Integer id) {
        log.info("Deleting tree batch: {}", id);

        TreeBatch batch = treeBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tree batch not found: " + id));

        // For FARMER role, verify access
        if (securityUtils.isFarmer()) {
            Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
            if (farm == null || farm.getCreatedBy() == null
                    || !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not authorized to delete batches in this farm");
            }
        }
        batch.setBatchStatus(BatchStatus.REMOVED);
        treeBatchRepository.save(batch);

        log.info("Tree batch marked as REMOVED: {}", batch.getBatchCode());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TreeBatchResponse> getAllTreeBatches(Pageable pageable) {
        // FARMER: Only see batches from their own farms
        if (securityUtils.isFarmer()) {
            UUID currentUserId = securityUtils.getCurrentUserId();

            // Filter batches by farm ownership at database level
            Page<TreeBatch> allBatches = treeBatchRepository.findAll(pageable);

            List<TreeBatchResponse> filteredBatches = allBatches.getContent().stream()
                    .filter(batch -> {
                        Farm farm = farmRepository.findById(batch.getFarmId()).orElse(null);
                        return farm != null && farm.getCreatedBy() != null
                                && farm.getCreatedBy().equals(currentUserId);
                    })
                    .map(this::mapToResponse)
                    .toList();

            return new org.springframework.data.domain.PageImpl<>(
                    filteredBatches,
                    pageable,
                    filteredBatches.size());
        }

        // ADMIN: See all batches
        return treeBatchRepository.findAll(pageable).map(this::mapToResponse);
    }

    // @Override
    // @Transactional(readOnly = true)
    // public List<TreeBatchResponse> getTreeBatchesByFarmId(Integer farmId) {
    // return treeBatchRepository.findByFarmId(farmId).stream()
    // .map(this::mapToResponse)
    // .collect(java.util.stream.Collectors.toList());
    // }
    //
    // @Override
    // @Transactional(readOnly = true)
    // public List<TreeBatchResponse> getTreeBatchesByPhaseId(Integer phaseId) {
    // return treeBatchRepository.findByPhaseId(phaseId).stream()
    // .map(this::mapToResponse)
    // .collect(java.util.stream.Collectors.toList());
    // }
    //
    // @Override
    // @Transactional(readOnly = true)
    // public List<TreeBatchResponse> getTreeBatchesBySpeciesId(Integer speciesId) {
    // return treeBatchRepository.findByTreeSpeciesId(speciesId).stream()
    // .map(this::mapToResponse)
    // .collect(java.util.stream.Collectors.toList());
    // }

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

        // 1. Kiểm tra Mật độ (Density check) - Một quy tắc "hợp lý" về nông nghiệp
        // Giả sử mật độ tối đa không nên vượt quá 20 cây / m2 (rất dày)
        // Nếu vượt quá mức này, khả năng cao là người dùng nhập nhầm đơn vị hoặc số
        // liệu
        Integer currentQuantity = 0;
        if (excludeBatchId != null) {
            TreeBatch existingBatch = treeBatchRepository.findById(excludeBatchId).orElse(null);
            if (existingBatch != null)
                currentQuantity = existingBatch.getQuantityPlanted();
        }

        if (newArea.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal treesPerM2 = new BigDecimal(currentQuantity).divide(newArea, 2, java.math.RoundingMode.HALF_UP);
            if (treesPerM2.compareTo(new BigDecimal("20")) > 0) {
                throw new IllegalArgumentException(String.format(
                        "Mật độ trồng quá dày (%s cây/m²). Với %s cây, diện tích %s m² là không hợp lý. Vui lòng kiểm tra và nhập lại diện tích thực tế.",
                        treesPerM2, currentQuantity, newArea));
            }
        }

        // 2. Kiểm tra Tổng diện tích trang trại (Capacity check)
        BigDecimal totalUsedArea = treeBatchRepository.sumPlantingAreaByFarmId(farmId);
        if (totalUsedArea == null)
            totalUsedArea = BigDecimal.ZERO;

        BigDecimal oldArea = BigDecimal.ZERO;
        if (excludeBatchId != null) {
            TreeBatch existingBatch = treeBatchRepository.findById(excludeBatchId).orElse(null);
            if (existingBatch != null && existingBatch.getPlantingAreaM2() != null) {
                oldArea = existingBatch.getPlantingAreaM2();
            }
        }

        BigDecimal usedByOthers = totalUsedArea.subtract(oldArea);
        BigDecimal totalAfterUpdate = usedByOthers.add(newArea);

        if (totalAfterUpdate.compareTo(usableArea) > 0) {
            String advice = (newArea.compareTo(oldArea) < 0)
                    ? "Mặc dù bạn đã giảm diện tích, nhưng tổng diện tích trang trại vẫn đang quá tải. "
                    : "Diện tích này vượt quá khả năng của trang trại. ";

            throw new IllegalArgumentException(String.format(
                    "%sHiện tại: %s/%s m². Vui lòng cập nhật lại diện tích trang trại hoặc điều chỉnh các lô cây khác trước khi lưu.",
                    advice, totalAfterUpdate.setScale(1, java.math.RoundingMode.HALF_UP),
                    usableArea.setScale(1, java.math.RoundingMode.HALF_UP)));
        }
    }

    // ==================== HELPER ====================

    private String generateBatchCode(Integer farmId) {
        long count = treeBatchRepository.countByFarmId(farmId);
        return String.format("BATCH-%d-%04d", farmId, count + 1);
    }

    private TreeBatchResponse mapToResponse(TreeBatch entity) {
        TreeBatchResponse response = TreeBatchResponse.builder()
                .id(entity.getId())
                .batchCode(entity.getBatchCode())
                .farmId(entity.getFarmId())
                .treeSpeciesId(entity.getTreeSpeciesId())
                .phaseId(entity.getPhaseId())
                .quantityPlanted(entity.getQuantityPlanted())
                .plantingDate(entity.getPlantingDate())
                .plantingAreaM2(entity.getPlantingAreaM2())
                .supplierName(entity.getSupplierName())
                .unitCost(entity.getUnitCost())
                .totalCost(entity.getTotalCost())
                .batchStatus(entity.getBatchStatus())
                .notes(entity.getNotes())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        // Populate names if entities are loaded or fetch if needed
        if (entity.getFarm() != null) {
            response.setFarmName(entity.getFarm().getName());
        } else {
            farmRepository.findById(entity.getFarmId()).ifPresent(f -> response.setFarmName(f.getName()));
        }

        if (entity.getTreeSpecies() != null) {
            response.setTreeSpeciesName(entity.getTreeSpecies().getName());
        } else {
            treeSpeciesRepository.findById(entity.getTreeSpeciesId())
                    .ifPresent(ts -> response.setTreeSpeciesName(ts.getName()));
        }

        if (entity.getPhase() != null) {
            response.setPhaseName(entity.getPhase().getPhaseName());
        } else if (entity.getPhaseId() != null) {
            projectPhaseRepository.findById(entity.getPhaseId())
                    .ifPresent(p -> response.setPhaseName(p.getPhaseName()));
        }

        return response;
    }
}
