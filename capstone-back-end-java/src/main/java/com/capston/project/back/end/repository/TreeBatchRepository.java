package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.BatchStatus;
import com.capston.project.back.end.entity.TreeBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreeBatchRepository extends JpaRepository<TreeBatch, Integer> {

    Optional<TreeBatch> findByBatchCode(String batchCode);

    boolean existsByBatchCode(String batchCode);

    List<TreeBatch> findByFarmId(Integer farmId);

    List<TreeBatch> findByFarmIdOrderByPlantingDateDesc(Integer farmId);

    List<TreeBatch> findByPhaseId(Integer phaseId);

    List<TreeBatch> findByPhaseIdOrderByPlantingDateDesc(Integer phaseId);

    List<TreeBatch> findByTreeSpeciesId(Integer treeSpeciesId);

    @Query(value = "SELECT * FROM tree_batches WHERE farm_id = :farmId AND batch_status = 'ACTIVE'", nativeQuery = true)
    List<TreeBatch> findActiveByFarmId(@Param("farmId") Integer farmId);

    @Query("SELECT tb FROM TreeBatch tb LEFT JOIN FETCH tb.treeSpecies WHERE tb.id = :id")
    Optional<TreeBatch> findByIdWithSpecies(@Param("id") Integer id);

    Page<TreeBatch> findByBatchStatus(BatchStatus status, Pageable pageable);

    // Statistics
    @Query(value = "SELECT COALESCE(SUM(quantity_planted), 0) FROM tree_batches WHERE farm_id = :farmId AND batch_status = 'ACTIVE'", nativeQuery = true)
    Integer sumQuantityPlantedByFarmId(@Param("farmId") Integer farmId);

    @Query(value = "SELECT COALESCE(SUM(planting_area_m2), 0) FROM tree_batches WHERE farm_id = :farmId AND batch_status = 'ACTIVE'", nativeQuery = true)
    BigDecimal sumPlantingAreaByFarmId(@Param("farmId") Integer farmId);

    long countByFarmId(Integer farmId);

    @Query(value = "SELECT COALESCE(SUM(quantity_planted), 0) FROM tree_batches WHERE farm_id = :farmId AND batch_status = 'ACTIVE'", nativeQuery = true)
    Integer sumQuantityByFarmId(@Param("farmId") Integer farmId);
}
