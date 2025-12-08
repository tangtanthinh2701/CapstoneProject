package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Integer>, JpaSpecificationExecutor<Project> {

	Optional<Project> findByCode(String code);

	boolean existsByCode(String code);

	@Query("SELECT p FROM Project p WHERE p.isPublic = true")
	Page<Project> findAllPublicProjects(Pageable pageable);

	@Query("SELECT DISTINCT p FROM Project p " +
	       "LEFT JOIN FETCH p.phases ph " +
	       "LEFT JOIN FETCH ph.treeSpeciesOnPhases ts " +
	       "WHERE p.id = :id")
	Project findByIdWithDetails(@Param("id") Integer id);
}
