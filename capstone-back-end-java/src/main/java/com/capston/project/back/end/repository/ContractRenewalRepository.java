package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.RenewalStatus;
import com.capston.project.back.end.entity.ContractRenewal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRenewalRepository extends JpaRepository<ContractRenewal, Integer> {

	List<ContractRenewal> findByOriginalContractId(Integer contractId);

	@Query("SELECT cr FROM ContractRenewal cr " +
	       "LEFT JOIN FETCH cr.originalContract " +
	       "WHERE cr.originalContract.id = :contractId " +
	       "ORDER BY cr.renewalNumber DESC")
	List<ContractRenewal> findByContractIdWithDetails(@Param("contractId") Integer contractId);

	@Query("SELECT cr FROM ContractRenewal cr WHERE cr.renewalStatus = :status")
	Page<ContractRenewal> findByRenewalStatus(@Param("status") RenewalStatus status, Pageable pageable);

	@Query("SELECT MAX(cr.renewalNumber) FROM ContractRenewal cr WHERE cr.originalContract.id = :contractId")
	Optional<Integer> findMaxRenewalNumber(@Param("contractId") Integer contractId);

	@Query("SELECT cr FROM ContractRenewal cr " +
	       "LEFT JOIN FETCH cr.originalContract oc " +
	       "LEFT JOIN FETCH oc.project " +
	       "WHERE cr.id = :id")
	Optional<ContractRenewal> findByIdWithDetails(@Param("id") Integer id);

	@Query("SELECT COUNT(cr) FROM ContractRenewal cr WHERE cr.originalContractId = :contractId AND cr.renewalStatus = :status")
	Long countByOriginalContractIdAndRenewalStatus(@Param("contractId") Integer contractId, @Param("status") RenewalStatus status);

	// Count by status (for Admin statistics)
	long countByRenewalStatus(RenewalStatus status);
}
