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
	       "WHERE f.farm.id = :farmId")
	BigDecimal getAverageFactorByFarmId(@Param("farmId") Integer farmId);

	// Lấy factor mới nhất
	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "WHERE f.farm.id = :farmId " +
	       "ORDER BY f.toDate DESC LIMIT 1")
	Optional<FarmEnvironmentFactor> findLatestByFarmId(@Param("farmId") Integer farmId);

	// ✅ THÊM @Param cho tất cả parameters
	@Query("SELECT COALESCE(AVG(f. overallFactor), 1.0) FROM FarmEnvironmentFactor f " +
	       "WHERE f.farm.id = :farmId " +
	       "AND ((f.fromDate BETWEEN :startDate AND : endDate) OR (f.toDate BETWEEN :startDate AND : endDate))")
	BigDecimal getAverageFactorByFarmIdAndDateRange(
			@Param("farmId") Integer farmId,
			@Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate);

	// ✅ THÊM @Param cho overlapping factors
	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "WHERE f. farm.id = :farmId " +
	       "AND f.id != :excludeId " +
	       "AND ((f.fromDate BETWEEN :fromDate AND :toDate) OR (f.toDate BETWEEN :fromDate AND :toDate) " +
	       "OR (f. fromDate <= :fromDate AND f.toDate >= :toDate))")
	List<FarmEnvironmentFactor> findOverlappingFactors(
			@Param("farmId") Integer farmId,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate,
			@Param("excludeId") Integer excludeId);

	default List<FarmEnvironmentFactor> findOverlappingFactors(Integer farmId, LocalDate fromDate, LocalDate toDate) {
		return findOverlappingFactors(farmId, fromDate, toDate, -1);
	}

	// ✅ THÊM @Param cho active factors
	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "WHERE f. farm.id = :farmId " +
	       "AND f.fromDate <= :date AND f.toDate >= :date " +
	       "ORDER BY f.createdAt DESC")
	List<FarmEnvironmentFactor> findActiveFactorsByFarmAndDate(
			@Param("farmId") Integer farmId,
			@Param("date") LocalDate date);

	default Optional<FarmEnvironmentFactor> findActiveFactorByFarmAndDate(Integer farmId, LocalDate date) {
		List<FarmEnvironmentFactor> factors = findActiveFactorsByFarmAndDate(farmId, date);
		return factors.isEmpty() ? Optional.empty() : Optional.of(factors.get(0));
	}

	// ✅ THÊM @Param cho current active
	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "WHERE f.farm. id = :farmId " +
	       "AND f.fromDate <= CURRENT_DATE AND f.toDate >= CURRENT_DATE " +
	       "ORDER BY f.createdAt DESC")
	List<FarmEnvironmentFactor> findCurrentActiveFactors(@Param("farmId") Integer farmId);

	default Optional<FarmEnvironmentFactor> findCurrentActiveFactor(Integer farmId) {
		List<FarmEnvironmentFactor> factors = findCurrentActiveFactors(farmId);
		return factors.isEmpty() ? Optional.empty() : Optional.of(factors.get(0));
	}

	// ✅ THÊM @Param cho statistics
	@Query("SELECT MIN(f.overallFactor), MAX(f.overallFactor), AVG(f.overallFactor) " +
	       "FROM FarmEnvironmentFactor f WHERE f.farm.id = :farmId")
	List<Object[]> getFactorStatsByFarmId(@Param("farmId") Integer farmId);

	// ✅ Các method khác
	List<FarmEnvironmentFactor> findByFarmId(Integer farmId);

	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "LEFT JOIN FETCH f.farm " +
	       "WHERE f.farm. id = :farmId " +
	       "ORDER BY f.fromDate DESC")
	List<FarmEnvironmentFactor> findByFarmIdWithFarm(@Param("farmId") Integer farmId);

	@Query("SELECT f FROM FarmEnvironmentFactor f " +
	       "LEFT JOIN FETCH f.farm " +
	       "WHERE f.id = :id")
	Optional<FarmEnvironmentFactor> findByIdWithFarm(@Param("id") Integer id);

	Long countByFarmId(Integer farmId);

	@Query("DELETE FROM FarmEnvironmentFactor f WHERE f.toDate < : date")
	void deleteExpiredFactors(@Param("date") LocalDate date);
}
