package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.PurchaseStatus;
import com.capston.project.back.end.entity.PhaseTreePurchase;
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
public interface PhaseTreePurchaseRepository extends JpaRepository<PhaseTreePurchase, Integer> {

	List<PhaseTreePurchase> findByPhaseId(Integer phaseId);

	@Query("SELECT p FROM PhaseTreePurchase p " +
	       "JOIN FETCH p.farm " +
	       "JOIN FETCH p.treeSpecies " +
	       "WHERE p.phase.id = :phaseId " +
	       "ORDER BY p.purchaseDate DESC")
	List<PhaseTreePurchase> findByPhaseIdWithDetails(@Param("phaseId") Integer phaseId);

	@Query("SELECT p FROM PhaseTreePurchase p " +
	       "JOIN FETCH p.phase ph " +
	       "JOIN FETCH p.farm " +
	       "JOIN FETCH p.treeSpecies " +
	       "WHERE p.id = :id")
	Optional<PhaseTreePurchase> findByIdWithDetails(@Param("id") Integer id);

	// Tổng carbon đã mua cho phase
	@Query("SELECT COALESCE(SUM(p.totalEstimatedCarbon), 0) FROM PhaseTreePurchase p " +
	       "WHERE p. phase.id = :phaseId AND p.purchaseStatus IN ('APPROVED', 'DELIVERED')")
	BigDecimal sumPurchasedCarbonByPhaseId(@Param("phaseId") Integer phaseId);

	// Tổng chi phí mua cây cho phase
	@Query("SELECT COALESCE(SUM(p.totalPrice), 0) FROM PhaseTreePurchase p " +
	       "WHERE p.phase.id = :phaseId AND p.purchaseStatus IN ('APPROVED', 'DELIVERED')")
	BigDecimal sumCostByPhaseId(@Param("phaseId") Integer phaseId);

	// Tổng carbon thực tế đã hấp thụ
	@Query("SELECT COALESCE(SUM(p.actualCarbonAbsorbed), 0) FROM PhaseTreePurchase p " +
	       "WHERE p.phase.id = :phaseId AND p.purchaseStatus = 'DELIVERED'")
	BigDecimal sumActualCarbonByPhaseId(@Param("phaseId") Integer phaseId);

	// Tìm theo status
	Page<PhaseTreePurchase> findByPurchaseStatus(PurchaseStatus status, Pageable pageable);

	// Tìm theo project
	@Query("SELECT p FROM PhaseTreePurchase p " +
	       "JOIN p.phase ph " +
	       "WHERE ph.project.id = :projectId " +
	       "ORDER BY p. purchaseDate DESC")
	List<PhaseTreePurchase> findByProjectId(@Param("projectId") Integer projectId);

	// Kiểm tra đã mua từ farm + species chưa
	@Query("SELECT COUNT(p) > 0 FROM PhaseTreePurchase p " +
	       "WHERE p.phase.id = :phaseId " +
	       "AND p.farm.id = :farmId " +
	       "AND p.treeSpecies.id = :speciesId " +
	       "AND p.purchaseStatus != 'CANCELLED'")
	boolean existsByPhaseAndFarmAndSpecies(@Param("phaseId") Integer phaseId,
	                                       @Param("farmId") Integer farmId,
	                                       @Param("speciesId") Integer speciesId);
}
