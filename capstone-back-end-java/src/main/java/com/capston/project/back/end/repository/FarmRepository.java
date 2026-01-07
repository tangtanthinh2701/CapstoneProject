package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.entity.Farm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Integer> {

	boolean existsByCode(String code);

	Optional<Farm> findByCode(String code);

	@Query("SELECT f FROM Farm f WHERE f.deletedAt IS NULL")
	Page<Farm> findAllActive(Pageable pageable);

	@Query("SELECT f FROM Farm f WHERE f.deletedAt IS NULL AND f.farmStatus = :status")
	Page<Farm> findByStatus(@Param("status") FarmStatus status, Pageable pageable);

	@Query("SELECT DISTINCT f FROM Farm f " +
	       "LEFT JOIN FETCH f.treesFarms tf " +
	       "LEFT JOIN FETCH tf.treeSpecies " +
	       "WHERE f.id = :id AND f.deletedAt IS NULL")
	Optional<Farm> findByIdWithTrees(@Param("id") Integer id);

	@Query("SELECT f. id FROM Farm f WHERE f.deletedAt IS NULL")
	Page<Integer> findAllActiveIds(Pageable pageable);

	@Query("SELECT DISTINCT f FROM Farm f " +
	       "LEFT JOIN FETCH f.treesFarms tf " +
	       "LEFT JOIN FETCH tf.treeSpecies " +
	       "WHERE f.id IN :ids AND f.deletedAt IS NULL")
	List<Farm> findAllWithTreesByIds(@Param("ids") List<Integer> ids);

	@Query("SELECT f FROM Farm f WHERE f.deletedAt IS NULL " +
	       "AND (LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
	       "OR LOWER(f.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
	Page<Farm> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	// ⭐ SỬA Ở ĐÂY - Đảm bảo tên parameter trong @Param khớp với tên trong query
	@Modifying
	@Query("UPDATE Farm f SET " +
	       "f.totalTrees = :totalTrees, " +
	       "f.aliveTrees = :aliveTrees, " +
	       "f. deadTrees = :deadTrees, " +
	       "f.updatedAt = CURRENT_TIMESTAMP " +
	       "WHERE f. id = :farmId")
	void updateTreeStats(@Param("farmId") Integer farmId,
	                     @Param("totalTrees") Integer totalTrees,
	                     @Param("aliveTrees") Integer aliveTrees,
	                     @Param("deadTrees") Integer deadTrees);

	@Query("SELECT f. id FROM Farm f WHERE f.deletedAt IS NULL")
	List<Integer> findAllActiveIdsForBatch();
}
