package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.Partner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Integer> {

	boolean existsByPartnerNameIgnoreCase(String partnerName);

	Optional<Partner> findByPartnerNameIgnoreCase(String partnerName);

	@Query("SELECT p FROM Partner p WHERE LOWER(p.partnerName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<Partner> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	@Query("SELECT DISTINCT p FROM Partner p LEFT JOIN FETCH p.projectPartners pp LEFT JOIN FETCH pp.project WHERE p.id = :id")
	Optional<Partner> findByIdWithProjects(@Param("id") Integer id);

	@Query("SELECT p FROM Partner p WHERE p.id NOT IN " +
	       "(SELECT pp.partner.id FROM ProjectPartner pp WHERE pp.project.id = :projectId)")
	List<Partner> findPartnersNotInProject(@Param("projectId") Integer projectId);
}