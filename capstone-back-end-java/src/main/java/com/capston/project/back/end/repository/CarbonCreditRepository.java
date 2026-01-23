package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.entity.CarbonCredit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CarbonCreditRepository extends JpaRepository<CarbonCredit, Integer> {

	boolean existsByCreditCode(String creditCode);

	Optional<CarbonCredit> findByCreditCode(String creditCode);

	// Find by project
	Page<CarbonCredit> findByProjectId(Integer projectId, Pageable pageable);

	List<CarbonCredit> findByProjectIdOrderByIssuanceYearDesc(Integer projectId);

	// Find by status
	Page<CarbonCredit> findByCreditStatus(CreditStatus status, Pageable pageable);

	// Find available credits
	@Query("SELECT c FROM CarbonCredit c WHERE c.creditStatus IN ('AVAILABLE', 'PARTIALLY_SOLD') " +
			"AND c.creditsAvailable > 0 " +
			"AND (c.expiresAt IS NULL OR c.expiresAt > CURRENT_TIMESTAMP)")
	Page<CarbonCredit> findAvailableCredits(Pageable pageable);

	// Statistics - All
	@Query("SELECT COALESCE(SUM(c.creditsIssued), 0) FROM CarbonCredit c")
	Long sumCreditsIssued();

	@Query("SELECT COALESCE(SUM(c.creditsSold), 0) FROM CarbonCredit c")
	Long sumCreditsSold();

	@Query("SELECT COALESCE(SUM(c.creditsRetired), 0) FROM CarbonCredit c")
	Long sumCreditsRetired();

	@Query("SELECT COALESCE(SUM(c.creditsAvailable), 0) FROM CarbonCredit c " +
			"WHERE c.creditStatus IN ('AVAILABLE', 'PARTIALLY_SOLD')")
	Long sumCreditsAvailable();

	// Statistics - By Project
	@Query("SELECT COALESCE(SUM(c.creditsIssued), 0) FROM CarbonCredit c WHERE c.projectId = :projectId")
	Long sumCreditsIssuedByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(c.creditsSold), 0) FROM CarbonCredit c WHERE c.projectId = :projectId")
	Long sumCreditsSoldByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(c.creditsRetired), 0) FROM CarbonCredit c WHERE c.projectId = :projectId")
	Long sumCreditsRetiredByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(c.creditsAvailable), 0) FROM CarbonCredit c " +
			"WHERE c.projectId = :projectId AND c.creditStatus IN ('AVAILABLE', 'PARTIALLY_SOLD')")
	Long sumCreditsAvailableByProjectId(@Param("projectId") Integer projectId);
}