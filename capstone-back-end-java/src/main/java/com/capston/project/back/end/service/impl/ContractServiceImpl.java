package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.common.NotificationType;
import com.capston.project.back.end.common.ReferenceType;
import com.capston.project.back.end.common.RenewalStatus;
import com.capston.project.back.end.entity.Contract;
import com.capston.project.back.end.entity.ContractRenewal;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.ContractRenewalRepository;
import com.capston.project.back.end.repository.ContractRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.request.ContractApprovalRequest;
import com.capston.project.back.end.request.ContractRenewalRequest;
import com.capston.project.back.end.request.ContractRequest;
import com.capston.project.back.end.request.ContractTerminationRequest;
import com.capston.project.back.end.response.ContractRenewalResponse;
import com.capston.project.back.end.response.ContractResponse;
import com.capston.project.back.end.response.ContractSummaryResponse;
import com.capston.project.back.end.service.ApprovalWebSocketService;
import com.capston.project.back.end.service.ContractService;
import com.capston.project.back.end.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final ContractRenewalRepository contractRenewalRepository;
    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;
    private final ApprovalWebSocketService approvalWebSocketService;

    @Override
    public ContractResponse createContract(ContractRequest request) {
        log.info("Creating new contract for project: {}", request.getProjectId());

        // Validate project exists
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Logic: Prevent contract creation if project has reached its CO2 target
        if (project.getActualCo2Kg() != null && project.getTargetCo2Kg() != null
                && project.getActualCo2Kg().compareTo(project.getTargetCo2Kg()) >= 0) {
            throw new IllegalStateException(
                    "Contracts cannot be created for this project as it has reached or exceeded its CO2 target sequestration.");
        }

        // Generate contract code
        String contractCode = generateContractCode();

        Contract contract = Contract.builder()
                .contractCode(contractCode)
                .projectId(request.getProjectId())
                .contractType(request.getContractType() != null
                        ? request.getContractType()
                        : null)
                .totalValue(request.getTotalAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .durationYears(request.getContractTermYears())
                .isRenewable(request.getAutoRenewal())
                .maxRenewals(request.getMaxRenewals())
                .harvestRights(request.getHarvestRights())
                .transferAllowed(request.getTransferAllowed())
                .notes(request.getNotes())
                .contractFileUrl(request.getContractFileUrl())
                .contractStatus(ContractStatus.DRAFT)
                .build();

        Contract saved = contractRepository.save(contract);
        log.info("Contract created: {}", saved.getContractCode());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContractById(Integer id) {
        Contract contract = contractRepository.findByIdWithProject(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        return mapToResponse(contract);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContractByCode(String code) {
        Contract contract = contractRepository.findByContractCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        return mapToResponse(contract);
    }

    @Override
    public ContractResponse updateContract(Integer id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (contract.getContractStatus() != ContractStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT contracts can be updated");
        }

        updateContractFields(contract, request);
        Contract saved = contractRepository.save(contract);

        return mapToResponse(saved);
    }

    @Override
    public void deleteContract(Integer id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (contract.getContractStatus() != ContractStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT contracts can be deleted");
        }

        contractRepository.delete(contract);
        log.info("Contract deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> getAllContracts(Pageable pageable) {
        return contractRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> getContractsByStatus(ContractStatus status, Pageable pageable) {
        return contractRepository.findByContractStatus(status, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getContractsByProjectId(Integer projectId) {
        return contractRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> searchContracts(String keyword, Pageable pageable) {
        return contractRepository.searchByKeyword(keyword, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> getMyContracts(java.util.UUID userId, Pageable pageable) {
        return contractRepository.findByPartyAIdOrPartyBId(userId, userId, pageable).map(this::mapToResponse);
    }

    // ==================== CONTRACT WORKFLOW ====================

    @Override
    public ContractResponse submitForApproval(Integer id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (contract.getContractStatus() != ContractStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT contracts can be submitted for approval");
        }

        contract.setContractStatus(ContractStatus.PENDING);
        Contract saved = contractRepository.save(contract);

        log.info("Contract submitted for approval: {}", contract.getContractCode());

        // Send notification to admins (stored in DB)
        notificationService.sendToAdmins(
                "Hợp đồng mới chờ phê duyệt",
                String.format("Hợp đồng %s đã được gửi lên chờ phê duyệt", contract.getContractCode()),
                NotificationType.CONTRACT_SUBMITTED,
                ReferenceType.CONTRACT,
                contract.getId());

        // Send real-time WebSocket notification to admins
        approvalWebSocketService.notifyContractPendingApproval(contract.getId(), contract.getContractCode());

        return mapToResponse(saved);
    }

    @Override
    public ContractResponse approveContract(Integer id, ContractApprovalRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (contract.getContractStatus() != ContractStatus.PENDING) {
            throw new IllegalStateException("Only PENDING contracts can be approved");
        }

        contract.setContractStatus(ContractStatus.ACTIVE);
        contract.setApprovedBy(request.getApprovedBy());
        contract.setApprovedAt(OffsetDateTime.now());

        Contract saved = contractRepository.save(contract);

        log.info("Contract approved: {} by {}", contract.getContractCode(), request.getApprovedBy());

        // Send real-time notification to contract parties
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("contractCode", contract.getContractCode());
        metadata.put("projectId", contract.getProjectId());

        if (contract.getPartyAId() != null) {
            notificationService.createAndSend(
                    contract.getPartyAId(),
                    "Hợp đồng đã được phê duyệt",
                    String.format("Hợp đồng %s của bạn đã được phê duyệt và kích hoạt", contract.getContractCode()),
                    NotificationType.CONTRACT_APPROVED,
                    ReferenceType.CONTRACT,
                    contract.getId(),
                    metadata);
        }

        if (contract.getPartyBId() != null) {
            notificationService.createAndSend(
                    contract.getPartyBId(),
                    "Hợp đồng đã được phê duyệt",
                    String.format("Hợp đồng %s đã được phê duyệt và kích hoạt", contract.getContractCode()),
                    NotificationType.CONTRACT_APPROVED,
                    ReferenceType.CONTRACT,
                    contract.getId(),
                    metadata);
            // Send real-time WebSocket notification
            approvalWebSocketService.notifyContractApproved(contract.getPartyBId(), contract.getId(),
                    contract.getContractCode());
        }

        // Also notify partyA via WebSocket if exists
        if (contract.getPartyAId() != null) {
            approvalWebSocketService.notifyContractApproved(contract.getPartyAId(), contract.getId(),
                    contract.getContractCode());
        }

        return mapToResponse(saved);
    }

    @Override
    public ContractResponse rejectContract(Integer id, String reason) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (contract.getContractStatus() != ContractStatus.PENDING) {
            throw new IllegalStateException("Only PENDING contracts can be rejected");
        }

        contract.setContractStatus(ContractStatus.DRAFT);
        contract.setNotes(contract.getNotes() != null
                ? contract.getNotes() + "\n[REJECTED] " + reason
                : "[REJECTED] " + reason);

        Contract saved = contractRepository.save(contract);

        log.info("Contract rejected: {} - Reason: {}", contract.getContractCode(), reason);

        // Send real-time notification to contract parties
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("contractCode", contract.getContractCode());
        metadata.put("reason", reason);

        if (contract.getPartyAId() != null) {
            notificationService.createAndSend(
                    contract.getPartyAId(),
                    "Hợp đồng bị từ chối",
                    String.format("Hợp đồng %s đã bị từ chối. Lý do: %s", contract.getContractCode(), reason),
                    NotificationType.CONTRACT_REJECTED,
                    ReferenceType.CONTRACT,
                    contract.getId(),
                    metadata);
            // Send real-time WebSocket notification
            approvalWebSocketService.notifyContractRejected(contract.getPartyAId(), contract.getId(),
                    contract.getContractCode(), reason);
        }

        if (contract.getPartyBId() != null) {
            approvalWebSocketService.notifyContractRejected(contract.getPartyBId(), contract.getId(),
                    contract.getContractCode(), reason);
        }

        return mapToResponse(saved);
    }

    @Override
    public ContractResponse activateContract(Integer id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        contract.setContractStatus(ContractStatus.ACTIVE);
        Contract saved = contractRepository.save(contract);

        return mapToResponse(saved);
    }

    @Override
    public ContractResponse terminateContract(Integer id, ContractTerminationRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (contract.getContractStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be terminated");
        }

        contract.setContractStatus(ContractStatus.TERMINATED);
        contract.setTerminatedAt(OffsetDateTime.now());
        contract.setTerminationReason(request.getTerminationReason());

        Contract saved = contractRepository.save(contract);

        log.info("Contract terminated: {} - Reason: {}", contract.getContractCode(), request.getTerminationReason());

        // Notify parties
        if (contract.getPartyAId() != null) {
            notificationService.createAndSend(
                    contract.getPartyAId(),
                    "Hợp đồng đã chấm dứt",
                    String.format("Hợp đồng %s đã bị chấm dứt. Lý do: %s", contract.getContractCode(),
                            request.getTerminationReason()),
                    NotificationType.SYSTEM,
                    ReferenceType.CONTRACT,
                    contract.getId(),
                    null);
        }

        return mapToResponse(saved);
    }

    // ==================== CONTRACT RENEWAL ====================

    @Override
    public ContractRenewalResponse requestRenewal(ContractRenewalRequest request) {
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        if (!contract.canRenew()) {
            throw new IllegalStateException("Contract cannot be renewed");
        }

        int renewalNumber = contract.getCurrentRenewalCount() + 1;

        // Calculate new dates based on renewal term
        LocalDate newStartDate = contract.getEndDate() != null ? contract.getEndDate() : LocalDate.now();
        LocalDate newEndDate = newStartDate.plusYears(request.getRenewalTermYears());

        ContractRenewal renewal = ContractRenewal.builder()
                .originalContractId(contract.getId())
                .renewalNumber(renewalNumber)
                .newStartDate(newStartDate)
                .newEndDate(newEndDate)
                .renewalFee(request.getRenewalAmount())
                .renewalStatus(RenewalStatus.PENDING)
                .requestedBy(request.getRequestedBy())
                .requestedAt(OffsetDateTime.now())
                .notes(request.getNotes())
                .build();

        ContractRenewal saved = contractRenewalRepository.save(renewal);

        log.info("Renewal requested for contract: {} - Renewal #{}", contract.getContractCode(), renewalNumber);

        // Notify admins
        notificationService.sendToAdmins(
                "Yêu cầu gia hạn hợp đồng",
                String.format("Hợp đồng %s có yêu cầu gia hạn lần %d", contract.getContractCode(), renewalNumber),
                NotificationType.RENEWAL_REQUESTED,
                ReferenceType.CONTRACT,
                contract.getId());

        return mapToRenewalResponse(saved, contract);
    }

    @Override
    public ContractRenewalResponse approveRenewal(Integer renewalId, ContractApprovalRequest request) {
        ContractRenewal renewal = contractRenewalRepository.findById(renewalId)
                .orElseThrow(() -> new ResourceNotFoundException("Renewal not found"));

        if (renewal.getRenewalStatus() != RenewalStatus.PENDING) {
            throw new IllegalStateException("Only PENDING renewals can be approved");
        }

        renewal.setRenewalStatus(RenewalStatus.APPROVED);
        renewal.setApprovedBy(request.getApprovedBy());
        renewal.setApprovedAt(OffsetDateTime.now());

        // Update contract
        Contract contract = contractRepository.findById(renewal.getOriginalContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        contract.setEndDate(renewal.getNewEndDate());
        contract.setCurrentRenewalCount(contract.getCurrentRenewalCount() + 1);
        contractRepository.save(contract);

        ContractRenewal saved = contractRenewalRepository.save(renewal);

        log.info("Renewal approved: {} for contract {}", renewalId, contract.getContractCode());

        // Notify requester
        if (renewal.getRequestedBy() != null) {
            notificationService.createAndSend(
                    renewal.getRequestedBy(),
                    "Yêu cầu gia hạn được chấp nhận",
                    String.format("Yêu cầu gia hạn hợp đồng %s đã được phê duyệt", contract.getContractCode()),
                    NotificationType.RENEWAL_APPROVED,
                    ReferenceType.CONTRACT,
                    contract.getId(),
                    null);
        }

        return mapToRenewalResponse(saved, contract);
    }

    @Override
    public ContractRenewalResponse rejectRenewal(Integer renewalId, String reason) {
        ContractRenewal renewal = contractRenewalRepository.findById(renewalId)
                .orElseThrow(() -> new ResourceNotFoundException("Renewal not found"));

        if (renewal.getRenewalStatus() != RenewalStatus.PENDING) {
            throw new IllegalStateException("Only PENDING renewals can be rejected");
        }

        renewal.setRenewalStatus(RenewalStatus.REJECTED);
        renewal.setNotes(renewal.getNotes() != null
                ? renewal.getNotes() + "\n[REJECTED] " + reason
                : "[REJECTED] " + reason);

        ContractRenewal saved = contractRenewalRepository.save(renewal);

        Contract contract = contractRepository.findById(renewal.getOriginalContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        // Notify requester
        if (renewal.getRequestedBy() != null) {
            notificationService.createAndSend(
                    renewal.getRequestedBy(),
                    "Yêu cầu gia hạn bị từ chối",
                    String.format("Yêu cầu gia hạn hợp đồng %s đã bị từ chối. Lý do: %s",
                            contract.getContractCode(), reason),
                    NotificationType.SYSTEM,
                    ReferenceType.CONTRACT,
                    contract.getId(),
                    null);
        }

        return mapToRenewalResponse(saved, contract);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractRenewalResponse> getRenewalsByContractId(Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        return contractRenewalRepository.findByOriginalContractId(contractId).stream()
                .map(r -> mapToRenewalResponse(r, contract))
                .collect(Collectors.toList());
    }

    // ==================== STATISTICS ====================

    @Override
    @Transactional(readOnly = true)
    public ContractSummaryResponse getContractSummary() {
        long total = contractRepository.count();
        long pending = contractRepository.countByContractStatus(ContractStatus.PENDING);
        long active = contractRepository.countByContractStatus(ContractStatus.ACTIVE);
        long expired = contractRepository.countByContractStatus(ContractStatus.EXPIRED);

        // Count expiring soon
        LocalDate warningDate = LocalDate.now().plusDays(30);
        long expiringSoon = contractRepository.findExpiringSoon(LocalDate.now(), warningDate).size();

        return ContractSummaryResponse.builder()
                .totalContracts(total)
                .pendingContracts(pending)
                .activeContracts(active)
                .expiredContracts(expired)
                .expiringSoonContracts(expiringSoon)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getExpiringSoonContracts() {
        LocalDate warningDate = LocalDate.now().plusDays(30);
        return contractRepository.findExpiringSoon(LocalDate.now(), warningDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getExpiredContracts() {
        return contractRepository.findByContractStatus(ContractStatus.EXPIRED, Pageable.unpaged())
                .map(this::mapToResponse)
                .getContent();
    }

    // ==================== SCHEDULED TASKS ====================

    @Override
    public void checkAndUpdateExpiringSoonContracts() {
        log.info("Checking for expiring contracts...");
    }

    @Override
    public void checkAndUpdateExpiredContracts() {
        LocalDate today = LocalDate.now();
        List<Contract> expiredContracts = contractRepository.findActiveContractsExpiredBefore(today);

        for (Contract contract : expiredContracts) {
            contract.setContractStatus(ContractStatus.EXPIRED);
            contractRepository.save(contract);

            // Notify parties
            if (contract.getPartyAId() != null) {
                notificationService.createAndSend(
                        contract.getPartyAId(),
                        "Hợp đồng đã hết hạn",
                        String.format("Hợp đồng %s đã hết hạn", contract.getContractCode()),
                        NotificationType.SYSTEM,
                        ReferenceType.CONTRACT,
                        contract.getId(),
                        null);
            }
        }

        log.info("Updated {} expired contracts", expiredContracts.size());
    }

    @Override
    public void processAutoRenewals() {
        log.info("Processing auto-renewals...");
    }

    // ==================== HELPER METHODS ====================

    private String generateContractCode() {
        return "CTR-" + System.currentTimeMillis();
    }

    private void updateContractFields(Contract contract, ContractRequest request) {
        if (request.getContractType() != null) {
            contract.setContractType(request.getContractType());
        }
        if (request.getTotalAmount() != null) {
            contract.setTotalValue(request.getTotalAmount());
        }
        if (request.getStartDate() != null) {
            contract.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            contract.setEndDate(request.getEndDate());
        }
        if (request.getContractTermYears() != null) {
            contract.setDurationYears(request.getContractTermYears());
        }
        if (request.getAutoRenewal() != null) {
            contract.setIsRenewable(request.getAutoRenewal());
        }
        if (request.getMaxRenewals() != null) {
            contract.setMaxRenewals(request.getMaxRenewals());
        }
        if (request.getHarvestRights() != null) {
            contract.setHarvestRights(request.getHarvestRights());
        }
        if (request.getTransferAllowed() != null) {
            contract.setTransferAllowed(request.getTransferAllowed());
        }
        if (request.getNotes() != null) {
            contract.setNotes(request.getNotes());
        }
        if (request.getContractFileUrl() != null) {
            contract.setContractFileUrl(request.getContractFileUrl());
        }
    }

    private ContractResponse mapToResponse(Contract contract) {
        ContractResponse.ContractResponseBuilder builder = ContractResponse.builder()
                .id(contract.getId())
                .contractCode(contract.getContractCode())
                .projectId(contract.getProjectId())
                .totalAmount(contract.getTotalValue())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .contractTermYears(contract.getDurationYears())
                .autoRenewal(contract.getIsRenewable())
                .maxRenewals(contract.getMaxRenewals())
                .renewalCount(contract.getCurrentRenewalCount())
                .harvestRights(contract.getHarvestRights())
                .transferAllowed(contract.getTransferAllowed())
                .contractStatus(contract.getContractStatus())
                .approvedBy(contract.getApprovedBy())
                .approvedAt(contract.getApprovedAt())
                .terminatedAt(contract.getTerminatedAt())
                .terminationReason(contract.getTerminationReason())
                .contractFileUrl(contract.getContractFileUrl())
                .notes(contract.getNotes())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .canRenew(contract.canRenew())
                .isExpired(contract.isExpired())
                .isExpiringSoon(contract.isExpiringSoon());

        // Set project info if available
        if (contract.getProject() != null) {
            builder.projectName(contract.getProject().getName())
                    .projectCode(contract.getProject().getCode());
        }

        // Calculate days until expiry
        if (contract.getEndDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), contract.getEndDate());
            builder.daysUntilExpiry((int) days);
        }

        return builder.build();
    }

    private ContractRenewalResponse mapToRenewalResponse(ContractRenewal renewal, Contract contract) {
        return ContractRenewalResponse.builder()
                .id(renewal.getId())
                .originalContractId(renewal.getOriginalContractId())
                .originalContractCode(contract.getContractCode())
                .renewalNumber(renewal.getRenewalNumber())
                .newStartDate(renewal.getNewStartDate())
                .newEndDate(renewal.getNewEndDate())
                .renewalAmount(renewal.getRenewalFee())
                .status(renewal.getRenewalStatus())
                .requestedBy(renewal.getRequestedBy())
                .requestedAt(renewal.getRequestedAt())
                .approvedBy(renewal.getApprovedBy())
                .approvedAt(renewal.getApprovedAt())
                .notes(renewal.getNotes())
                .createdAt(renewal.getCreatedAt())
                .build();
    }
}