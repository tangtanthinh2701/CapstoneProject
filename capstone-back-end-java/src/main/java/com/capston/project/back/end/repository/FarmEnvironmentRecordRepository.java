package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.FarmEnvironmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FarmEnvironmentRecordRepository extends JpaRepository<FarmEnvironmentRecord, Integer> {

    List<FarmEnvironmentRecord> findByFarmIdOrderByRecordedDateDesc(Integer farmId);

    @Query("SELECT fer FROM FarmEnvironmentRecord fer WHERE fer.farmId = :farmId ORDER BY fer.recordedDate DESC LIMIT 1")
    Optional<FarmEnvironmentRecord> findLatestByFarmId(@Param("farmId") Integer farmId);

    @Query("SELECT fer FROM FarmEnvironmentRecord fer WHERE fer.farmId = :farmId AND fer.recordedDate = :date")
    Optional<FarmEnvironmentRecord> findByFarmIdAndDate(@Param("farmId") Integer farmId, @Param("date") LocalDate date);

    // Alias for findByFarmIdAndDate
    Optional<FarmEnvironmentRecord> findByFarmIdAndRecordedDate(Integer farmId, LocalDate recordedDate);

    @Query("SELECT AVG(fer.overallFactor) FROM FarmEnvironmentRecord fer WHERE fer.farmId = :farmId")
    BigDecimal getAverageFactorByFarmId(@Param("farmId") Integer farmId);

    @Query("SELECT COALESCE(fer.overallFactor, 1.0) FROM FarmEnvironmentRecord fer WHERE fer.farmId = :farmId ORDER BY fer.recordedDate DESC LIMIT 1")
    BigDecimal getLatestFactorByFarmId(@Param("farmId") Integer farmId);
}

