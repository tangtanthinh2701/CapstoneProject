package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.TreeGrowthRecord;
import com.capston.project.back.end.request.TreeGrowthRecordRequest;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.TreeGrowthRecordService;
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

/**
 * Controller quản lý ghi nhận sinh trưởng cây (Tree Growth Records)
 * ADMIN: Full CRUD + Tính toán CO2
 * USER: Chỉ xem
 */
@RestController
@RequestMapping("/api/tree-growth-records")
@RequiredArgsConstructor
@Slf4j
public class TreeGrowthRecordController {

    private final TreeGrowthRecordService growthRecordService;

    // ==================== CRUD ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<TreeGrowthRecord>> createGrowthRecord(
            @Valid @RequestBody TreeGrowthRecordRequest request) {
        TreeGrowthRecord record = growthRecordService.createGrowthRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Growth record created successfully", record));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TreeGrowthRecord>> getGrowthRecordById(@PathVariable Integer id) {
        TreeGrowthRecord record = growthRecordService.getGrowthRecordById(id);
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<TreeGrowthRecord>> updateGrowthRecord(
            @PathVariable Integer id,
            @Valid @RequestBody TreeGrowthRecordRequest request) {
        TreeGrowthRecord record = growthRecordService.updateGrowthRecord(id, request);
        return ResponseEntity.ok(ApiResponse.success("Growth record updated successfully", record));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<Void>> deleteGrowthRecord(@PathVariable Integer id) {
        growthRecordService.deleteGrowthRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Growth record deleted successfully", null));
    }

    // ==================== LIST & FILTER ====================

    @GetMapping
    public ResponseEntity<ApiResponse<List<TreeGrowthRecord>>> getAllGrowthRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("recordedDate").descending());
        Page<TreeGrowthRecord> recordPage = growthRecordService.getAllGrowthRecords(pageable);

        return ResponseEntity.ok(ApiResponse.success(
                "Growth records retrieved successfully",
                recordPage.getContent(),
                buildPageInfo(recordPage)));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<ApiResponse<List<TreeGrowthRecord>>> getGrowthRecordsByBatch(
            @PathVariable Integer batchId) {
        List<TreeGrowthRecord> records = growthRecordService.getGrowthRecordsByBatchId(batchId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/batch/{batchId}/latest")
    public ResponseEntity<ApiResponse<TreeGrowthRecord>> getLatestGrowthRecord(
            @PathVariable Integer batchId) {
        TreeGrowthRecord record = growthRecordService.getLatestGrowthRecord(batchId);
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    // ==================== CO2 CALCULATION ====================

    @PostMapping("/{id}/calculate-co2")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<TreeGrowthRecord>> calculateCO2(
            @PathVariable Integer id) {
        TreeGrowthRecord record = growthRecordService.calculateAndUpdateCO2(id);
        return ResponseEntity.ok(ApiResponse.success("CO2 calculated successfully", record));
    }

    @GetMapping("/batch/{batchId}/total-co2")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTotalCO2ByBatch(
            @PathVariable Integer batchId) {
        Map<String, Object> co2Summary = growthRecordService.getCO2SummaryByBatchId(batchId);
        return ResponseEntity.ok(ApiResponse.success(co2Summary));
    }

    @GetMapping("/farm/{farmId}/total-co2")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTotalCO2ByFarm(
            @PathVariable Integer farmId) {
        Map<String, Object> co2Summary = growthRecordService.getCO2SummaryByFarmId(farmId);
        return ResponseEntity.ok(ApiResponse.success(co2Summary));
    }

    // ==================== HEALTH STATUS ====================

    @GetMapping("/unhealthy")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<List<TreeGrowthRecord>>> getUnhealthyBatches() {
        List<TreeGrowthRecord> records = growthRecordService.getUnhealthyRecords();
        return ResponseEntity.ok(ApiResponse.success("Unhealthy batches retrieved", records));
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
