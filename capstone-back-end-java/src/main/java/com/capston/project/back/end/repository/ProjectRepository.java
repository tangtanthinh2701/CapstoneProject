package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.models.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.*;
import java.time.LocalDate;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
	boolean existsByCode(String code);

	@Query("SELECT DISTINCT p FROM Project p " + "LEFT JOIN p.phases ph " + "LEFT JOIN ph.treeSpeciesOnPhases tsop " +
	       "WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
	       "AND (:location IS NULL OR LOWER(p.locationText) LIKE LOWER(CONCAT('%', :location, '%'))) " +
	       "AND (:status IS NULL OR p.status = :status) " +
	       "AND (:treeSpeciesId IS NULL OR tsop.treeSpecies.id = :treeSpeciesId) " +
	       "AND (:fromDate IS NULL OR p.plantingDate >= :fromDate) " +
	       "AND (:toDate IS NULL OR p.plantingDate <= :toDate)")
	Page<Project> searchProjects(@Param("name") String name, @Param("location") String location,
	                             @Param("status") ProjectStatus status, @Param("treeSpeciesId") Integer treeSpeciesId,
	                             @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate,
	                             Pageable pageable);
}
