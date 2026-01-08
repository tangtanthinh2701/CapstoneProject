package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.TreesFarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreesFarmRepository extends JpaRepository<TreesFarm, Integer> {
	List<TreesFarm> findByFarmId(Integer farmId);

	@Query("SELECT tf FROM TreesFarm tf " +
	       "JOIN FETCH tf.treeSpecies " +
	       "WHERE tf.farm.id = :farmId")
	List<TreesFarm> findByFarmIdWithSpecies(@Param("farmId") Integer farmId);

	@Query("SELECT tf FROM TreesFarm tf " +
	       "JOIN FETCH tf.treeSpecies " +
	       "JOIN FETCH tf.farm " +
	       "WHERE tf. id = :id")
	Optional<TreesFarm> findByIdWithDetails(@Param("id") Integer id);

	// Tìm cây có sẵn để bán
	@Query("SELECT tf FROM TreesFarm tf " +
	       "JOIN FETCH tf.treeSpecies ts " +
	       "JOIN FETCH tf.farm f " +
	       "WHERE tf.availableTrees > 0 " +
	       "AND tf.treeStatus = 'ALIVE' " +
	       "AND f.farmStatus = 'ACTIVE' " +
	       "AND f.deletedAt IS NULL")
	List<TreesFarm> findAvailableForSale();

	// Tìm cây có sẵn theo loại cây
	@Query("SELECT tf FROM TreesFarm tf " +
	       "JOIN FETCH tf.treeSpecies ts " +
	       "JOIN FETCH tf.farm f " +
	       "WHERE tf. availableTrees > 0 " +
	       "AND tf. treeStatus = 'ALIVE' " +
	       "AND tf.treeSpecies.id = :speciesId " +
	       "AND f.farmStatus = 'ACTIVE' " +
	       "AND f.deletedAt IS NULL")
	List<TreesFarm> findAvailableBySpecies(@Param("speciesId") Integer speciesId);

	// Tìm cây có sẵn theo farm
	@Query("SELECT tf FROM TreesFarm tf " +
	       "JOIN FETCH tf.treeSpecies ts " +
	       "WHERE tf.availableTrees > 0 " +
	       "AND tf.treeStatus = 'ALIVE' " +
	       "AND tf.farm. id = :farmId")
	List<TreesFarm> findAvailableByFarm(@Param("farmId") Integer farmId);

	// Tổng số cây trong farm
	@Query("SELECT COALESCE(SUM(tf.numberTrees), 0) FROM TreesFarm tf WHERE tf.farm.id = :farmId")
	Integer sumTreesByFarmId(@Param("farmId") Integer farmId);

	// Tổng số cây còn sống trong farm
	@Query("SELECT COALESCE(SUM(tf.numberTrees), 0) FROM TreesFarm tf " +
	       "WHERE tf.farm.id = :farmId AND tf.treeStatus = 'ALIVE'")
	Integer sumAliveTreesByFarmId(@Param("farmId") Integer farmId);

	// Tổng CO2 đã hấp thụ trong farm
	@Query("SELECT COALESCE(SUM(tf.totalCo2Absorbed), 0) FROM TreesFarm tf WHERE tf.farm.id = :farmId")
	BigDecimal sumCarbonAbsorbedByFarmId(@Param("farmId") Integer farmId);

	// Cập nhật số cây available sau khi bán
	@Modifying
	@Query("UPDATE TreesFarm tf SET " +
	       "tf.availableTrees = tf.availableTrees - : quantity, " +
	       "tf.updatedAt = CURRENT_TIMESTAMP " +
	       "WHERE tf. id = :id AND tf.availableTrees >= :quantity")
	int decreaseAvailableTrees(@Param("id") Integer id, @Param("quantity") Integer quantity);

	// Lấy tất cả để batch update carbon
	@Query("SELECT tf.id FROM TreesFarm tf WHERE tf.treeStatus = 'ALIVE'")
	List<Integer> findAllAliveIds();

	// Cập nhật carbon absorbed
	@Modifying
	@Query("UPDATE TreesFarm tf SET " +
	       "tf. totalCo2Absorbed = : carbon, " +
	       "tf. updatedAt = CURRENT_TIMESTAMP " +
	       "WHERE tf.id = :id")
	void updateCarbonAbsorbed(@Param("id") Integer id, @Param("carbon") BigDecimal carbon);

	@Query("SELECT COALESCE(SUM(tf.totalCo2Absorbed), 0) FROM TreesFarm tf")
	BigDecimal sumTotalCo2Absorbed();

	@Query("SELECT SUM(tf.numberTrees), SUM(CASE WHEN tf.treeStatus = 'ALIVE' THEN tf.numberTrees ELSE 0 END) FROM TreesFarm tf")
	List<Object[]> getTreeStats();

	@Query("SELECT COALESCE(SUM(tf.totalCo2Absorbed), 0) FROM TreesFarm tf " +
	       "WHERE EXTRACT(YEAR FROM tf.createdAt) = :year AND EXTRACT(MONTH FROM tf.createdAt) = :month")
	BigDecimal sumCo2AbsorbedByMonth(@Param("year") Integer year, @Param("month") Integer month);

	@Query("SELECT COALESCE(SUM(tf.numberTrees), 0) FROM TreesFarm tf " +
	       "JOIN ProjectFarm pf ON tf.farm.id = pf.farm. id " +
	       "WHERE pf.project.id = :projectId")
	Long countTreesByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(tf.totalCo2Absorbed), 0) FROM TreesFarm tf WHERE tf.treeSpecies. id = :speciesId")
	BigDecimal sumCo2AbsorbedBySpeciesId(@Param("speciesId") Integer speciesId);

	@Query("SELECT COALESCE(SUM(tf.numberTrees), 0) FROM TreesFarm tf WHERE tf.treeSpecies.id = :speciesId")
	Long countTreesBySpeciesId(@Param("speciesId") Integer speciesId);
}