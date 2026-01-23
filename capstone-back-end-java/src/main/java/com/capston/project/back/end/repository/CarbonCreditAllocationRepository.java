package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.AllocationStatus;
import com.capston.project.back.end.entity.CreditAllocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CarbonCreditAllocationRepository extends JpaRepository<CreditAllocation, Integer> {

	List<CreditAllocation> findByCreditId(Integer creditId);

	List<CreditAllocation> findByContractId(Integer contractId);

	List<CreditAllocation> findByOwnerId(UUID ownerId);

	// Find by ownerId with pagination (for UserService)
	Page<CreditAllocation> findByOwnerId(UUID ownerId, Pageable pageable);

	// Count by ownerId (for UserService)
	long countByOwnerId(UUID ownerId);

	List<CreditAllocation> findByAllocationStatus(AllocationStatus status);

	@Query(value = "SELECT COALESCE(SUM(allocated_credits), 0) FROM credit_allocations WHERE credit_id = :creditId", nativeQuery = true)
	Integer sumAllocatedCreditsByCreditId(@Param("creditId") Integer creditId);

	@Query(value = "SELECT COALESCE(SUM(allocated_credits), 0) FROM credit_allocations " +
	       "WHERE owner_id = :ownerId AND allocation_status = 'ALLOCATED'", nativeQuery = true)
	Integer sumAllocatedCreditsByOwnerId(@Param("ownerId") UUID ownerId);

	boolean existsByCreditIdAndContractId(Integer creditId, Integer contractId);
}
