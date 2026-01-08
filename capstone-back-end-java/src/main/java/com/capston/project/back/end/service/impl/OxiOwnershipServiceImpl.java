package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.OwnershipStatus;
import com.capston.project.back.end.common.TransferStatus;
import com.capston.project.back.end.entity.Contract;
import com.capston.project.back.end.entity.OwnershipTransfer;
import com.capston.project.back.end.entity.OxiOwnership;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.ContractRepository;
import com.capston.project.back.end.repository.OwnershipTransferRepository;
import com.capston.project.back.end.repository.OxiOwnershipRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.request.OwnershipTransferRequest;
import com.capston.project.back.end.request.OxiOwnershipRequest;
import com.capston.project.back.end.response.OwnershipSummaryResponse;
import com.capston.project.back.end.response.OwnershipTransferResponse;
import com.capston.project.back.end.response.OxiOwnershipResponse;
import com.capston.project.back.end.service.OxiOwnershipService;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OxiOwnershipServiceImpl implements OxiOwnershipService {

	private final OxiOwnershipRepository ownershipRepository;
	private final OwnershipTransferRepository transferRepository;
	private final ContractRepository contractRepository;
	private final ProjectRepository projectRepository;
	private final TreeSpeciesRepository treeSpeciesRepository;

	// ==================== OWNERSHIP CRUD ====================

	@Override
	@Transactional
	public OxiOwnershipResponse createOwnership(OxiOwnershipRequest request) {
		log.info("Creating ownership for contract: {}, owner: {}", request.getContractId(), request.getOwnerId());

		Contract contract = contractRepository.findById(request.getContractId())
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

		Project project = projectRepository.findById(request.getProjectId())
		                                   .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

		TreeSpecies treeSpecies = null;
		if (request.getTreeSpeciesId() != null) {
			treeSpecies = treeSpeciesRepository.findById(request.getTreeSpeciesId())
			                                   .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies", "id", request.getTreeSpeciesId()));
		}

		// Validate dates
		if (request.getOwnershipEndDate().isBefore(request.getOwnershipStartDate())) {
			throw new IllegalArgumentException("End date must be after start date");
		}

		// Check total carbon percentage doesn't exceed 100%
		BigDecimal currentTotal = ownershipRepository.sumCarbonPercentageByProjectId(request.getProjectId());
		BigDecimal requestedPercentage = request.getCarbonCreditPercentage() != null ?
		                                 request.getCarbonCreditPercentage() :
		                                 new BigDecimal("100. 00");

		if (currentTotal.add(requestedPercentage).compareTo(new BigDecimal("100.00")) > 0) {
			throw new IllegalArgumentException("Total carbon percentage would exceed 100%.  Current:  " + currentTotal + "%, Requested: " + requestedPercentage + "%");
		}

		OxiOwnership ownership = OxiOwnership.builder()
		                                     .contract(contract)
		                                     .project(project)
		                                     .treeSpecies(treeSpecies)
		                                     .ownerId(request.getOwnerId())
		                                     .ownershipStartDate(request.getOwnershipStartDate())
		                                     .ownershipEndDate(request.getOwnershipEndDate())
		                                     .carbonCreditPercentage(requestedPercentage)
		                                     .status(OwnershipStatus.PENDING)
		                                     .build();

		OxiOwnership saved = ownershipRepository.save(ownership);
		log.info("Created ownership with id: {}", saved.getId());

		return mapToOwnershipResponse(saved);
	}

	@Override
	public OxiOwnershipResponse getOwnershipById(Integer id) {
		OxiOwnership ownership = ownershipRepository.findByIdWithAllDetails(id)
		                                            .orElseThrow(() -> new ResourceNotFoundException("OxiOwnership", "id", id));
		return mapToOwnershipResponseWithDetails(ownership);
	}

	@Override
	@Transactional
	public OxiOwnershipResponse updateOwnership(Integer id, OxiOwnershipRequest request) {
		log.info("Updating ownership: {}", id);

		OxiOwnership ownership = ownershipRepository.findById(id)
		                                            .orElseThrow(() -> new ResourceNotFoundException("OxiOwnership", "id", id));

		// Only allow update if PENDING
		if (ownership.getStatus() != OwnershipStatus. PENDING) {
			throw new IllegalStateException("Can only update PENDING ownerships");
		}

		if (request.getOwnershipStartDate() != null) {
			ownership.setOwnershipStartDate(request.getOwnershipStartDate());
		}
		if (request.getOwnershipEndDate() != null) {
			ownership.setOwnershipEndDate(request.getOwnershipEndDate());
		}
		if (request.getCarbonCreditPercentage() != null) {
			// Validate percentage
			BigDecimal currentTotal = ownershipRepository.sumCarbonPercentageByProjectId(ownership.getProjectId());
			BigDecimal otherOwnerships = currentTotal.subtract(ownership.getCarbonCreditPercentage());

			if (otherOwnerships.add(request.getCarbonCreditPercentage()).compareTo(new BigDecimal("100.00")) > 0) {
				throw new IllegalArgumentException("Total carbon percentage would exceed 100%");
			}

			ownership.setCarbonCreditPercentage(request.getCarbonCreditPercentage());
		}
		if (request.getTreeSpeciesId() != null) {
			TreeSpecies treeSpecies = treeSpeciesRepository.findById(request.getTreeSpeciesId())
			                                               .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies", "id", request. getTreeSpeciesId()));
			ownership.setTreeSpecies(treeSpecies);
		}

		OxiOwnership saved = ownershipRepository.save(ownership);
		return mapToOwnershipResponse(saved);
	}

	@Override
	@Transactional
	public void deleteOwnership(Integer id) {
		log.info("Deleting ownership: {}", id);

		OxiOwnership ownership = ownershipRepository.findById(id)
		                                            .orElseThrow(() -> new ResourceNotFoundException("OxiOwnership", "id", id));

		// Only allow delete if PENDING
		if (ownership.getStatus() != OwnershipStatus.PENDING) {
			throw new IllegalStateException("Can only delete PENDING ownerships");
		}

		ownershipRepository.delete(ownership);
		log.info("Deleted ownership: {}", id);
	}

	// ==================== OWNERSHIP LIST ====================

	@Override
	public Page<OxiOwnershipResponse> getAllOwnerships(Pageable pageable) {
		Page<Integer> idsPage = ownershipRepository.findAllOwnershipIds(pageable);

		if (idsPage.isEmpty()) {
			return Page.empty(pageable);
		}

		List<OxiOwnership> ownerships = ownershipRepository.findAllWithDetailsByIds(idsPage.getContent());

		Map<Integer, OxiOwnership> ownershipMap = ownerships.stream()
		                                                    .collect(Collectors.toMap(OxiOwnership::getId, o -> o));

		List<OxiOwnershipResponse> responses = idsPage.getContent()
		                                              .stream()
		                                              .map(ownershipMap::get)
		                                              .filter(Objects::nonNull)
		                                              .map(this::mapToOwnershipResponse)
		                                              .collect(Collectors.toList());

		return new PageImpl<>(responses, pageable, idsPage. getTotalElements());
	}

	@Override
	public Page<OxiOwnershipResponse> getOwnershipsByStatus(OwnershipStatus status, Pageable pageable) {
		return ownershipRepository.findByStatus(status, pageable)
		                          .map(this::mapToOwnershipResponse);
	}

	@Override
	public List<OxiOwnershipResponse> getOwnershipsByContractId(Integer contractId) {
		if (!contractRepository.existsById(contractId)) {
			throw new ResourceNotFoundException("Contract", "id", contractId);
		}

		return ownershipRepository.findByContractIdWithDetails(contractId)
		                          .stream()
		                          .map(this::mapToOwnershipResponse)
		                          .collect(Collectors. toList());
	}

	@Override
	public List<OxiOwnershipResponse> getOwnershipsByProjectId(Integer projectId) {
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}

		return ownershipRepository.findByProjectIdWithDetails(projectId)
		                          .stream()
		                          .map(this:: mapToOwnershipResponse)
		                          .collect(Collectors.toList());
	}

	@Override
	public List<OxiOwnershipResponse> getOwnershipsByOwnerId(UUID ownerId) {
		return ownershipRepository.findByOwnerIdWithDetails(ownerId)
		                          .stream()
		                          .map(this:: mapToOwnershipResponse)
		                          .collect(Collectors.toList());
	}

	@Override
	public Page<OxiOwnershipResponse> getOwnershipsByOwnerIdPaged(UUID ownerId, Pageable pageable) {
		return ownershipRepository.findByOwnerId(ownerId, pageable)
		                          .map(this::mapToOwnershipResponse);
	}

	// ==================== OWNERSHIP WORKFLOW ====================

	@Override
	@Transactional
	public OxiOwnershipResponse activateOwnership(Integer id) {
		log.info("Activating ownership: {}", id);

		OxiOwnership ownership = ownershipRepository.findById(id)
		                                            .orElseThrow(() -> new ResourceNotFoundException("OxiOwnership", "id", id));

		if (ownership.getStatus() != OwnershipStatus.PENDING) {
			throw new IllegalStateException("Can only activate PENDING ownerships");
		}

		ownership.setStatus(OwnershipStatus.ACTIVE);
		OxiOwnership saved = ownershipRepository.save(ownership);

		log.info("Ownership {} activated", id);
		return mapToOwnershipResponse(saved);
	}

	@Override
	@Transactional
	public OxiOwnershipResponse terminateOwnership(Integer id, String reason) {
		log.info("Terminating ownership: {}", id);

		OxiOwnership ownership = ownershipRepository.findById(id)
		                                            .orElseThrow(() -> new ResourceNotFoundException("OxiOwnership", "id", id));

		if (ownership.getStatus() != OwnershipStatus.ACTIVE) {
			throw new IllegalStateException("Can only terminate ACTIVE ownerships");
		}

		ownership.setStatus(OwnershipStatus.TERMINATED);
		OxiOwnership saved = ownershipRepository.save(ownership);

		log.info("Ownership {} terminated.  Reason: {}", id, reason);
		return mapToOwnershipResponse(saved);
	}

	// ==================== TRANSFER MANAGEMENT ====================

	@Override
	@Transactional
	public OwnershipTransferResponse requestTransfer(OwnershipTransferRequest request) {
		log.info("Requesting transfer from {} to {}", request.getFromUserId(), request.getToUserId());

		// Validate - must have either contractId or ownershipId
		if (request.getContractId() == null && request.getOwnershipId() == null) {
			throw new IllegalArgumentException("Either contractId or ownershipId is required");
		}

		Contract contract = null;
		OxiOwnership ownership = null;

		if (request.getOwnershipId() != null) {
			ownership = ownershipRepository.findById(request.getOwnershipId())
			                               .orElseThrow(() -> new ResourceNotFoundException("OxiOwnership", "id", request.getOwnershipId()));

			if (ownership.getStatus() != OwnershipStatus.ACTIVE) {
				throw new IllegalStateException("Can only transfer ACTIVE ownerships");
			}

			if (! ownership.getOwnerId().equals(request.getFromUserId())) {
				throw new IllegalArgumentException("From user is not the owner of this ownership");
			}

			// Check if there's already a pending transfer
			if (transferRepository.existsByOwnershipIdAndStatus(request.getOwnershipId(), TransferStatus.PENDING)) {
				throw new IllegalStateException("There's already a pending transfer for this ownership");
			}

			// Check if ownership allows transfer
			if (ownership.getContract() != null && !Boolean.TRUE.equals(ownership.getContract().getTransferAllowed())) {
				throw new IllegalStateException("Transfer is not allowed for this ownership's contract");
			}
		}

		if (request. getContractId() != null) {
			contract = contractRepository. findById(request.getContractId())
			                             .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request. getContractId()));

			if (! Boolean.TRUE.equals(contract.getTransferAllowed())) {
				throw new IllegalStateException("Transfer is not allowed for this contract");
			}
		}

		OwnershipTransfer transfer = OwnershipTransfer.builder()
		                                              .contract(contract)
		                                              .ownership(ownership)
		                                              .fromUserId(request.getFromUserId())
		                                              .toUserId(request.getToUserId())
		                                              .carbonCredit(request.getCarbonCredit() != null ? request.getCarbonCredit() : new BigDecimal("100.00"))
		                                              .transferPrice(request.getTransferPrice())
		                                              .status(TransferStatus.PENDING)
		                                              .notes(request.getNotes())
		                                              .build();

		OwnershipTransfer saved = transferRepository.save(transfer);
		log.info("Transfer request created with id: {}", saved.getId());

		return mapToTransferResponse(saved);
	}

	@Override
	@Transactional
	public OwnershipTransferResponse approveTransfer(Integer transferId, UUID approvedBy) {
		log.info("Approving transfer: {}", transferId);

		OwnershipTransfer transfer = transferRepository.findByIdWithDetails(transferId)
		                                               .orElseThrow(() -> new ResourceNotFoundException("OwnershipTransfer", "id", transferId));

		if (transfer.getStatus() != TransferStatus.PENDING) {
			throw new IllegalStateException("Can only approve PENDING transfers");
		}

		// Update transfer
		transfer.setStatus(TransferStatus.COMPLETED);
		transfer.setApprovedBy(approvedBy);
		transfer.setApprovedAt(OffsetDateTime.now());
		transfer.setTransferDate(LocalDate.now());

		// If ownership transfer, update ownership
		if (transfer.getOwnership() != null) {
			OxiOwnership ownership = transfer.getOwnership();

			if (transfer.getCarbonCredit().compareTo(new BigDecimal("100.00")) == 0) {
				// Full transfer - change owner
				ownership.setOwnerId(transfer.getToUserId());
				ownership.setStatus(OwnershipStatus.TRANSFERRED);
				ownershipRepository.save(ownership);
			} else {
				// Partial transfer - create new ownership for the receiver
				OxiOwnership newOwnership = OxiOwnership.builder()
				                                        .contract(ownership.getContract())
				                                        .project(ownership.getProject())
				                                        .treeSpecies(ownership.getTreeSpecies())
				                                        .ownerId(transfer.getToUserId())
				                                        .ownershipStartDate(LocalDate.now())
				                                        .ownershipEndDate(ownership.getOwnershipEndDate())
				                                        .carbonCreditPercentage(ownership.getCarbonCreditPercentage()
				                                                                         .multiply(transfer.getCarbonCredit())
				                                                                         .divide(new BigDecimal("100.00")))
				                                        .status(OwnershipStatus.ACTIVE)
				                                        .build();

				// Update original ownership percentage
				BigDecimal remainingPercentage = new BigDecimal("100.00").subtract(transfer.getCarbonCredit());
				ownership.setCarbonCreditPercentage(ownership.getCarbonCreditPercentage()
				                                             .multiply(remainingPercentage)
				                                             .divide(new BigDecimal("100.00")));

				ownershipRepository.save(ownership);
				ownershipRepository.save(newOwnership);
			}
		}

		OwnershipTransfer saved = transferRepository.save(transfer);
		log.info("Transfer {} approved", transferId);

		return mapToTransferResponse(saved);
	}

	@Override
	@Transactional
	public OwnershipTransferResponse rejectTransfer(Integer transferId, String reason) {
		log.info("Rejecting transfer: {}", transferId);

		OwnershipTransfer transfer = transferRepository.findById(transferId)
		                                               .orElseThrow(() -> new ResourceNotFoundException("OwnershipTransfer", "id", transferId));

		if (transfer.getStatus() != TransferStatus.PENDING) {
			throw new IllegalStateException("Can only reject PENDING transfers");
		}

		transfer.setStatus(TransferStatus.REJECTED);
		transfer.setNotes(transfer.getNotes() != null ?
		                  transfer.getNotes() + "\n[Rejection Reason] " + reason :
		                  "[Rejection Reason] " + reason);

		OwnershipTransfer saved = transferRepository.save(transfer);
		log.info("Transfer {} rejected", transferId);

		return mapToTransferResponse(saved);
	}

	@Override
	@Transactional
	public OwnershipTransferResponse cancelTransfer(Integer transferId) {
		log.info("Cancelling transfer: {}", transferId);

		OwnershipTransfer transfer = transferRepository.findById(transferId)
		                                               .orElseThrow(() -> new ResourceNotFoundException("OwnershipTransfer", "id", transferId));

		if (transfer.getStatus() != TransferStatus.PENDING) {
			throw new IllegalStateException("Can only cancel PENDING transfers");
		}

		transfer.setStatus(TransferStatus.CANCELLED);
		OwnershipTransfer saved = transferRepository.save(transfer);

		log.info("Transfer {} cancelled", transferId);
		return mapToTransferResponse(saved);
	}

	@Override
	public List<OwnershipTransferResponse> getTransfersByOwnershipId(Integer ownershipId) {
		return transferRepository.findByOwnershipIdWithDetails(ownershipId)
		                         .stream()
		                         .map(this::mapToTransferResponse)
		                         .collect(Collectors. toList());
	}

	@Override
	public List<OwnershipTransferResponse> getTransfersByUserId(UUID userId) {
		return transferRepository.findByUserIdWithDetails(userId)
		                         .stream()
		                         .map(this::mapToTransferResponse)
		                         .collect(Collectors.toList());
	}

	@Override
	public Page<OwnershipTransferResponse> getTransfersByStatus(TransferStatus status, Pageable pageable) {
		return transferRepository.findByStatus(status, pageable)
		                         .map(this::mapToTransferResponse);
	}

	// ==================== STATISTICS ====================

	@Override
	public OwnershipSummaryResponse getOwnershipSummary() {
		return OwnershipSummaryResponse.builder()
		                               .totalOwnerships(ownershipRepository. count())
		                               .activeOwnerships(ownershipRepository.countByStatus(OwnershipStatus.ACTIVE))
		                               .pendingOwnerships(ownershipRepository.countByStatus(OwnershipStatus.PENDING))
		                               .expiredOwnerships(ownershipRepository.countByStatus(OwnershipStatus.EXPIRED))
		                               .expiringSoonOwnerships((long) ownershipRepository.findExpiringSoon(LocalDate.now(), LocalDate.now().plusDays(30)).size())
		                               .totalTransfers(transferRepository.count())
		                               .pendingTransfers(transferRepository.countByStatus(TransferStatus. PENDING))
		                               .completedTransfers(transferRepository.countByStatus(TransferStatus. COMPLETED))
		                               .build();
	}

	@Override
	public OwnershipSummaryResponse getOwnershipSummaryByOwner(UUID ownerId) {
		List<OxiOwnership> ownerships = ownershipRepository. findByOwnerId(ownerId);

		long active = ownerships.stream().filter(o -> o.getStatus() == OwnershipStatus. ACTIVE).count();
		long pending = ownerships.stream().filter(o -> o.getStatus() == OwnershipStatus. PENDING).count();
		long expired = ownerships.stream().filter(o -> o.getStatus() == OwnershipStatus. EXPIRED).count();
		long expiringSoon = ownerships.stream().filter(o -> o.isExpiringSoon(30)).count();

		BigDecimal totalCarbon = ownershipRepository.sumCarbonPercentageByOwnerId(ownerId);

		List<OwnershipTransfer> transfers = transferRepository.findByUserId(ownerId);
		long pendingTransfers = transfers.stream().filter(t -> t.getStatus() == TransferStatus.PENDING).count();
		long completedTransfers = transfers.stream().filter(t -> t.getStatus() == TransferStatus.COMPLETED).count();

		return OwnershipSummaryResponse.builder()
		                               .totalOwnerships((long) ownerships.size())
		                               .activeOwnerships(active)
		                               .pendingOwnerships(pending)
		                               .expiredOwnerships(expired)
		                               .expiringSoonOwnerships(expiringSoon)
		                               .totalTransfers((long) transfers.size())
		                               .pendingTransfers(pendingTransfers)
		                               .completedTransfers(completedTransfers)
		                               .totalCarbonPercentageOwned(totalCarbon)
		                               .build();
	}

	// ==================== SCHEDULED TASKS ====================

	@Override
	@Transactional
	public void checkAndUpdateExpiredOwnerships() {
		log.info("Checking for expired ownerships...");

		List<OxiOwnership> expired = ownershipRepository.findExpired(LocalDate.now());

		for (OxiOwnership ownership :  expired) {
			ownership.setStatus(OwnershipStatus.EXPIRED);
			ownershipRepository.save(ownership);
			log.info("Ownership {} marked as EXPIRED", ownership.getId());
		}

		log.info("Found {} expired ownerships", expired. size());
	}

	// ==================== HELPER METHODS ====================

	private OxiOwnershipResponse mapToOwnershipResponse(OxiOwnership ownership) {
		Integer daysUntilExpiry = null;
		if (ownership.getOwnershipEndDate() != null) {
			daysUntilExpiry = (int) ChronoUnit.DAYS.between(LocalDate.now(), ownership.getOwnershipEndDate());
		}

		return OxiOwnershipResponse.builder()
		                           .id(ownership.getId())
		                           .contractId(ownership.getContract() != null ? ownership.getContract().getId() : null)
		                           .contractCode(ownership.getContract() != null ? ownership.getContract().getContractCode() : null)
		                           .projectId(ownership.getProject() != null ? ownership.getProject().getId() : null)
		                           .projectName(ownership.getProject() != null ? ownership.getProject().getName() : null)
		                           .projectCode(ownership.getProject() != null ? ownership.getProject().getCode() : null)
		                           .treeSpeciesId(ownership.getTreeSpecies() != null ? ownership.getTreeSpecies().getId() : null)
		                           .treeSpeciesName(ownership.getTreeSpecies() != null ? ownership.getTreeSpecies().getName() : null)
		                           .ownerId(ownership. getOwnerId())
		                           .ownershipStartDate(ownership. getOwnershipStartDate())
		                           .ownershipEndDate(ownership.getOwnershipEndDate())
		                           .carbonCreditPercentage(ownership. getCarbonCreditPercentage())
		                           .status(ownership. getStatus())
		                           .isActive(ownership.isActive())
		                           .isExpired(ownership.isExpired())
		                           .isExpiringSoon(ownership.isExpiringSoon(30))
		                           .daysUntilExpiry(daysUntilExpiry)
		                           .createdAt(ownership.getCreatedAt())
		                           .updatedAt(ownership.getUpdatedAt())
		                           .build();
	}

	private OxiOwnershipResponse mapToOwnershipResponseWithDetails(OxiOwnership ownership) {
		OxiOwnershipResponse response = mapToOwnershipResponse(ownership);

		// Add transfers
		if (ownership.getTransfers() != null) {
			List<OwnershipTransferResponse> transfers = ownership.getTransfers().stream()
			                                                     .map(this::mapToTransferResponse)
			                                                     .collect(Collectors. toList());
			response.setTransfers(transfers);
		}

		// Add credit allocations count
		if (ownership.getCreditAllocations() != null) {
			response.setTotalCreditAllocations(ownership.getCreditAllocations().size());
			BigDecimal totalCredits = ownership.getCreditAllocations()
			                                   .stream()
			                                   .map(a -> BigDecimal.valueOf(a.getAllocatedCredits()))
			                                   .reduce(BigDecimal.ZERO, BigDecimal::add);
			response.setTotalCreditsReceived(totalCredits);
		}

		return response;
	}

	private OwnershipTransferResponse mapToTransferResponse(OwnershipTransfer transfer) {
		return OwnershipTransferResponse.builder()
		                                .id(transfer.getId())
		                                .contractId(transfer.getContract() != null ? transfer.getContract().getId() : null)
		                                .contractCode(transfer.getContract() != null ? transfer.getContract().getContractCode() : null)
		                                .ownershipId(transfer.getOwnershipId())
		                                .fromUserId(transfer.getFromUserId())
		                                .toUserId(transfer.getToUserId())
		                                .carbonCredit(transfer.getCarbonCredit())
		                                .transferPrice(transfer.getTransferPrice())
		                                .status(transfer.getStatus())
		                                .transferDate(transfer.getTransferDate())
		                                .approvedBy(transfer.getApprovedBy())
		                                .approvedAt(transfer.getApprovedAt())
		                                .notes(transfer.getNotes())
		                                .createdAt(transfer.getCreatedAt())
		                                .build();
	}
}
