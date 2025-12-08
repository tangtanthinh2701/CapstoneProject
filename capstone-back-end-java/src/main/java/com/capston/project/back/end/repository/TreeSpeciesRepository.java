package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.TreeSpecies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TreeSpeciesRepository extends JpaRepository<TreeSpecies, Integer>, JpaSpecificationExecutor<TreeSpecies> {
	@Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
	       "FROM TreeSpecies t WHERE LOWER(t.name) = LOWER(:name)")
	Boolean existsByNameIgnoreCase(@Param("name") String name);

	@Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
	       "FROM TreeSpecies t WHERE LOWER(t.scientificName) = LOWER(:scientificName)")
	Boolean existsByScientificNameIgnoreCase(@Param("scientificName") String scientificName);

	@Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
	       "FROM TreeSpecies t WHERE LOWER(t.name) = LOWER(:name) AND t.id != :id")
	Boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Integer id);

	@Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
	       "FROM TreeSpecies t WHERE LOWER(t.scientificName) = LOWER(:scientificName) AND t.id != :id")
	Boolean existsByScientificNameIgnoreCaseAndIdNot(
			@Param("scientificName") String scientificName, @Param("id") Integer id);

	@Query("SELECT t FROM TreeSpecies t WHERE LOWER(t.name) = LOWER(:name)")
	Optional<TreeSpecies> findByNameIgnoreCase(@Param("name") String name);

	@Query("SELECT t FROM TreeSpecies t WHERE t.isActive = true")
	Page<TreeSpecies> findAllActive(Pageable pageable);

	@Query("SELECT t FROM TreeSpecies t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<TreeSpecies> searchByName(@Param("keyword") String keyword, Pageable pageable);
}
