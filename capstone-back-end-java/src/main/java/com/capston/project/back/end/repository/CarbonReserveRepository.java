package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.CarbonReserve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface CarbonReserveRepository extends JpaRepository<CarbonReserve, Integer> {
	List<CarbonReserve> findByProjectId(Integer projectId);

	@Query("SELECT cr FROM CarbonReserve cr " +
	       "WHERE cr.project. id = :projectId " +
	       "AND cr.status = 'AVAILABLE' " +
	       "AND cr.remainingAmount > 0 " +
	       "AND (cr.expiresAt IS NULL OR cr.expiresAt > CURRENT_TIMESTAMP)")
	List<CarbonReserve> findAvailableByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(cr.remainingAmount), 0) FROM CarbonReserve cr " +
	       "WHERE cr. project.id = :projectId " +
	       "AND cr.status = 'AVAILABLE' " +
	       "AND (cr.expiresAt IS NULL OR cr.expiresAt > CURRENT_TIMESTAMP)")
	BigDecimal sumAvailableCarbonByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT cr FROM CarbonReserve cr " +
	       "WHERE cr. sourcePhase.id = :phaseId")
	List<CarbonReserve> findBySourcePhaseId(@Param("phaseId") Integer phaseId);

	// Cập nhật status khi hết hạn
	@Modifying
	@Query("UPDATE CarbonReserve cr SET cr.status = 'EXPIRED', cr.updatedAt = CURRENT_TIMESTAMP " +
	       "WHERE cr.expiresAt IS NOT NULL AND cr.expiresAt < : now AND cr.status = 'AVAILABLE'")
	int expireReserves(@Param("now") OffsetDateTime now);

	// Cập nhật remaining amount
	@Modifying
	@Query("UPDATE CarbonReserve cr SET " +
	       "cr.remainingAmount = : remaining, " +
	       "cr. status = CASE WHEN : remaining <= 0 THEN 'ALLOCATED' ELSE cr.status END, " +
	       "cr.updatedAt = CURRENT_TIMESTAMP " +
	       "WHERE cr.id = :id")
	void updateRemainingAmount(@Param("id") Integer id, @Param("remaining") BigDecimal remaining);
}
