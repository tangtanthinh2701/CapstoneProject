package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.ProjectPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPartnerRepository extends JpaRepository<ProjectPartner, Integer> {

	List<ProjectPartner> findByProjectId(Integer projectId);

	List<ProjectPartner> findByPartnerId(Integer partnerId);

	@Query("SELECT pp FROM ProjectPartner pp " +
	       "JOIN FETCH pp.partner " +
	       "JOIN FETCH pp.project " +
	       "WHERE pp.project.id = : projectId")
	List<ProjectPartner> findByProjectIdWithDetails(@Param("projectId") Integer projectId);

	@Query("SELECT pp FROM ProjectPartner pp " +
	       "JOIN FETCH pp.partner " +
	       "JOIN FETCH pp.project " +
	       "WHERE pp.partner.id = :partnerId")
	List<ProjectPartner> findByPartnerIdWithDetails(@Param("partnerId") Integer partnerId);

	boolean existsByProjectIdAndPartnerId(Integer projectId, Integer partnerId);

	Optional<ProjectPartner> findByProjectIdAndPartnerId(Integer projectId, Integer partnerId);

	void deleteByProjectIdAndPartnerId(Integer projectId, Integer partnerId);

	@Query("SELECT COUNT(pp) FROM ProjectPartner pp WHERE pp.partner.id = :partnerId")
	Long countProjectsByPartnerId(@Param("partnerId") Integer partnerId);
}