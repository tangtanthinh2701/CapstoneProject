package com.capston.project.back.end.controller;

import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.TreeBatchService;
import com.capston.project.back.end.request.TreeBatchRequest;
import com.capston.project.back.end.entity.TreeBatch;
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

/**
 * Controller quản lý lô cây (Tree Batches)
 * ADMIN: Full CRUD
 * USER: Chỉ xem
 */
@RestController
@RequestMapping("/api/tree-batches")
@RequiredArgsConstructor
@Slf4j
public class TreeBatchController {

    private final TreeBatchService treeBatchService;

    // ==================== CRUD ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<TreeBatch>> createTreeBatch(@Valid @RequestBody TreeBatchRequest request) {
        TreeBatch batch = treeBatchService.createTreeBatch(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tree batch created successfully", batch));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TreeBatch>> getTreeBatchById(@PathVariable Integer id) {
        TreeBatch batch = treeBatchService.getTreeBatchById(id);
        return ResponseEntity.ok(ApiResponse.success(batch));
    }

    @GetMapping("/code/{batchCode}")
    public ResponseEntity<ApiResponse<TreeBatch>> getTreeBatchByCode(@PathVariable String batchCode) {
        TreeBatch batch = treeBatchService.getTreeBatchByCode(batchCode);
        return ResponseEntity.ok(ApiResponse.success(batch));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<TreeBatch>> updateTreeBatch(
            @PathVariable Integer id,
            @Valid @RequestBody TreeBatchRequest request) {
        TreeBatch batch = treeBatchService.updateTreeBatch(id, request);
        return ResponseEntity.ok(ApiResponse.success("Tree batch updated successfully", batch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<Void>> deleteTreeBatch(@PathVariable Integer id) {
        treeBatchService.deleteTreeBatch(id);
        return ResponseEntity.ok(ApiResponse.success("Tree batch deleted successfully", null));
    }

    // ==================== LIST & FILTER ====================

    @GetMapping
    public ResponseEntity<ApiResponse<List<TreeBatch>>> getAllTreeBatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TreeBatch> batchPage = treeBatchService.getAllTreeBatches(pageable);

        return ResponseEntity.ok(ApiResponse.success(
                "Tree batches retrieved successfully",
                batchPage.getContent(),
                buildPageInfo(batchPage)));
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<ApiResponse<List<TreeBatch>>> getTreeBatchesByFarm(@PathVariable Integer farmId) {
        List<TreeBatch> batches = treeBatchService.getTreeBatchesByFarmId(farmId);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    @GetMapping("/phase/{phaseId}")
    public ResponseEntity<ApiResponse<List<TreeBatch>>> getTreeBatchesByPhase(@PathVariable Integer phaseId) {
        List<TreeBatch> batches = treeBatchService.getTreeBatchesByPhaseId(phaseId);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    @GetMapping("/species/{speciesId}")
    public ResponseEntity<ApiResponse<List<TreeBatch>>> getTreeBatchesBySpecies(@PathVariable Integer speciesId) {
        List<TreeBatch> batches = treeBatchService.getTreeBatchesBySpeciesId(speciesId);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    // ==================== STATISTICS ====================

    @GetMapping("/farm/{farmId}/total-trees")
    public ResponseEntity<ApiResponse<Integer>> getTotalTreesByFarm(@PathVariable Integer farmId) {
        Integer totalTrees = treeBatchService.getTotalTreesByFarmId(farmId);
        return ResponseEntity.ok(ApiResponse.success(totalTrees));
    }

    @GetMapping("/farm/{farmId}/total-area")
    public ResponseEntity<ApiResponse<Object>> getTotalAreaByFarm(@PathVariable Integer farmId) {
        Object areaInfo = treeBatchService.getAreaInfoByFarmId(farmId);
        return ResponseEntity.ok(ApiResponse.success(areaInfo));
    }

    // ==================== HELPER ====================

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
