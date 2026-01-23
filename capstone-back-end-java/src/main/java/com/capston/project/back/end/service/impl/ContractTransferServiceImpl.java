package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.NotificationType;
import com.capston.project.back.end.common.ReferenceType;
import com.capston.project.back.end.common.TransferStatus;
import com.capston.project.back.end.entity.Contract;
import com.capston.project.back.end.entity.ContractTransfer;
import com.capston.project.back.end.entity.CreditAllocation;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.CarbonCreditAllocationRepository;
import com.capston.project.back.end.repository.ContractRepository;
import com.capston.project.back.end.repository.ContractTransferRepository;
import com.capston.project.back.end.request.ContractTransferRequest;
import com.capston.project.back.end.service.ApprovalWebSocketService;
import com.capston.project.back.end.service.ContractTransferService;
import com.capston.project.back.end.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContractTransferServiceImpl implements ContractTransferService {

    private final ContractTransferRepository transferRepository;
    private final ContractRepository contractRepository;
    private final CarbonCreditAllocationRepository allocationRepository;
    private final NotificationService notificationService;
    private final ApprovalWebSocketService approvalWebSocketService;

    // ==================== CREATE ====================

    @Override
    public ContractTransfer createTransferRequest(ContractTransferRequest request) {
        log.info("Creating transfer request for contract: {}", request.getContractId());

        // Validate contract exists and allows transfer
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + request.getContractId()));

        if (!Boolean.TRUE.equals(contract.getTransferAllowed())) {
            throw new IllegalStateException("This contract does not allow transfers");
        }

        // Check if there's already a pending transfer for this contract
        if (transferRepository.existsByContractIdAndTransferStatus(request.getContractId(), TransferStatus.PENDING)) {
            throw new IllegalStateException("There is already a pending transfer request for this contract");
        }

        // Validate from user is a party of the contract
        if (!request.getFromUserId().equals(contract.getPartyAId()) &&
                !request.getFromUserId().equals(contract.getPartyBId())) {
            throw new IllegalArgumentException("From user is not a party of this contract");
        }

        ContractTransfer transfer = ContractTransfer.builder()
                .contractId(request.getContractId())
                .fromUserId(request.getFromUserId())
                .toUserId(request.getToUserId())
                .transferPercentage(request.getTransferPercentage() != null
                        ? request.getTransferPercentage()
                        : new BigDecimal("100.00"))
                .transferPrice(request.getTransferPrice())
                .transferStatus(TransferStatus.PENDING)
                .notes(request.getNotes())
                .build();

        ContractTransfer saved = transferRepository.save(transfer);
        log.info("Transfer request created: {}", saved.getId());

        // Notify admins
        notificationService.sendToAdmins(
                "Yêu cầu chuyển nhượng hợp đồng mới",
                String.format("Hợp đồng %s có yêu cầu chuyển nhượng mới", contract.getContractCode()),
                NotificationType.TRANSFER_REQUESTED,
                ReferenceType.CONTRACT,
                contract.getId());

        // WebSocket notification to admins
        approvalWebSocketService.notifyAdminsNewApprovalRequest(
                "CONTRACT_TRANSFER",
                "Yêu cầu chuyển nhượng hợp đồng",
                String.format("Hợp đồng %s cần phê duyệt chuyển nhượng", contract.getContractCode()),
                saved.getId(),
                Map.of("contractCode", contract.getContractCode(), "transferId", saved.getId()));

        return saved;
    }

    // ==================== READ ====================

    @Override
    @Transactional(readOnly = true)
    public ContractTransfer getTransferById(Integer id) {
        return transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractTransfer> getAllTransfers(Pageable pageable) {
        return transferRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractTransfer> getPendingTransfers(Pageable pageable) {
        return transferRepository.findByTransferStatus(TransferStatus.PENDING, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractTransfer> getTransfersByContractId(Integer contractId) {
        return transferRepository.findByContractIdOrderByCreatedAtDesc(contractId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractTransfer> getTransfersByUserId(UUID userId) {
        if (userId == null)
            return List.of();
        return transferRepository.findByUserId(userId);
    }

    // ==================== APPROVE/REJECT ====================

    @Override
    public ContractTransfer approveTransfer(Integer transferId, UUID approvedBy) {
        log.info("Approving transfer: {}", transferId);

        ContractTransfer transfer = getTransferById(transferId);

        if (transfer.getTransferStatus() != TransferStatus.PENDING) {
            throw new IllegalStateException("Only PENDING transfers can be approved");
        }

        Contract contract = contractRepository.findById(transfer.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));

        // Update transfer status
        transfer.setTransferStatus(TransferStatus.APPROVED);
        transfer.setApprovedBy(approvedBy);
        transfer.setApprovedAt(OffsetDateTime.now());
        transfer.setTransferDate(LocalDate.now());

        // Transfer credit allocations
        transferCreditAllocations(transfer);

        ContractTransfer saved = transferRepository.save(transfer);
        log.info("Transfer approved: {}", transferId);

        // Notify parties
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("contractCode", contract.getContractCode());
        metadata.put("transferId", transferId);

        // Notify from user
        notificationService.createAndSend(
                transfer.getFromUserId(),
                "Chuyển nhượng đã được phê duyệt",
                String.format("Yêu cầu chuyển nhượng hợp đồng %s đã được phê duyệt", contract.getContractCode()),
                NotificationType.TRANSFER_APPROVED,
                ReferenceType.CONTRACT,
                contract.getId(),
                metadata);

        // Notify to user
        notificationService.createAndSend(
                transfer.getToUserId(),
                "Bạn đã nhận được chuyển nhượng",
                String.format("Bạn đã nhận được chuyển nhượng từ hợp đồng %s", contract.getContractCode()),
                NotificationType.TRANSFER_APPROVED,
                ReferenceType.CONTRACT,
                contract.getId(),
                metadata);

        return saved;
    }

    @Override
    public ContractTransfer rejectTransfer(Integer transferId, String reason) {
        log.info("Rejecting transfer: {} - Reason: {}", transferId, reason);

        ContractTransfer transfer = getTransferById(transferId);

        if (transfer.getTransferStatus() != TransferStatus.PENDING) {
            throw new IllegalStateException("Only PENDING transfers can be rejected");
        }

        transfer.setTransferStatus(TransferStatus.REJECTED);
        transfer.setNotes(transfer.getNotes() != null
                ? transfer.getNotes() + "\n[REJECTED] " + reason
                : "[REJECTED] " + reason);

        ContractTransfer saved = transferRepository.save(transfer);
        log.info("Transfer rejected: {}", transferId);

        // Notify from user
        Contract contract = contractRepository.findById(transfer.getContractId()).orElse(null);
        if (contract != null) {
            notificationService.createAndSend(
                    transfer.getFromUserId(),
                    "Chuyển nhượng bị từ chối",
                    String.format("Yêu cầu chuyển nhượng hợp đồng %s đã bị từ chối. Lý do: %s",
                            contract.getContractCode(), reason),
                    NotificationType.TRANSFER_REJECTED,
                    ReferenceType.CONTRACT,
                    contract.getId(),
                    null);
        }

        return saved;
    }

    @Override
    public ContractTransfer cancelTransfer(Integer transferId) {
        log.info("Cancelling transfer: {}", transferId);

        ContractTransfer transfer = getTransferById(transferId);

        if (transfer.getTransferStatus() != TransferStatus.PENDING) {
            throw new IllegalStateException("Only PENDING transfers can be cancelled");
        }

        transfer.setTransferStatus(TransferStatus.CANCELLED);
        transfer.setNotes(transfer.getNotes() != null
                ? transfer.getNotes() + "\n[CANCELLED BY USER]"
                : "[CANCELLED BY USER]");

        ContractTransfer saved = transferRepository.save(transfer);
        log.info("Transfer cancelled: {}", transferId);

        return saved;
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Chuyển credit allocations từ chủ cũ sang chủ mới
     */
    private void transferCreditAllocations(ContractTransfer transfer) {
        log.info("Transferring credit allocations for transfer: {}", transfer.getId());

        // Get all allocations for this contract owned by from_user
        List<CreditAllocation> allocations = allocationRepository.findByContractId(transfer.getContractId())
                .stream()
                .filter(a -> a.getOwnerId().equals(transfer.getFromUserId()))
                .toList();

        if (allocations.isEmpty()) {
            log.warn("No allocations found to transfer");
            return;
        }

        BigDecimal transferPercentage = transfer.getTransferPercentage();
        boolean isFullTransfer = transferPercentage.compareTo(new BigDecimal("100")) >= 0;

        for (CreditAllocation allocation : allocations) {
            if (isFullTransfer) {
                // Full transfer - just change owner
                allocation.setOwnerId(transfer.getToUserId());
                allocation.setNotes(allocation.getNotes() != null
                        ? allocation.getNotes() + "\n[TRANSFERRED from " + transfer.getFromUserId() + "]"
                        : "[TRANSFERRED from " + transfer.getFromUserId() + "]");
                allocationRepository.save(allocation);
                log.info("Transferred allocation {} to new owner", allocation.getId());
            } else {
                // Partial transfer - split allocation
                int totalCredits = allocation.getAllocatedCredits();
                int transferCredits = transferPercentage.multiply(new BigDecimal(totalCredits))
                        .divide(new BigDecimal(100), 0, RoundingMode.FLOOR)
                        .intValue();

                if (transferCredits > 0) {
                    // Reduce original allocation
                    allocation.setAllocatedCredits(totalCredits - transferCredits);
                    allocation.setAllocationPercentage(
                            allocation.getAllocationPercentage().subtract(transferPercentage));
                    allocationRepository.save(allocation);

                    // Create new allocation for new owner
                    CreditAllocation newAllocation = CreditAllocation.builder()
                            .creditId(allocation.getCreditId())
                            .contractId(allocation.getContractId())
                            .ownerId(transfer.getToUserId())
                            .allocatedCredits(transferCredits)
                            .allocationPercentage(transferPercentage)
                            .notes("[TRANSFERRED from " + transfer.getFromUserId() + "]")
                            .build();
                    allocationRepository.save(newAllocation);

                    log.info("Split allocation: {} credits transferred to new owner", transferCredits);
                }
            }
        }
    }
}
