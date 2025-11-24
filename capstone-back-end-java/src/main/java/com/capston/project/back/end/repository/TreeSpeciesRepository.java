package com.capston.project.back.end.repository;

import com.capston.project.back.end.models.TreeSpecies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TreeSpeciesRepository extends JpaRepository<TreeSpecies, Integer> {
	Optional<TreeSpecies> findByName(String name);

	/**
	 * Tìm theo tên khoa học
	 */
	Optional<TreeSpecies> findByScientificName(String scientificName);

	/**
	 * Kiểm tra tên đã tồn tại chưa
	 */
	boolean existsByName(String name);

	/**
	 * Kiểm tra tên khoa học đã tồn tại chưa
	 */
	boolean existsByScientificName(String scientificName);

	/**
	 * Lấy tất cả species đang active
	 */
	List<TreeSpecies> findByIsActiveTrue();

	/**
	 * Lấy tất cả species đang active với pagination
	 */
	Page<TreeSpecies> findByIsActiveTrue(Pageable pageable);

	/**
	 * Lấy tất cả species inactive
	 */
	List<TreeSpecies> findByIsActiveFalse();

	/**
	 * Đếm số species active
	 */
	long countByIsActiveTrue();

	/**
	 * Đếm số species inactive
	 */
	long countByIsActiveFalse();

	// ==================== SEARCH QUERIES ====================

	/**
	 * Tìm kiếm theo tên (không phân biệt chữ hoa/thường)
	 */
	List<TreeSpecies> findByNameContainingIgnoreCase(String name);

	/**
	 * Tìm kiếm theo tên hoặc tên khoa học
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
	       "LOWER(t.scientificName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	List<TreeSpecies> searchByNameOrScientificName(@Param("keyword") String keyword);

	/**
	 * Tìm kiếm với pagination
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
	       "LOWER(t.scientificName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<TreeSpecies> searchByNameOrScientificName(
			@Param("keyword") String keyword,
			Pageable pageable);

	// ==================== CARBON ABSORPTION QUERIES ====================

	/**
	 * Tìm species có hệ số carbon cao nhất
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE t.isActive = true " +
	       "ORDER BY t.carbonAbsorptionRate DESC")
	List<TreeSpecies> findTopCarbonAbsorbers(Pageable pageable);

	/**
	 * Tìm species theo range carbon absorption
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.carbonAbsorptionRate BETWEEN :minRate AND :maxRate " +
	       "AND t.isActive = true")
	List<TreeSpecies> findByCarbonRateRange(
			@Param("minRate") BigDecimal minRate,
			@Param("maxRate") BigDecimal maxRate);

	/**
	 * Tính carbon absorption rate trung bình
	 */
	@Query("SELECT AVG(t.carbonAbsorptionRate) FROM TreeSpecies t WHERE t.isActive = true")
	BigDecimal getAverageCarbonAbsorptionRate();

	/**
	 * Lấy carbon rate cao nhất
	 */
	@Query("SELECT MAX(t.carbonAbsorptionRate) FROM TreeSpecies t WHERE t.isActive = true")
	BigDecimal getMaxCarbonAbsorptionRate();

	/**
	 * Lấy carbon rate thấp nhất
	 */
	@Query("SELECT MIN(t.carbonAbsorptionRate) FROM TreeSpecies t WHERE t.isActive = true")
	BigDecimal getMinCarbonAbsorptionRate();

	// ==================== GROWTH RATE QUERIES ====================

	/**
	 * Tìm theo tốc độ sinh trưởng
	 */
	List<TreeSpecies> findByGrowthRateAndIsActiveTrue(String growthRate);

	/**
	 * Đếm theo tốc độ sinh trưởng
	 */
	long countByGrowthRate(String growthRate);

	/**
	 * Đếm theo từng loại tốc độ sinh trưởng
	 */
	@Query("SELECT t.growthRate, COUNT(t) FROM TreeSpecies t " +
	       "WHERE t.isActive = true GROUP BY t.growthRate")
	List<Object[]> countByGrowthRateGrouped();

	// ==================== ENVIRONMENTAL REQUIREMENTS ====================

	/**
	 * Tìm theo yêu cầu nước
	 */
	List<TreeSpecies> findByWaterRequirementAndIsActiveTrue(String waterRequirement);

	/**
	 * Tìm theo yêu cầu ánh sáng
	 */
	List<TreeSpecies> findBySunlightRequirementAndIsActiveTrue(String sunlightRequirement);

	/**
	 * Tìm species phù hợp với điều kiện môi trường
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.waterRequirement = :waterReq AND " +
	       "t.sunlightRequirement = :sunlightReq AND " +
	       "t.isActive = true")
	List<TreeSpecies> findByEnvironmentalConditions(
			@Param("waterReq") String waterRequirement,
			@Param("sunlightReq") String sunlightRequirement);

	// ==================== COMMERCIAL VALUE QUERIES ====================

	/**
	 * Lấy species có giá trị thương mại
	 */
	List<TreeSpecies> findByHasCommercialValueTrueAndIsActiveTrue();

	/**
	 * Đếm species có giá trị thương mại
	 */
	long countByHasCommercialValueTrue();

	/**
	 * Tìm species có giá trị gỗ cao nhất
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.woodValue IS NOT NULL AND t.isActive = true " +
	       "ORDER BY t.woodValue DESC")
	List<TreeSpecies> findTopByWoodValue(Pageable pageable);

	/**
	 * Tìm species có giá trị quả cao nhất
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.fruitValue IS NOT NULL AND t.isActive = true " +
	       "ORDER BY t.fruitValue DESC")
	List<TreeSpecies> findTopByFruitValue(Pageable pageable);

	/**
	 * Tính tổng giá trị gỗ
	 */
	@Query("SELECT SUM(t.woodValue) FROM TreeSpecies t WHERE " +
	       "t.woodValue IS NOT NULL AND t.isActive = true")
	BigDecimal getTotalWoodValue();

	/**
	 * Tính tổng giá trị quả
	 */
	@Query("SELECT SUM(t.fruitValue) FROM TreeSpecies t WHERE " +
	       "t.fruitValue IS NOT NULL AND t.isActive = true")
	BigDecimal getTotalFruitValue();

	// ==================== LIFESPAN QUERIES ====================

	/**
	 * Tìm theo range tuổi thọ
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.typicalLifespan BETWEEN :minLifespan AND :maxLifespan " +
	       "AND t.isActive = true")
	List<TreeSpecies> findByLifespanRange(
			@Param("minLifespan") Integer minLifespan,
			@Param("maxLifespan") Integer maxLifespan);

	/**
	 * Tìm species có tuổi thọ cao nhất
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.typicalLifespan IS NOT NULL AND t.isActive = true " +
	       "ORDER BY t.typicalLifespan DESC")
	List<TreeSpecies> findLongestLivingSpecies(Pageable pageable);

	// ==================== STATISTICS QUERIES ====================

	/**
	 * Lấy thống kê tổng quan
	 */
	@Query("SELECT " +
	       "COUNT(t), " +
	       "COUNT(CASE WHEN t.isActive = true THEN 1 END), " +
	       "COUNT(CASE WHEN t.hasCommercialValue = true THEN 1 END), " +
	       "AVG(t.carbonAbsorptionRate), " +
	       "AVG(t.woodValue), " +
	       "AVG(t.fruitValue) " +
	       "FROM TreeSpecies t")
	List<Object[]> getStatistics();

	// ==================== CUSTOM COMPLEX QUERIES ====================

	/**
	 * Tìm species tốt nhất cho mục đích carbon credit
	 * (Carbon rate cao, tuổi thọ lâu, sinh trưởng nhanh)
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.isActive = true AND " +
	       "t.carbonAbsorptionRate >= :minCarbonRate AND " +
	       "t.growthRate IN ('FAST', 'MEDIUM') " +
	       "ORDER BY t.carbonAbsorptionRate DESC, t.typicalLifespan DESC")
	List<TreeSpecies> findBestForCarbonCredit(
			@Param("minCarbonRate") BigDecimal minCarbonRate,
			Pageable pageable);

	/**
	 * Tìm species tốt nhất cho mục đích kinh tế
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.isActive = true AND " +
	       "t.hasCommercialValue = true AND " +
	       "(t.woodValue IS NOT NULL OR t.fruitValue IS NOT NULL) " +
	       "ORDER BY (COALESCE(t.woodValue, 0) + COALESCE(t.fruitValue, 0)) DESC")
	List<TreeSpecies> findBestForEconomic(Pageable pageable);

	/**
	 * Gợi ý species theo điều kiện
	 */
	@Query("SELECT t FROM TreeSpecies t WHERE " +
	       "t.isActive = true AND " +
	       "(:waterReq IS NULL OR t.waterRequirement = :waterReq) AND " +
	       "(:sunlightReq IS NULL OR t.sunlightRequirement = :sunlightReq) AND " +
	       "(:growthRate IS NULL OR t.growthRate = :growthRate) AND " +
	       "(:needCommercial IS NULL OR t.hasCommercialValue = :needCommercial)")
	List<TreeSpecies> findRecommendations(
			@Param("waterReq") String waterRequirement,
			@Param("sunlightReq") String sunlightRequirement,
			@Param("growthRate") String growthRate,
			@Param("needCommercial") Boolean needCommercial);
}
