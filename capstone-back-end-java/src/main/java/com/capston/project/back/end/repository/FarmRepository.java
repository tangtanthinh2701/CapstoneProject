package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.entity.Farm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Integer> {

	boolean existsByCode(String code);

	Optional<Farm> findByCode(String code);

	Page<Farm> findByDeletedAtIsNull(Pageable pageable);

	Page<Farm> findByCreatedByAndDeletedAtIsNull(UUID createdBy, Pageable pageable);

	@Query("SELECT f FROM Farm f WHERE f.createdBy = :userId AND f.deletedAt IS NULL")
	Page<Farm> findMyFarms(@Param("userId") java.util.UUID userId, Pageable pageable);

	Page<Farm> findByFarmStatusAndDeletedAtIsNull(FarmStatus status, Pageable pageable);

	Page<Farm> findByFarmStatusAndCreatedByAndDeletedAtIsNull(FarmStatus status, UUID createdBy, Pageable pageable);

	@Query("SELECT f FROM Farm f WHERE f.deletedAt IS NULL " +
			"AND (LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
			"OR LOWER(f.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
	List<Farm> searchByKeyword(@Param("keyword") String keyword);

	@Query("SELECT f FROM Farm f WHERE f.deletedAt IS NULL " +
			"AND f.createdBy = :createdBy " +
			"AND (LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
			"OR LOWER(f.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
	List<Farm> searchByKeywordAndCreatedBy(@Param("keyword") String keyword, @Param("createdBy") UUID createdBy);

	@Query("SELECT f FROM Farm f WHERE f.deletedAt IS NULL")
	List<Farm> findAllActive();

	Long countByDeletedAtIsNull();

	Long countByFarmStatusAndDeletedAtIsNull(FarmStatus status);
}
