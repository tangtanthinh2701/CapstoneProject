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

	List<ProjectPhase> findByProjectIdOrderByPhaseOrderAsc(Integer projectId);

	Optional<ProjectPhase> findByProjectIdAndPhaseOrder(Integer projectId, Integer phaseOrder);

	boolean existsByProjectIdAndPhaseOrder(Integer projectId, Integer phaseOrder);

	// Đếm số phase theo status của project
	long countByProjectIdAndPhaseStatus(Integer projectId, PhaseStatus status);

	// Lấy max phase order của project
	@Query("SELECT COALESCE(MAX(pp.phaseOrder), 0) FROM ProjectPhase pp WHERE pp. project.id = :projectId")
	Integer findMaxPhaseOrderByProjectId(@Param("projectId") Integer projectId);

	// Tổng hợp từ phases để update project
	@Query("SELECT COALESCE(SUM(pp.budget), 0) FROM ProjectPhase pp WHERE pp.project. id = :projectId")
	BigDecimal sumBudgetByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(pp.targetConsumedCarbon), 0) FROM ProjectPhase pp WHERE pp.project. id = :projectId")
	BigDecimal sumTargetCarbonByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(pp. currentConsumedCarbon), 0) FROM ProjectPhase pp WHERE pp.project.id = :projectId")
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
	       "pp.currentConsumedCarbon = :currentCarbon, " +
	       "pp.updatedAt = CURRENT_TIMESTAMP " +
	       "WHERE pp.id = :phaseId")
	void updateComputedFields(@Param("phaseId") Integer phaseId,
	                          @Param("actualCost") BigDecimal actualCost,
	                          @Param("currentCarbon") BigDecimal currentCarbon);
}
