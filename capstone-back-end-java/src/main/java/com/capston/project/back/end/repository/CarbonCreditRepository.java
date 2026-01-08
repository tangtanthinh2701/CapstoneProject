package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.entity.CarbonCredit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarbonCreditRepository extends JpaRepository<CarbonCredit, Integer> {

	boolean existsByCreditCode(String creditCode);

	Optional<CarbonCredit> findByCreditCode(String creditCode);

	@Query("SELECT c FROM CarbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE c.id = :id")
	Optional<CarbonCredit> findByIdWithProject(@Param("id") Integer id);

	@Query("SELECT c FROM CarbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "LEFT JOIN FETCH c.allocations a " +
	       "LEFT JOIN FETCH a.ownership " +
	       "WHERE c.id = :id")
	Optional<CarbonCredit> findByIdWithDetails(@Param("id") Integer id);

	// Find by project
	List<CarbonCredit> findByProjectId(Integer projectId);

	@Query("SELECT c FROM CarbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE c.project.id = :projectId " +
	       "ORDER BY c.reportYear DESC")
	List<CarbonCredit> findByProjectIdWithProject(@Param("projectId") Integer projectId);

	// Find by status
	Page<CarbonCredit> findByCreditsStatus(CreditStatus status, Pageable pageable);

	List<CarbonCredit> findByCreditsStatus(CreditStatus status);

	// Find available credits
	@Query("SELECT c FROM CarbonCredit c WHERE c.creditsStatus IN ('AVAILABLE', 'PARTIALLY_SOLD') " +
	       "AND c.creditsAvailable > 0 " +
	       "AND (c.expiresAt IS NULL OR c.expiresAt > CURRENT_TIMESTAMP)")
	List<CarbonCredit> findAvailableCredits();

	@Query("SELECT c FROM CarbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE c.creditsStatus IN ('AVAILABLE', 'PARTIALLY_SOLD') " +
	       "AND c.creditsAvailable > 0 " +
	       "AND (c.expiresAt IS NULL OR c.expiresAt > CURRENT_TIMESTAMP)")
	List<CarbonCredit> findAvailableCreditsWithProject();

	// Find by year
	List<CarbonCredit> findByReportYear(Integer year);

	Page<CarbonCredit> findByReportYear(Integer year, Pageable pageable);

	// Find expired
	@Query("SELECT c FROM CarbonCredit c WHERE c.creditsStatus NOT IN ('EXPIRED', 'CANCELLED') " +
	       "AND c.expiresAt IS NOT NULL AND c.expiresAt < : now")
	List<CarbonCredit> findExpired(@Param("now") OffsetDateTime now);

	// Statistics
	Long countByCreditsStatus(CreditStatus status);

	@Query("SELECT COALESCE(SUM(c. creditsIssued), 0) FROM CarbonCredit c")
	Long sumTotalCreditsIssued();

	@Query("SELECT COALESCE(SUM(c.creditsSold), 0) FROM CarbonCredit c")
	Long sumTotalCreditsSold();

	@Query("SELECT COALESCE(SUM(c.creditsRetired), 0) FROM CarbonCredit c")
	Long sumTotalCreditsRetired();

	@Query("SELECT COALESCE(SUM(c.creditsAvailable), 0) FROM CarbonCredit c " +
	       "WHERE c.creditsStatus IN ('AVAILABLE', 'PARTIALLY_SOLD')")
	Long sumTotalCreditsAvailable();

	@Query("SELECT COALESCE(SUM(c.totalCo2Tons), 0) FROM CarbonCredit c")
	BigDecimal sumTotalCo2Tons();

	@Query("SELECT COALESCE(SUM(c.totalCo2Tons), 0) FROM CarbonCredit c WHERE c.project.id = :projectId")
	BigDecimal sumCo2TonsByProjectId(@Param("projectId") Integer projectId);

	// Pagination
	@Query("SELECT c. id FROM CarbonCredit c")
	Page<Integer> findAllCreditIds(Pageable pageable);

	@Query("SELECT DISTINCT c FROM CarbonCredit c LEFT JOIN FETCH c.project WHERE c.id IN :ids")
	List<CarbonCredit> findAllWithProjectByIds(@Param("ids") List<Integer> ids);

	// Update status
	@Modifying
	@Query("UPDATE CarbonCredit c SET c.creditsStatus = :status, c.updatedAt = CURRENT_TIMESTAMP WHERE c.id = :id")
	void updateStatus(@Param("id") Integer id, @Param("status") CreditStatus status);

	// Search
	@Query("SELECT c FROM CarbonCredit c " +
	       "LEFT JOIN c.project p " +
	       "WHERE LOWER(c.creditCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
	       "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<CarbonCredit> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	@Query("SELECT c FROM CarbonCredit c ORDER BY c.createdAt DESC LIMIT :limit")
	List<CarbonCredit> findRecentCredits(@Param("limit") int limit);

	@Query("SELECT COALESCE(SUM(c.creditsIssued), 0) FROM CarbonCredit c WHERE c.project.id = :projectId")
	Long sumCreditsIssuedByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(c.creditsSold), 0) FROM CarbonCredit c WHERE c. project.id = :projectId")
	Long sumCreditsSoldByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT DISTINCT c.reportYear FROM CarbonCredit c ORDER BY c.reportYear DESC")
	List<Integer> findDistinctYears();

	@Query("SELECT COALESCE(SUM(c.creditsIssued), 0) FROM CarbonCredit c WHERE c.creditsStatus = : status")
	Long sumCreditsByStatus(@Param("status") CreditStatus status);

	@Query("SELECT COALESCE(SUM(c.creditsIssued), 0) FROM CarbonCredit c " +
	       "WHERE EXTRACT(YEAR FROM c.issuedAt) = :year AND EXTRACT(MONTH FROM c.issuedAt) = :month")
	Long sumCreditsIssuedByMonth(@Param("year") Integer year, @Param("month") Integer month);

	@Query("SELECT COALESCE(SUM(c.creditsSold), 0) FROM CarbonCredit c " +
	       "WHERE EXTRACT(YEAR FROM c.updatedAt) = :year AND EXTRACT(MONTH FROM c.updatedAt) = :month")
	Long sumCreditsSoldByMonth(@Param("year") Integer year, @Param("month") Integer month);

	@Query("SELECT COALESCE(SUM(c.creditsRetired), 0) FROM CarbonCredit c " +
	       "WHERE EXTRACT(YEAR FROM c.updatedAt) = :year AND EXTRACT(MONTH FROM c.updatedAt) = :month")
	Long sumCreditsRetiredByMonth(@Param("year") Integer year, @Param("month") Integer month);
}