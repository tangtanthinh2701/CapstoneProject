package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.PhaseStatus;
import com.capston.project.back.end.entity.ProjectPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPhaseRepository extends JpaRepository<ProjectPhase, Integer> {

	List<ProjectPhase> findByProjectIdOrderByPhaseNumberAsc(Integer projectId);

	Optional<ProjectPhase> findByProjectIdAndPhaseNumber(Integer projectId, Integer phaseNumber);

	boolean existsByProjectIdAndPhaseNumber(Integer projectId, Integer phaseNumber);

	// Đếm số phase theo status của project
	long countByProjectIdAndPhaseStatus(Integer projectId, PhaseStatus status);

	// Lấy max phase number của project
	@Query("SELECT COALESCE(MAX(pp.phaseNumber), 0) FROM ProjectPhase pp WHERE pp. project.id = :projectId")
	Integer findMaxPhaseNumberByProjectId(@Param("projectId") Integer projectId);

	// Tổng hợp từ phases để update project
	@Query("SELECT COALESCE(SUM(pp.budget), 0) FROM ProjectPhase pp WHERE pp.project. id = :projectId")
	BigDecimal sumBudgetByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(pp.targetCo2Kg), 0) FROM ProjectPhase pp WHERE pp.project. id = :projectId")
	BigDecimal sumTargetCarbonByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(pp. actualCo2Kg), 0) FROM ProjectPhase pp WHERE pp.project.id = :projectId")
	BigDecimal sumCurrentCarbonByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(pp.actualCost), 0) FROM ProjectPhase pp WHERE pp.project. id = :projectId")
	BigDecimal sumActualCostByProjectId(@Param("projectId") Integer projectId);

	// Xóa tất cả phases của project
	@Modifying
	void deleteByProjectId(Integer projectId);

	// Update actual cost và current carbon cho phase (từ farm data)
	@Modifying
	@Query("UPDATE ProjectPhase pp SET " +
			"pp.actualCost = :actualCost, " +
			"pp.actualCo2Kg = :currentCarbon, " +
			"pp.updatedAt = CURRENT_TIMESTAMP " +
			"WHERE pp.id = :phaseId")
	void updateComputedFields(@Param("phaseId") Integer phaseId,
			@Param("actualCost") BigDecimal actualCost,
			@Param("currentCarbon") BigDecimal currentCarbon);
}
