package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.TransferStatus;
import com.capston.project.back.end.entity.ContractTransfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContractTransferRepository extends JpaRepository<ContractTransfer, Integer> {

    List<ContractTransfer> findByContractIdOrderByCreatedAtDesc(Integer contractId);

    @Query("SELECT ct FROM ContractTransfer ct WHERE ct.fromUserId = :userId OR ct.toUserId = :userId ORDER BY ct.createdAt DESC")
    List<ContractTransfer> findByUserId(@Param("userId") UUID userId);

    Page<ContractTransfer> findByTransferStatus(TransferStatus status, Pageable pageable);

    boolean existsByContractIdAndTransferStatus(Integer contractId, TransferStatus status);

    // Count by status (for Admin statistics)
    long countByTransferStatus(TransferStatus status);
}

