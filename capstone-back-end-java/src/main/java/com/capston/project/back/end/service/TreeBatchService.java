package com.capston.project.back.end.service;

import com.capston.project.back.end.entity.TreeBatch;
import com.capston.project.back.end.request.TreeBatchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface cho quản lý lô cây (Tree Batches)
 */
public interface TreeBatchService {

    // ==================== CRUD ====================

    TreeBatch createTreeBatch(TreeBatchRequest request);

    TreeBatch getTreeBatchById(Integer id);

    TreeBatch getTreeBatchByCode(String batchCode);

    TreeBatch updateTreeBatch(Integer id, TreeBatchRequest request);

    void deleteTreeBatch(Integer id);

    // ==================== LIST & FILTER ====================

    Page<TreeBatch> getAllTreeBatches(Pageable pageable);

    List<TreeBatch> getTreeBatchesByFarmId(Integer farmId);

    List<TreeBatch> getTreeBatchesByPhaseId(Integer phaseId);

    List<TreeBatch> getTreeBatchesBySpeciesId(Integer speciesId);

    // ==================== STATISTICS ====================

    Integer getTotalTreesByFarmId(Integer farmId);

    Object getAreaInfoByFarmId(Integer farmId);

    // ==================== VALIDATION ====================

    /**
     * Kiểm tra diện tích trồng không vượt quá diện tích sử dụng của farm
     */
    void validatePlantingArea(Integer farmId, java.math.BigDecimal newArea, Integer excludeBatchId);
}

