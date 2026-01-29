package com.capston.project.back.end.service;

import com.capston.project.back.end.response.TreeBatchResponse;
import com.capston.project.back.end.request.TreeBatchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface cho quản lý lô cây (Tree Batches)
 */
public interface TreeBatchService {

    // ==================== CRUD ====================

    TreeBatchResponse createTreeBatch(TreeBatchRequest request);

    TreeBatchResponse getTreeBatchById(Integer id);

    TreeBatchResponse getTreeBatchByCode(String batchCode);

    TreeBatchResponse updateTreeBatch(Integer id, TreeBatchRequest request);

    void deleteTreeBatch(Integer id);

    // ==================== LIST & FILTER ====================

    Page<TreeBatchResponse> getAllTreeBatches(Pageable pageable);

//    List<TreeBatchResponse> getTreeBatchesByFarmId(Integer farmId);
//
//    List<TreeBatchResponse> getTreeBatchesByPhaseId(Integer phaseId);
//
//    List<TreeBatchResponse> getTreeBatchesBySpeciesId(Integer speciesId);

    // ==================== STATISTICS ====================

    Integer getTotalTreesByFarmId(Integer farmId);

    Object getAreaInfoByFarmId(Integer farmId);

    // ==================== VALIDATION ====================

    /**
     * Kiểm tra diện tích trồng không vượt quá diện tích sử dụng của farm
     */
    void validatePlantingArea(Integer farmId, java.math.BigDecimal newArea, Integer excludeBatchId);
}
