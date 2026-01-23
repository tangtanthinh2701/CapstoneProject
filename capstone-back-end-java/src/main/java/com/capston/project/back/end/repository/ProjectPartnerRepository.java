package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.ProjectPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectPartnerRepository extends JpaRepository<ProjectPartner, Integer> {

	List<ProjectPartner> findByProjectId(Integer projectId);

	List<ProjectPartner> findByPartnerUserId(UUID partnerUserId);

	@Query("SELECT pp FROM ProjectPartner pp " +
	       "LEFT JOIN FETCH pp.partnerUser " +
	       "LEFT JOIN FETCH pp.project " +
	       "WHERE pp.projectId = :projectId")
	List<ProjectPartner> findByProjectIdWithDetails(@Param("projectId") Integer projectId);

	@Query("SELECT pp FROM ProjectPartner pp " +
	       "LEFT JOIN FETCH pp.partnerUser " +
	       "LEFT JOIN FETCH pp.project " +
	       "WHERE pp.partnerUserId = :partnerUserId")
	List<ProjectPartner> findByPartnerUserIdWithDetails(@Param("partnerUserId") UUID partnerUserId);

	boolean existsByProjectIdAndPartnerUserId(Integer projectId, UUID partnerUserId);

	Optional<ProjectPartner> findByProjectIdAndPartnerUserId(Integer projectId, UUID partnerUserId);

	void deleteByProjectIdAndPartnerUserId(Integer projectId, UUID partnerUserId);

	@Query("SELECT COUNT(pp) FROM ProjectPartner pp WHERE pp.partnerUserId = :partnerUserId")
	Long countProjectsByPartnerUserId(@Param("partnerUserId") UUID partnerUserId);
}