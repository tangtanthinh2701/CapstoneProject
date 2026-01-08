package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.AllocationStatus;
import com.capston.project.back.end.entity.CarbonCreditAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CarbonCreditAllocationRepository extends JpaRepository<CarbonCreditAllocation, Integer> {

	List<CarbonCreditAllocation> findByCarbonCreditId(Integer creditId);

	@Query("SELECT a FROM CarbonCreditAllocation a " +
	       "LEFT JOIN FETCH a. ownership o " +
	       "LEFT JOIN FETCH o.project " +
	       "WHERE a.carbonCredit.id = :creditId")
	List<CarbonCreditAllocation> findByCreditIdWithDetails(@Param("creditId") Integer creditId);

	List<CarbonCreditAllocation> findByOwnershipId(Integer ownershipId);

	List<CarbonCreditAllocation> findByOwnerId(UUID ownerId);

	@Query("SELECT a FROM CarbonCreditAllocation a " +
	       "LEFT JOIN FETCH a. carbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE a. ownerId = :ownerId " +
	       "ORDER BY a.createdAt DESC")
	List<CarbonCreditAllocation> findByOwnerIdWithDetails(@Param("ownerId") UUID ownerId);

	List<CarbonCreditAllocation> findByStatus(AllocationStatus status);

	@Query("SELECT COALESCE(SUM(a.allocatedCredits), 0) FROM CarbonCreditAllocation a " + "WHERE a.carbonCredit.id = :creditId")
	Integer sumAllocatedCreditsByCreditId(@Param("creditId") Integer creditId);

	@Query("SELECT COALESCE(SUM(a.allocatedCredits), 0) FROM CarbonCreditAllocation a " +
	       "WHERE a. ownerId = :ownerId AND a.status = 'ALLOCATED'")
	Integer sumAllocatedCreditsByOwnerId(@Param("ownerId") UUID ownerId);

	boolean existsByCarbonCreditIdAndOwnershipId(Integer creditId, Integer ownershipId);

	Optional<CarbonCreditAllocation> findByCarbonCreditIdAndOwnershipId(Integer creditId, Integer ownershipId);
}
