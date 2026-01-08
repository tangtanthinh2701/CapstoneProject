package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.OwnershipStatus;
import com.capston.project.back.end.entity.OxiOwnership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OxiOwnershipRepository extends JpaRepository<OxiOwnership, Integer> {

	// Find by ID with details
	@Query("SELECT o FROM OxiOwnership o " +
	       "LEFT JOIN FETCH o.contract c " +
	       "LEFT JOIN FETCH o.project p " +
	       "LEFT JOIN FETCH o. treeSpecies " +
	       "WHERE o.id = :id")
	Optional<OxiOwnership> findByIdWithDetails(@Param("id") Integer id);

	@Query("SELECT o FROM OxiOwnership o " +
	       "LEFT JOIN FETCH o.contract c " +
	       "LEFT JOIN FETCH o.project p " +
	       "LEFT JOIN FETCH o. treeSpecies " +
	       "LEFT JOIN FETCH o.transfers " +
	       "WHERE o.id = :id")
	Optional<OxiOwnership> findByIdWithAllDetails(@Param("id") Integer id);

	// Find by contract
	List<OxiOwnership> findByContractId(Integer contractId);

	@Query("SELECT o FROM OxiOwnership o " +
	       "LEFT JOIN FETCH o.project " +
	       "LEFT JOIN FETCH o.treeSpecies " +
	       "WHERE o.contract.id = :contractId")
	List<OxiOwnership> findByContractIdWithDetails(@Param("contractId") Integer contractId);

	// Find by project
	List<OxiOwnership> findByProjectId(Integer projectId);

	@Query("SELECT o FROM OxiOwnership o " +
	       "LEFT JOIN FETCH o.contract " +
	       "LEFT JOIN FETCH o.treeSpecies " +
	       "WHERE o.project.id = :projectId")
	List<OxiOwnership> findByProjectIdWithDetails(@Param("projectId") Integer projectId);

	// Find by owner
	List<OxiOwnership> findByOwnerId(UUID ownerId);

	@Query("SELECT o FROM OxiOwnership o " +
	       "LEFT JOIN FETCH o.contract " +
	       "LEFT JOIN FETCH o.project " +
	       "LEFT JOIN FETCH o.treeSpecies " +
	       "WHERE o.ownerId = : ownerId")
	List<OxiOwnership> findByOwnerIdWithDetails(@Param("ownerId") UUID ownerId);

	Page<OxiOwnership> findByOwnerId(UUID ownerId, Pageable pageable);

	// Find by status
	Page<OxiOwnership> findByStatus(OwnershipStatus status, Pageable pageable);

	List<OxiOwnership> findByStatus(OwnershipStatus status);

	// Find active ownerships for a project
	@Query("SELECT o FROM OxiOwnership o WHERE o.project.id = :projectId AND o.status = 'ACTIVE'")
	List<OxiOwnership> findActiveByProjectId(@Param("projectId") Integer projectId);

	// Find expiring soon
	@Query("SELECT o FROM OxiOwnership o WHERE o. status = 'ACTIVE' " +
	       "AND o.ownershipEndDate BETWEEN :today AND :warningDate")
	List<OxiOwnership> findExpiringSoon(@Param("today") LocalDate today,
	                                    @Param("warningDate") LocalDate warningDate);

	// Find expired
	@Query("SELECT o FROM OxiOwnership o WHERE o.status = 'ACTIVE' " +
	       "AND o.ownershipEndDate < : today")
	List<OxiOwnership> findExpired(@Param("today") LocalDate today);

	// Count
	Long countByContractId(Integer contractId);

	Long countByProjectId(Integer projectId);

	Long countByOwnerId(UUID ownerId);

	Long countByStatus(OwnershipStatus status);

	// Sum carbon percentage by project
	@Query("SELECT COALESCE(SUM(o.carbonCreditPercentage), 0) FROM OxiOwnership o " +
	       "WHERE o.project.id = :projectId AND o.status = 'ACTIVE'")
	BigDecimal sumCarbonPercentageByProjectId(@Param("projectId") Integer projectId);

	// Sum carbon percentage by owner
	@Query("SELECT COALESCE(SUM(o.carbonCreditPercentage), 0) FROM OxiOwnership o " +
	       "WHERE o.ownerId = :ownerId AND o. status = 'ACTIVE'")
	BigDecimal sumCarbonPercentageByOwnerId(@Param("ownerId") UUID ownerId);

	// Update status
	@Modifying
	@Query("UPDATE OxiOwnership o SET o.status = : status, o.updatedAt = CURRENT_TIMESTAMP WHERE o.id = :id")
	void updateStatus(@Param("id") Integer id, @Param("status") OwnershipStatus status);

	// Check if owner already has ownership in project
	boolean existsByOwnerIdAndProjectIdAndStatus(UUID ownerId, Integer projectId, OwnershipStatus status);

	// Pagination with project
	@Query("SELECT o. id FROM OxiOwnership o")
	Page<Integer> findAllOwnershipIds(Pageable pageable);

	@Query("SELECT DISTINCT o FROM OxiOwnership o " +
	       "LEFT JOIN FETCH o.contract " +
	       "LEFT JOIN FETCH o.project " +
	       "LEFT JOIN FETCH o.treeSpecies " +
	       "WHERE o.id IN :ids")
	List<OxiOwnership> findAllWithDetailsByIds(@Param("ids") List<Integer> ids);
}
