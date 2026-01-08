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
	       "ORDER BY cr. renewalNumber DESC")
	List<ContractRenewal> findByContractIdWithDetails(@Param("contractId") Integer contractId);

	Page<ContractRenewal> findByStatus(RenewalStatus status, Pageable pageable);

	@Query("SELECT MAX(cr.renewalNumber) FROM ContractRenewal cr WHERE cr.originalContract.id = : contractId")
	Optional<Integer> findMaxRenewalNumber(@Param("contractId") Integer contractId);

	@Query("SELECT cr FROM ContractRenewal cr " +
	       "LEFT JOIN FETCH cr.originalContract oc " +
	       "LEFT JOIN FETCH oc.project " +
	       "WHERE cr.id = :id")
	Optional<ContractRenewal> findByIdWithDetails(@Param("id") Integer id);

	Long countByOriginalContractIdAndStatus(Integer contractId, RenewalStatus status);
}
