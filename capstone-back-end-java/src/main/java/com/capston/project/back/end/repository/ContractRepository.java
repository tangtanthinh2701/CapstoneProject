package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.entity.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {

	boolean existsByContractCode(String contractCode);

	Optional<Contract> findByContractCode(String contractCode);

	@Query("SELECT c FROM Contract c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE c.id = :id")
	Optional<Contract> findByIdWithProject(@Param("id") Integer id);

	@Query("SELECT c FROM Contract c " +
	       "LEFT JOIN FETCH c.project " +
	       "LEFT JOIN FETCH c.renewals " +
	       "WHERE c.id = :id")
	Optional<Contract> findByIdWithDetails(@Param("id") Integer id);

	// Find by status
	Page<Contract> findByContractStatus(ContractStatus status, Pageable pageable);

	// Find by project
	List<Contract> findByProjectId(Integer projectId);

	@Query("SELECT c FROM Contract c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE c.project.id = :projectId")
	List<Contract> findByProjectIdWithProject(@Param("projectId") Integer projectId);

	// Find expiring soon contracts
	@Query("SELECT c FROM Contract c WHERE c.contractStatus = 'ACTIVE' " +
	       "AND c.endDate IS NOT NULL " +
	       "AND c.endDate BETWEEN :today AND :warningDate")
	List<Contract> findExpiringSoonContracts(@Param("today") LocalDate today,
	                                         @Param("warningDate") LocalDate warningDate);

	// Find expired contracts
	@Query("SELECT c FROM Contract c WHERE c.contractStatus = 'ACTIVE' " +
	       "AND c.endDate IS NOT NULL " +
	       "AND c.endDate < :today")
	List<Contract> findExpiredContracts(@Param("today") LocalDate today);

	// Search
	@Query("SELECT c FROM Contract c " +
	       "LEFT JOIN c.project p " +
	       "WHERE LOWER(c.contractCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
	       "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<Contract> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	// Statistics
	@Query("SELECT COUNT(c) FROM Contract c WHERE c.contractStatus = : status")
	Long countByStatus(@Param("status") ContractStatus status);

	@Query("SELECT COALESCE(SUM(c. totalAmount), 0) FROM Contract c WHERE c.contractStatus = :status")
	BigDecimal sumTotalAmountByStatus(@Param("status") ContractStatus status);

	@Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Contract c")
	BigDecimal sumTotalAmount();

	// Update status
	@Modifying
	@Query("UPDATE Contract c SET c.contractStatus = :status, c.updatedAt = CURRENT_TIMESTAMP WHERE c.id = :id")
	void updateStatus(@Param("id") Integer id, @Param("status") ContractStatus status);

	// For pagination with project
	@Query("SELECT c. id FROM Contract c")
	Page<Integer> findAllContractIds(Pageable pageable);

	@Query("SELECT DISTINCT c FROM Contract c LEFT JOIN FETCH c.project WHERE c.id IN :ids")
	List<Contract> findAllWithProjectByIds(@Param("ids") List<Integer> ids);

	// Auto renewal candidates
	@Query("SELECT c FROM Contract c WHERE c.contractStatus = 'ACTIVE' " +
	       "AND c.autoRenewal = true " +
	       "AND c.endDate IS NOT NULL " +
	       "AND c.endDate BETWEEN :today AND :warningDate " +
	       "AND (c.maxRenewals IS NULL OR c.renewalCount < c.maxRenewals)")
	List<Contract> findAutoRenewalCandidates(@Param("today") LocalDate today,
	                                         @Param("warningDate") LocalDate warningDate);

	@Query("SELECT c FROM Contract c ORDER BY c.createdAt DESC LIMIT :limit")
	List<Contract> findRecentContracts(@Param("limit") int limit);

	@Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Contract c WHERE c.project.id = :projectId")
	BigDecimal sumAmountByProjectId(@Param("projectId") Integer projectId);
}
