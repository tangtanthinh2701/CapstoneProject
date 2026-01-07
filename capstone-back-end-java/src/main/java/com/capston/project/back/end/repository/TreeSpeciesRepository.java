package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.TreeSpecies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreeSpeciesRepository extends JpaRepository<TreeSpecies, Integer> {
	Optional<TreeSpecies> findByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCase(String name);

	@Query("SELECT ts FROM TreeSpecies ts WHERE ts.deletedAt IS NULL")
	Page<TreeSpecies> findAllActive(Pageable pageable);

	@Query("SELECT ts FROM TreeSpecies ts WHERE ts.deletedAt IS NULL")
	List<TreeSpecies> findAllActive();

	@Query("SELECT ts FROM TreeSpecies ts WHERE ts. deletedAt IS NULL " +
	       "AND (LOWER(ts.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
	       "OR LOWER(ts.scientificName) LIKE LOWER(CONCAT('%', : keyword, '%')))")
	Page<TreeSpecies> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	@Query("SELECT ts FROM TreeSpecies ts WHERE ts.deletedAt IS NULL " +
	       "ORDER BY ts.carbonAbsorptionRate DESC")
	List<TreeSpecies> findTopByCarbonAbsorption(Pageable pageable);
}
