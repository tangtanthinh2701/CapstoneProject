package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.ContractCategory;
import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.common.ContractType;
import com.capston.project.back.end.common.RenewalStatus;
import com.capston.project.back.end.entity.Contract;
import com.capston.project.back.end.entity.ContractRenewal;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.ContractRenewalRepository;
import com.capston.project.back.end.repository.ContractRepository;
import com.capston.project.back.end.repository.OxiOwnershipRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.request.ContractApprovalRequest;
import com.capston.project.back.end.request.ContractRenewalRequest;
import com.capston.project.back.end.request.ContractRequest;
import com.capston.project.back.end.request.ContractTerminationRequest;
import com.capston.project.back.end.response.ContractRenewalResponse;
import com.capston.project.back.end.response.ContractResponse;
import com.capston.project.back.end.response.ContractSummaryResponse;
import com.capston.project.back.end.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ContractServiceImpl implements ContractService {

	private final ContractRepository contractRepository;
	private final ContractRenewalRepository renewalRepository;
	private final ProjectRepository projectRepository;
	private final OxiOwnershipRepository ownershipRepository;

	// ==================== CONTRACT CRUD ====================

	@Override
	@Transactional
	public ContractResponse createContract(ContractRequest request) {
		log.info("Creating contract for project: {}", request.getProjectId());

		Project project = projectRepository.findById(request.getProjectId())
		                                   .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

		String contractCode = generateContractCode();

		Contract contract = Contract.builder()
		                            .contractCode(contractCode)
		                            .project(project)
		                            .contractCategory(request.getContractCategory() != null ? request.getContractCategory() : ContractCategory.ENTERPRISE_PROJECT)
		                            .contractType(request.getContractType() != null ? request.getContractType() : ContractType.OWNERSHIP)
		                            .unitPrice(request.getUnitPrice())
		                            .totalAmount(request.getTotalAmount())
		                            .contractTermYears(request.getContractTermYears())
		                            .startDate(request.getStartDate())
		                            .endDate(request.getEndDate())
		                            .autoRenewal(request.getAutoRenewal() != null ? request.getAutoRenewal() : false)
		                            .renewalTermYears(request.getRenewalTermYears())
		                            .renewalNoticeDays(request.getRenewalNoticeDays() != null ? request.getRenewalNoticeDays() : 30)
		                            .maxRenewals(request.getMaxRenewals())
		                            .renewalCount(0)
		                            .content(request.getContent())
		                            .harvestRights(request.getHarvestRights() != null ? request.getHarvestRights() : false)
		                            .transferAllowed(request.getTransferAllowed() != null ? request.getTransferAllowed() : false)
		                            .earlyTerminationPenalty(request.getEarlyTerminationPenalty())
		                            .contractStatus(ContractStatus.DRAFT)
		                            .contractFileUrl(request.getContractFileUrl())
		                            .notes(request.getNotes())
		                            .serviceScope(request.getServiceScope())
		                            .kpiRequirements(request.getKpiRequirements())
		                            .build();

		Contract saved = contractRepository.save(contract);
		log.info("Created contract with code: {}", saved.getContractCode());

		return mapToContractResponse(saved);
	}

	@Override
	public ContractResponse getContractById(Integer id) {
		Contract contract = contractRepository.findByIdWithDetails(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));
		return mapToContractResponseWithDetails(contract);
	}

	@Override
	public ContractResponse getContractByCode(String code) {
		Contract contract = contractRepository.findByContractCode(code)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "code", code));
		return mapToContractResponse(contract);
	}

	@Override
	@Transactional
	public ContractResponse updateContract(Integer id, ContractRequest request) {
		log.info("Updating contract: {}", id);

		Contract contract = contractRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

		// Only allow update if DRAFT or PENDING
		if (contract.getContractStatus() != ContractStatus.DRAFT &&
		    contract. getContractStatus() != ContractStatus.PENDING) {
			throw new IllegalStateException("Cannot update contract with status: " + contract.getContractStatus());
		}

		// Update fields
		if (request.getContractCategory() != null) {
			contract.setContractCategory(request.getContractCategory());
		}
		if (request.getContractType() != null) {
			contract.setContractType(request.getContractType());
		}
		if (request. getUnitPrice() != null) {
			contract.setUnitPrice(request.getUnitPrice());
		}
		if (request.getTotalAmount() != null) {
			contract.setTotalAmount(request.getTotalAmount());
		}
		if (request.getContractTermYears() != null) {
			contract.setContractTermYears(request.getContractTermYears());
		}
		if (request.getStartDate() != null) {
			contract.setStartDate(request.getStartDate());
		}
		if (request.getEndDate() != null) {
			contract.setEndDate(request.getEndDate());
		}
		if (request. getAutoRenewal() != null) {
			contract.setAutoRenewal(request.getAutoRenewal());
		}
		if (request.getRenewalTermYears() != null) {
			contract.setRenewalTermYears(request.getRenewalTermYears());
		}
		if (request.getRenewalNoticeDays() != null) {
			contract.setRenewalNoticeDays(request.getRenewalNoticeDays());
		}
		if (request.getMaxRenewals() != null) {
			contract.setMaxRenewals(request.getMaxRenewals());
		}
		if (request.getContent() != null) {
			contract.setContent(request.getContent());
		}
		if (request.getHarvestRights() != null) {
			contract.setHarvestRights(request.getHarvestRights());
		}
		if (request.getTransferAllowed() != null) {
			contract. setTransferAllowed(request. getTransferAllowed());
		}
		if (request.getEarlyTerminationPenalty() != null) {
			contract.setEarlyTerminationPenalty(request.getEarlyTerminationPenalty());
		}
		if (request.getContractFileUrl() != null) {
			contract.setContractFileUrl(request.getContractFileUrl());
		}
		if (request. getNotes() != null) {
			contract.setNotes(request.getNotes());
		}
		if (request.getServiceScope() != null) {
			contract.setServiceScope(request.getServiceScope());
		}
		if (request.getKpiRequirements() != null) {
			contract.setKpiRequirements(request.getKpiRequirements());
		}

		Contract saved = contractRepository.save(contract);
		log.info("Updated contract:  {}", saved.getContractCode());

		return mapToContractResponse(saved);
	}

	@Override
	@Transactional
	public void deleteContract(Integer id) {
		log.info("Deleting contract: {}", id);

		Contract contract = contractRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

		// Only allow delete if DRAFT or CANCELLED
		if (contract.getContractStatus() != ContractStatus.DRAFT &&
		    contract. getContractStatus() != ContractStatus.CANCELLED) {
			throw new IllegalStateException("Cannot delete contract with status: " + contract.getContractStatus());
		}

		contractRepository.delete(contract);
		log.info("Deleted contract: {}", id);
	}

	// ==================== CONTRACT LIST ====================

	@Override
	public Page<ContractResponse> getAllContracts(Pageable pageable) {
		Page<Integer> idsPage = contractRepository.findAllContractIds(pageable);

		if (idsPage.isEmpty()) {
			return Page.empty(pageable);
		}

		List<Contract> contracts = contractRepository.findAllWithProjectByIds(idsPage.getContent());

		Map<Integer, Contract> contractMap = contracts.stream()
		                                              .collect(Collectors.toMap(Contract::getId, c -> c));

		List<ContractResponse> responses = idsPage.getContent().stream()
		                                          .map(contractMap::get)
		                                          .filter(Objects::nonNull)
		                                          .map(this::mapToContractResponse)
		                                          .collect(Collectors.toList());

		return new PageImpl<>(responses, pageable, idsPage.getTotalElements());
	}

	@Override
	public Page<ContractResponse> getContractsByStatus(ContractStatus status, Pageable pageable) {
		return contractRepository.findByContractStatus(status, pageable)
		                         .map(this::mapToContractResponse);
	}

	@Override
	public List<ContractResponse> getContractsByProjectId(Integer projectId) {
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}

		return contractRepository.findByProjectIdWithProject(projectId).stream()
		                         .map(this::mapToContractResponse)
		                         .collect(Collectors.toList());
	}

	@Override
	public Page<ContractResponse> searchContracts(String keyword, Pageable pageable) {
		return contractRepository.searchByKeyword(keyword, pageable)
		                         .map(this::mapToContractResponse);
	}

	// ==================== CONTRACT WORKFLOW ====================

	@Override
	@Transactional
	public ContractResponse submitForApproval(Integer id) {
		log.info("Submitting contract for approval: {}", id);

		Contract contract = contractRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

		if (contract.getContractStatus() != ContractStatus.DRAFT) {
			throw new IllegalStateException("Can only submit DRAFT contracts for approval");
		}

		// Validate required fields
		validateContractForApproval(contract);

		contract.setContractStatus(ContractStatus.PENDING);
		Contract saved = contractRepository.save(contract);

		log.info("Contract {} submitted for approval", saved.getContractCode());
		return mapToContractResponse(saved);
	}

	@Override
	@Transactional
	public ContractResponse approveContract(Integer id, ContractApprovalRequest request) {
		log.info("Approving contract: {}", id);

		Contract contract = contractRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

		if (contract.getContractStatus() != ContractStatus.PENDING) {
			throw new IllegalStateException("Can only approve PENDING contracts");
		}

		contract.setContractStatus(ContractStatus.ACTIVE);
		contract.setApprovedBy(request.getApprovedBy());
		contract.setApprovedAt(OffsetDateTime.now());

		if (request.getNotes() != null) {
			contract.setNotes(contract.getNotes() != null ?
			                  contract.getNotes() + "\n[Approval Note] " + request.getNotes() :
			                  "[Approval Note] " + request.getNotes());
		}

		Contract saved = contractRepository.save(contract);

		log.info("Contract {} approved", saved.getContractCode());
		return mapToContractResponse(saved);
	}

	@Override
	@Transactional
	public ContractResponse rejectContract(Integer id, String reason) {
		log.info("Rejecting contract: {}", id);

		Contract contract = contractRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

		if (contract.getContractStatus() != ContractStatus.PENDING) {
			throw new IllegalStateException("Can only reject PENDING contracts");
		}

		contract.setContractStatus(ContractStatus.CANCELLED);
		contract.setNotes(contract.getNotes() != null ?
		                  contract.getNotes() + "\n[Rejection Reason] " + reason :
		                  "[Rejection Reason] " + reason);

		Contract saved = contractRepository.save(contract);

		log.info("Contract {} rejected", saved.getContractCode());
		return mapToContractResponse(saved);
	}

	@Override
	@Transactional
	public ContractResponse activateContract(Integer id) {
		log.info("Activating contract: {}", id);

		Contract contract = contractRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

		if (contract.getContractStatus() != ContractStatus.PENDING &&
		    contract.getContractStatus() != ContractStatus.RENEWED) {
			throw new IllegalStateException("Can only activate PENDING or RENEWED contracts");
		}

		contract.setContractStatus(ContractStatus.ACTIVE);

		// Set start date if not set
		if (contract.getStartDate() == null) {
			contract.setStartDate(LocalDate.now());
		}

		// Calculate end date if not set
		if (contract. getEndDate() == null && contract.getContractTermYears() != null) {
			contract.setEndDate(contract.getStartDate().plusYears(contract. getContractTermYears()));
		}

		Contract saved = contractRepository.save(contract);

		log.info("Contract {} activated", saved.getContractCode());
		return mapToContractResponse(saved);
	}

	@Override
	@Transactional
	public ContractResponse terminateContract(Integer id, ContractTerminationRequest request) {
		log.info("Terminating contract: {}", id);

		Contract contract = contractRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

		if (contract. getContractStatus() != ContractStatus.ACTIVE) {
			throw new IllegalStateException("Can only terminate ACTIVE contracts");
		}

		contract.setContractStatus(ContractStatus.TERMINATED);
		contract.setTerminationReason(request.getTerminationReason());
		contract.setTerminatedAt(OffsetDateTime.now());

		Contract saved = contractRepository.save(contract);

		log.info("Contract {} terminated.  Reason: {}", saved.getContractCode(), request.getTerminationReason());
		return mapToContractResponse(saved);
	}

	// ==================== CONTRACT RENEWAL ====================

	@Override
	@Transactional
	public ContractRenewalResponse requestRenewal(ContractRenewalRequest request) {
		log.info("Requesting renewal for contract: {}", request.getContractId());

		Contract contract = contractRepository.findById(request.getContractId())
		                                      .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

		// Validate
		if (contract.getContractStatus() != ContractStatus.ACTIVE &&
		    contract.getContractStatus() != ContractStatus.EXPIRING_SOON) {
			throw new IllegalStateException("Can only renew ACTIVE or EXPIRING_SOON contracts");
		}

		if (! contract.canRenew()) {
			throw new IllegalStateException("Contract has reached maximum renewals:  " + contract.getMaxRenewals());
		}

		// Get next renewal number
		Integer maxRenewalNumber = renewalRepository.findMaxRenewalNumber(contract.getId()).orElse(0);

		LocalDate newStartDate = contract.getEndDate() != null ?  contract.getEndDate().plusDays(1) : LocalDate.now();
		LocalDate newEndDate = newStartDate.plusYears(request.getRenewalTermYears());

		ContractRenewal renewal = ContractRenewal.builder()
		                                         .originalContract(contract)
		                                         .renewalNumber(maxRenewalNumber + 1)
		                                         .renewalTermYears(request.getRenewalTermYears())
		                                         .oldEndDate(contract.getEndDate())
		                                         .newStartDate(newStartDate)
		                                         .newEndDate(newEndDate)
		                                         .renewalAmount(request.getRenewalAmount())
		                                         .status(RenewalStatus.PENDING)
		                                         .requestedBy(request.getRequestedBy())
		                                         .notes(request.getNotes())
		                                         .build();

		ContractRenewal saved = renewalRepository.save(renewal);

		log.info("Renewal request created for contract {}, renewal #{}", contract.getContractCode(), saved.getRenewalNumber());

		return mapToRenewalResponse(saved);
	}

	@Override
	@Transactional
	public ContractRenewalResponse approveRenewal(Integer renewalId, ContractApprovalRequest request) {
		log.info("Approving renewal: {}", renewalId);

		ContractRenewal renewal = renewalRepository.findByIdWithDetails(renewalId)
		                                           .orElseThrow(() -> new ResourceNotFoundException("ContractRenewal", "id", renewalId));

		if (renewal.getStatus() != RenewalStatus.PENDING) {
			throw new IllegalStateException("Can only approve PENDING renewals");
		}

		Contract contract = renewal.getOriginalContract();

		// Update renewal
		renewal.setStatus(RenewalStatus.APPROVED);
		renewal.setApprovedBy(request.getApprovedBy());
		renewal.setApprovedAt(OffsetDateTime.now());

		if (request.getNotes() != null) {
			renewal.setNotes(renewal.getNotes() != null ? renewal. getNotes() + "\n[Approval Note] " + request.getNotes() : "[Approval Note] " + request. getNotes());
		}

		renewalRepository.save(renewal);

		// Update contract
		contract.setContractStatus(ContractStatus.RENEWED);
		contract.setEndDate(renewal.getNewEndDate());
		contract.setRenewalCount(contract.getRenewalCount() + 1);
		contractRepository.save(contract);

		log.info("Renewal {} approved for contract {}", renewalId, contract.getContractCode());

		return mapToRenewalResponse(renewal);
	}

	@Override
	@Transactional
	public ContractRenewalResponse rejectRenewal(Integer renewalId, String reason) {
		log.info("Rejecting renewal: {}", renewalId);

		ContractRenewal renewal = renewalRepository.findById(renewalId)
		                                           .orElseThrow(() -> new ResourceNotFoundException("ContractRenewal", "id", renewalId));

		if (renewal.getStatus() != RenewalStatus.PENDING) {
			throw new IllegalStateException("Can only reject PENDING renewals");
		}

		renewal.setStatus(RenewalStatus.REJECTED);
		renewal.setNotes(renewal.getNotes() != null ? renewal.getNotes() + "\n[Rejection Reason] " + reason : "[Rejection Reason] " + reason);

		ContractRenewal saved = renewalRepository.save(renewal);

		log.info("Renewal {} rejected", renewalId);

		return mapToRenewalResponse(saved);
	}

	@Override
	public List<ContractRenewalResponse> getRenewalsByContractId(Integer contractId) {
		if (!contractRepository.existsById(contractId)) {
			throw new ResourceNotFoundException("Contract", "id", contractId);
		}

		return renewalRepository.findByContractIdWithDetails(contractId).stream()
		                        .map(this::mapToRenewalResponse)
		                        .collect(Collectors.toList());
	}

	// ==================== STATISTICS ====================

	@Override
	public ContractSummaryResponse getContractSummary() {
		return ContractSummaryResponse.builder()
		                              .totalContracts(contractRepository.count())
		                              .activeContracts(contractRepository.countByStatus(ContractStatus.ACTIVE))
		                              .pendingContracts(contractRepository.countByStatus(ContractStatus.PENDING))
		                              .expiringSoonContracts(contractRepository.countByStatus(ContractStatus.EXPIRING_SOON))
		                              .expiredContracts(contractRepository.countByStatus(ContractStatus. EXPIRED))
		                              .totalContractValue(contractRepository.sumTotalAmount())
		                              .activeContractValue(contractRepository.sumTotalAmountByStatus(ContractStatus.ACTIVE))
		                              .totalOwnerships(ownershipRepository.count())
		                              .build();
	}

	@Override
	public List<ContractResponse> getExpiringSoonContracts() {
		LocalDate today = LocalDate.now();
		LocalDate warningDate = today.plusDays(30);

		return contractRepository.findExpiringSoonContracts(today, warningDate).stream()
		                         .map(this::mapToContractResponse)
		                         .collect(Collectors.toList());
	}

	@Override
	public List<ContractResponse> getExpiredContracts() {
		return contractRepository.findExpiredContracts(LocalDate.now()).stream()
		                         .map(this::mapToContractResponse)
		                         .collect(Collectors.toList());
	}

	// ==================== SCHEDULED TASKS ====================

	@Override
	@Transactional
	public void checkAndUpdateExpiringSoonContracts() {
		log.info("Checking for expiring soon contracts...");

		LocalDate today = LocalDate.now();
		LocalDate warningDate = today.plusDays(30);

		List<Contract> expiringSoon = contractRepository.findExpiringSoonContracts(today, warningDate);

		for (Contract contract : expiringSoon) {
			if (contract.getContractStatus() == ContractStatus.ACTIVE) {
				contract.setContractStatus(ContractStatus.EXPIRING_SOON);
				contractRepository.save(contract);
				log.info("Contract {} marked as EXPIRING_SOON", contract.getContractCode());
			}
		}

		log.info("Found {} contracts expiring soon", expiringSoon.size());
	}

	@Override
	@Transactional
	public void checkAndUpdateExpiredContracts() {
		log.info("Checking for expired contracts...");

		List<Contract> expired = contractRepository. findExpiredContracts(LocalDate.now());

		for (Contract contract :  expired) {
			contract.setContractStatus(ContractStatus.EXPIRED);
			contractRepository.save(contract);
			log.info("Contract {} marked as EXPIRED", contract.getContractCode());
		}

		log.info("Found {} expired contracts", expired.size());
	}

	@Override
	@Transactional
	public void processAutoRenewals() {
		log.info("Processing auto renewals...");

		LocalDate today = LocalDate.now();
		LocalDate warningDate = today.plusDays(30);

		List<Contract> candidates = contractRepository.findAutoRenewalCandidates(today, warningDate);

		for (Contract contract : candidates) {
			try {
				Integer renewalYears = contract.getRenewalTermYears() != null ?
				                       contract.getRenewalTermYears() : contract.getContractTermYears();

				ContractRenewalRequest request = ContractRenewalRequest.builder()
				                                                       .contractId(contract.getId())
				                                                       .renewalTermYears(renewalYears)
				                                                       .notes("Auto renewal")
				                                                       .build();

				ContractRenewalResponse renewal = requestRenewal(request);

				// Auto approve
				ContractApprovalRequest approval = ContractApprovalRequest.builder()
				                                                          .notes("Auto approved")
				                                                          .build();

				approveRenewal(renewal.getId(), approval);

				log.info("Auto renewed contract:  {}", contract.getContractCode());

			} catch (Exception e) {
				log.error("Failed to auto renew contract {}: {}", contract.getContractCode(), e.getMessage());
			}
		}

		log.info("Processed {} auto renewals", candidates.size());
	}

	// ==================== HELPER METHODS ====================

	private String generateContractCode() {
		String prefix = "CTR-";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
		String code = prefix + timestamp;

		while (contractRepository.existsByContractCode(code)) {
			try {
				Thread.sleep(1);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
			timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
			code = prefix + timestamp;
		}
		return code;
	}

	private void validateContractForApproval(Contract contract) {
		List<String> errors = new ArrayList<>();

		if (contract.getUnitPrice() == null) {
			errors.add("Unit price is required");
		}
		if (contract.getTotalAmount() == null) {
			errors.add("Total amount is required");
		}
		if (contract.getProject() == null) {
			errors.add("Project is required");
		}

		if (! errors.isEmpty()) {
			throw new IllegalArgumentException("Contract validation failed: " + String.join(", ", errors));
		}
	}

	private ContractResponse mapToContractResponse(Contract contract) {
		Integer daysUntilExpiry = null;
		if (contract.getEndDate() != null) {
			daysUntilExpiry = (int) ChronoUnit.DAYS.between(LocalDate.now(), contract.getEndDate());
		}

		return ContractResponse.builder()
		                       .id(contract.getId())
		                       .contractCode(contract.getContractCode())
		                       .projectId(contract.getProject() != null ? contract.getProject().getId() : null)
		                       .projectName(contract.getProject() != null ? contract.getProject().getName() : null)
		                       .projectCode(contract.getProject() != null ? contract.getProject().getCode() : null)
		                       .contractCategory(contract.getContractCategory())
		                       .contractType(contract.getContractType())
		                       .unitPrice(contract.getUnitPrice())
		                       .totalAmount(contract.getTotalAmount())
		                       .contractTermYears(contract.getContractTermYears())
		                       .startDate(contract.getStartDate())
		                       .endDate(contract.getEndDate())
		                       .autoRenewal(contract.getAutoRenewal())
		                       .renewalTermYears(contract.getRenewalTermYears())
		                       .renewalNoticeDays(contract.getRenewalNoticeDays())
		                       .maxRenewals(contract.getMaxRenewals())
		                       .renewalCount(contract.getRenewalCount())
		                       .canRenew(contract.canRenew())
		                       .content(contract.getContent())
		                       .harvestRights(contract.getHarvestRights())
		                       .transferAllowed(contract.getTransferAllowed())
		                       .earlyTerminationPenalty(contract.getEarlyTerminationPenalty())
		                       .terminationReason(contract.getTerminationReason())
		                       .terminatedAt(contract.getTerminatedAt())
		                       .contractStatus(contract.getContractStatus())
		                       .isExpiringSoon(contract.isExpiringSoon())
		                       .isExpired(contract.isExpired())
		                       .daysUntilExpiry(daysUntilExpiry)
		                       .paymentDate(contract.getPaymentDate())
		                       .contractFileUrl(contract.getContractFileUrl())
		                       .approvedBy(contract.getApprovedBy())
		                       .approvedAt(contract.getApprovedAt())
		                       .notes(contract.getNotes())
		                       .serviceScope(contract.getServiceScope())
		                       .kpiRequirements(contract.getKpiRequirements())
		                       .createdAt(contract.getCreatedAt())
		                       .updatedAt(contract.getUpdatedAt())
		                       .build();
	}

	private ContractResponse mapToContractResponseWithDetails(Contract contract) {
		ContractResponse response = mapToContractResponse(contract);

		// Add renewals
		if (contract.getRenewals() != null) {
			List<ContractRenewalResponse> renewals = contract.getRenewals()
			                                                 .stream()
			                                                 .map(this::mapToRenewalResponse)
			                                                 .collect(Collectors.toList());
			response.setRenewals(renewals);
		}

		// Add ownership count
		Long ownershipCount = ownershipRepository.countByContractId(contract.getId());
		response.setTotalOwnerships(ownershipCount.intValue());

		return response;
	}

	private ContractRenewalResponse mapToRenewalResponse(ContractRenewal renewal) {
		return ContractRenewalResponse.builder()
		                              .id(renewal.getId())
		                              .originalContractId(renewal.getOriginalContract() != null ? renewal.getOriginalContract().getId() : null)
		                              .originalContractCode(renewal.getOriginalContract() != null ? renewal.getOriginalContract().getContractCode() : null)
		                              .newContractId(renewal.getNewContract() != null ? renewal.getNewContract().getId() : null)
		                              .newContractCode(renewal.getNewContract() != null ? renewal.getNewContract().getContractCode() : null)
		                              .renewalNumber(renewal.getRenewalNumber())
		                              .renewalTermYears(renewal.getRenewalTermYears())
		                              .oldEndDate(renewal.getOldEndDate())
		                              .newStartDate(renewal.getNewStartDate())
		                              .newEndDate(renewal.getNewEndDate())
		                              .renewalAmount(renewal.getRenewalAmount())
		                              .status(renewal.getStatus())
		                              .requestedBy(renewal.getRequestedBy())
		                              .requestedAt(renewal.getRequestedAt())
		                              .approvedBy(renewal.getApprovedBy())
		                              .approvedAt(renewal.getApprovedAt())
		                              .notes(renewal.getNotes())
		                              .createdAt(renewal.getCreatedAt())
		                              .build();
	}
}