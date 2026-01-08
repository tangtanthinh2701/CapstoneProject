package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.TransferStatus;
import com.capston.project.back.end.entity.OwnershipTransfer;
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
public interface OwnershipTransferRepository extends JpaRepository<OwnershipTransfer, Integer> {

	// Find by ID with details
	@Query("SELECT t FROM OwnershipTransfer t " +
	       "LEFT JOIN FETCH t.contract " +
	       "LEFT JOIN FETCH t.ownership o " +
	       "LEFT JOIN FETCH o.project " +
	       "WHERE t.id = :id")
	Optional<OwnershipTransfer> findByIdWithDetails(@Param("id") Integer id);

	// Find by ownership
	List<OwnershipTransfer> findByOwnershipId(Integer ownershipId);

	@Query("SELECT t FROM OwnershipTransfer t " +
	       "LEFT JOIN FETCH t.contract " +
	       "WHERE t.ownership.id = :ownershipId " +
	       "ORDER BY t.createdAt DESC")
	List<OwnershipTransfer> findByOwnershipIdWithDetails(@Param("ownershipId") Integer ownershipId);

	// Find by contract
	List<OwnershipTransfer> findByContractId(Integer contractId);

	// Find by user (from or to)
	@Query("SELECT t FROM OwnershipTransfer t WHERE t.fromUserId = :userId OR t.toUserId = : userId")
	List<OwnershipTransfer> findByUserId(@Param("userId") UUID userId);

	@Query("SELECT t FROM OwnershipTransfer t " +
	       "LEFT JOIN FETCH t.contract " +
	       "LEFT JOIN FETCH t.ownership o " +
	       "LEFT JOIN FETCH o.project " +
	       "WHERE t.fromUserId = :userId OR t.toUserId = :userId " +
	       "ORDER BY t. createdAt DESC")
	List<OwnershipTransfer> findByUserIdWithDetails(@Param("userId") UUID userId);

	// Find by status
	Page<OwnershipTransfer> findByStatus(TransferStatus status, Pageable pageable);

	List<OwnershipTransfer> findByStatus(TransferStatus status);

	// Count
	Long countByStatus(TransferStatus status);

	Long countByOwnershipId(Integer ownershipId);

	// Check pending transfer exists
	boolean existsByOwnershipIdAndStatus(Integer ownershipId, TransferStatus status);

	boolean existsByContractIdAndStatus(Integer contractId, TransferStatus status);
}
