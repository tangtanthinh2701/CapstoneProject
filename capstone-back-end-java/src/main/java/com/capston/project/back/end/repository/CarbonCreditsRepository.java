package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.CarbonCredits;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarbonCreditsRepository extends JpaRepository<CarbonCredits, Integer> {
	Boolean existsByCreditCode(String creditCode);

	Optional<CarbonCredits> findByProjectIdAndReportYear(Integer projectId, Integer reportYear);

	@Query("SELECT c FROM CarbonCredits c WHERE c.creditsStatus = 'AVAILABLE' " + "AND c.creditsAvailable > 0")
	Page<CarbonCredits> findAvailableCredits(Pageable pageable);

	@Query("SELECT c FROM CarbonCredits c WHERE c.project.id = :projectId")
	Page<CarbonCredits> findByProjectId(@Param("projectId") Integer projectId, Pageable pageable);
}
