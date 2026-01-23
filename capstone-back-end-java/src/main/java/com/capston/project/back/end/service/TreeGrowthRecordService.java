package com.capston.project.back.end.service;

import com.capston.project.back.end.entity.TreeGrowthRecord;
import com.capston.project.back.end.request.TreeGrowthRecordRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Service interface cho quản lý ghi nhận sinh trưởng cây
 */
public interface TreeGrowthRecordService {

    // ==================== CRUD ====================

    TreeGrowthRecord createGrowthRecord(TreeGrowthRecordRequest request);

    TreeGrowthRecord getGrowthRecordById(Integer id);

    TreeGrowthRecord updateGrowthRecord(Integer id, TreeGrowthRecordRequest request);

    void deleteGrowthRecord(Integer id);

    // ==================== LIST & FILTER ====================

    Page<TreeGrowthRecord> getAllGrowthRecords(Pageable pageable);

    List<TreeGrowthRecord> getGrowthRecordsByBatchId(Integer batchId);

    TreeGrowthRecord getLatestGrowthRecord(Integer batchId);

    // ==================== CO2 CALCULATION ====================

    /**
     * Tính toán và cập nhật CO2 absorbed cho một growth record
     * Công thức: CO2 = quantity × base_rate × environment_factor × time_factor
     */
    TreeGrowthRecord calculateAndUpdateCO2(Integer recordId);

    /**
     * Lấy tổng CO2 absorbed của một batch
     */
    Map<String, Object> getCO2SummaryByBatchId(Integer batchId);

    /**
     * Lấy tổng CO2 absorbed của một farm
     */
    Map<String, Object> getCO2SummaryByFarmId(Integer farmId);

    // ==================== HEALTH STATUS ====================

    /**
     * Lấy danh sách các record có health_status là DISEASED hoặc STRESSED
     */
    List<TreeGrowthRecord> getUnhealthyRecords();
}

