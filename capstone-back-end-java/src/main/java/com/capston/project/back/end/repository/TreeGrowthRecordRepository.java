package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.HealthStatus;
import com.capston.project.back.end.entity.TreeGrowthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreeGrowthRecordRepository extends JpaRepository<TreeGrowthRecord, Integer> {

       List<TreeGrowthRecord> findByBatchIdOrderByRecordedDateDesc(Integer batchId);

       @Query("SELECT tgr FROM TreeGrowthRecord tgr WHERE tgr.batchId = :batchId ORDER BY tgr.recordedDate DESC LIMIT 1")
       Optional<TreeGrowthRecord> findLatestByBatchId(@Param("batchId") Integer batchId);

       @Query("SELECT tgr FROM TreeGrowthRecord tgr WHERE tgr.batchId = :batchId AND tgr.recordedDate = :date")
       Optional<TreeGrowthRecord> findByBatchIdAndDate(@Param("batchId") Integer batchId,
                     @Param("date") LocalDate date);

       // CO2 Summaries
       @Query(value = "SELECT COALESCE(SUM(co2_absorbed_kg), 0) FROM tree_growth_records WHERE batch_id = :batchId", nativeQuery = true)
       BigDecimal sumCO2AbsorbedByBatchId(@Param("batchId") Integer batchId);

       @Query(value = "SELECT COALESCE(SUM(co2_absorbed_kg), 0) FROM tree_growth_records WHERE batch_id = :batchId", nativeQuery = true)
       BigDecimal sumCo2AbsorbedByBatchId(@Param("batchId") Integer batchId);

       @Query(value = "SELECT COALESCE(SUM(tgr.co2_absorbed_kg), 0) FROM tree_growth_records tgr " +
                     "JOIN tree_batches tb ON tgr.batch_id = tb.id " +
                     "WHERE tb.farm_id = :farmId", nativeQuery = true)
       BigDecimal sumCO2AbsorbedByFarmId(@Param("farmId") Integer farmId);

       @Query("SELECT SUM(tgr.quantityAlive) FROM TreeGrowthRecord tgr " +
                     "JOIN TreeBatch tb ON tgr.batchId = tb.id " +
                     "WHERE tb.farmId = :farmId AND tgr.recordedDate = (" +
                     "  SELECT MAX(tgr2.recordedDate) FROM TreeGrowthRecord tgr2 WHERE tgr2.batchId = tgr.batchId)")
       Integer sumCurrentAliveTreesByFarmId(@Param("farmId") Integer farmId);

       // Aggregate latest CO2 from all batches in a phase
       @Query("SELECT COALESCE(SUM(tgr.co2AbsorbedKg), 0) FROM TreeGrowthRecord tgr " +
                     "JOIN TreeBatch tb ON tgr.batchId = tb.id " +
                     "WHERE tb.phaseId = :phaseId AND tgr.recordedDate = (" +
                     "  SELECT MAX(tgr2.recordedDate) FROM TreeGrowthRecord tgr2 WHERE tgr2.batchId = tgr.batchId)")
       BigDecimal sumLatestCO2ByPhaseId(@Param("phaseId") Integer phaseId);

       // Unhealthy records (DISEASED or STRESSED)
       @Query(value = "SELECT * FROM tree_growth_records WHERE health_status IN ('DISEASED', 'STRESSED') " +
                     "ORDER BY recorded_date DESC", nativeQuery = true)
       List<TreeGrowthRecord> findUnhealthyRecords();

       // Find records by health status
       List<TreeGrowthRecord> findByHealthStatus(HealthStatus healthStatus);
}
