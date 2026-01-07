package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.CarbonReserveAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CarbonReserveAllocationRepository extends JpaRepository<CarbonReserveAllocation, Integer> {

	List<CarbonReserveAllocation> findByTargetPhaseId(Integer targetPhaseId);

	List<CarbonReserveAllocation> findByReserveId(Integer reserveId);

	@Query("SELECT COALESCE(SUM(a.allocatedAmount), 0) FROM CarbonReserveAllocation a " +
	       "WHERE a. targetPhase.id = :phaseId")
	BigDecimal sumAllocatedCarbonByPhaseId(@Param("phaseId") Integer phaseId);

	@Query("SELECT COALESCE(SUM(a.allocatedAmount), 0) FROM CarbonReserveAllocation a " +
	       "WHERE a.reserve.id = :reserveId")
	BigDecimal sumAllocatedByReserveId(@Param("reserveId") Integer reserveId);
}
