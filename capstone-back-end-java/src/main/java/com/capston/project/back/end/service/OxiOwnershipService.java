package com.capston.project.back.end.service;

import com.capston.project.back.end.common.OwnershipStatus;
import com.capston.project.back.end.common.TransferStatus;
import com.capston.project.back.end.request.OwnershipTransferRequest;
import com.capston.project.back.end.request.OxiOwnershipRequest;
import com.capston.project.back.end.response.OwnershipSummaryResponse;
import com.capston.project.back.end.response.OwnershipTransferResponse;
import com.capston.project.back.end.response.OxiOwnershipResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface OxiOwnershipService {
	// Ownership CRUD
	OxiOwnershipResponse createOwnership(OxiOwnershipRequest request);
	OxiOwnershipResponse getOwnershipById(Integer id);
	OxiOwnershipResponse updateOwnership(Integer id, OxiOwnershipRequest request);
	void deleteOwnership(Integer id);

	// Ownership List
	Page<OxiOwnershipResponse> getAllOwnerships(Pageable pageable);
	Page<OxiOwnershipResponse> getOwnershipsByStatus(OwnershipStatus status, Pageable pageable);
	List<OxiOwnershipResponse> getOwnershipsByContractId(Integer contractId);
	List<OxiOwnershipResponse> getOwnershipsByProjectId(Integer projectId);
	List<OxiOwnershipResponse> getOwnershipsByOwnerId(UUID ownerId);
	Page<OxiOwnershipResponse> getOwnershipsByOwnerIdPaged(UUID ownerId, Pageable pageable);

	// Ownership Workflow
	OxiOwnershipResponse activateOwnership(Integer id);
	OxiOwnershipResponse terminateOwnership(Integer id, String reason);

	// Transfer Management
	OwnershipTransferResponse requestTransfer(OwnershipTransferRequest request);
	OwnershipTransferResponse approveTransfer(Integer transferId, UUID approvedBy);
	OwnershipTransferResponse rejectTransfer(Integer transferId, String reason);
	OwnershipTransferResponse cancelTransfer(Integer transferId);
	List<OwnershipTransferResponse> getTransfersByOwnershipId(Integer ownershipId);
	List<OwnershipTransferResponse> getTransfersByUserId(UUID userId);
	Page<OwnershipTransferResponse> getTransfersByStatus(TransferStatus status, Pageable pageable);

	// Statistics
	OwnershipSummaryResponse getOwnershipSummary();
	OwnershipSummaryResponse getOwnershipSummaryByOwner(UUID ownerId);

	// Scheduled tasks
	void checkAndUpdateExpiredOwnerships();
}
