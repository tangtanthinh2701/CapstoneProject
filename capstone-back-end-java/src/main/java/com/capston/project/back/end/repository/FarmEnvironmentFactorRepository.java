package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.FarmEnvironmentFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FarmEnvironmentFactorRepository extends JpaRepository<FarmEnvironmentFactor, Integer> {

	List<FarmEnvironmentFactor> findByFarmIdOrderByFromDateDesc(Integer farmId);

	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "WHERE f. farm.id = :farmId " +
	       "AND f.fromDate <= :date AND f.toDate >= :date")
	Optional<FarmEnvironmentFactor> findByFarmIdAndDate(@Param("farmId") Integer farmId,
	                                                    @Param("date") LocalDate date);

	@Query("SELECT COALESCE(AVG(f.overallFactor), 1.0) FROM FarmEnvironmentFactor f " +
	       "WHERE f.farm.id = : farmId")
	BigDecimal getAverageFactorByFarmId(@Param("farmId") Integer farmId);

	// Lấy factor mới nhất
	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "WHERE f.farm.id = :farmId " +
	       "ORDER BY f.toDate DESC LIMIT 1")
	Optional<FarmEnvironmentFactor> findLatestByFarmId(@Param("farmId") Integer farmId);
}
