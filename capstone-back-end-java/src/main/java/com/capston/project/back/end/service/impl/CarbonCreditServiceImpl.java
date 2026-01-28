package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.*;
import com.capston.project.back.end.entity.*;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.*;
import com.capston.project.back.end.request.CarbonCreditRequest;
import com.capston.project.back.end.request.CreditPurchaseRequest;
import com.capston.project.back.end.request.CreditRetireRequest;
import com.capston.project.back.end.response.CarbonCreditResponse;
import com.capston.project.back.end.response.CreditAllocationResponse;
import com.capston.project.back.end.response.CreditSummaryResponse;
import com.capston.project.back.end.response.CreditTransactionResponse;
import com.capston.project.back.end.service.ApprovalWebSocketService;
import com.capston.project.back.end.service.CarbonCreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CarbonCreditServiceImpl implements CarbonCreditService {

    private final CarbonCreditRepository carbonCreditRepository;
    private final CarbonCreditAllocationRepository allocationRepository;
    private final CreditTransactionRepository transactionRepository;
    private final ProjectRepository projectRepository;
    private final FarmRepository farmRepository;
    private final TreeBatchRepository treeBatchRepository;
    private final ContractRepository contractRepository;
    private final ModelMapper modelMapper;
    private final ApprovalWebSocketService webSocketService;

    @Override
    public CarbonCreditResponse createCredit(CarbonCreditRequest request) {
        log.info("Minting carbon credits for project: {}", request.getProjectId());

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        // Suggest total credits based on actual CO2 (1 ton = 1 credit)
        BigDecimal actualCo2Tons = project.getActualCo2Kg().divide(new BigDecimal(1000), 2, RoundingMode.FLOOR);

        CarbonCredit credit = CarbonCredit.builder()
                .creditCode(generateCreditCode(project.getCode()))
                .projectId(request.getProjectId())
                .issuanceYear(request.getIssuanceYear())
                .totalCo2Tons(request.getTotalCo2Tons() != null ? request.getTotalCo2Tons() : actualCo2Tons)
                .creditsIssued(request.getCreditsIssued())
                .creditsAvailable(request.getCreditsIssued())
                .creditsAllocated(0)
                .creditsSold(0)
                .creditsRetired(0)
                .basePricePerCredit(request.getBasePricePerCredit())
                .currentPricePerCredit(request.getBasePricePerCredit())
                .creditStatus(CreditStatus.PENDING)
                .verificationStandard(request.getVerificationStandard())
                .verificationDate(request.getVerificationDate())
                .certificateUrl(request.getCertificateUrl())
                .issuedBy(request.getIssuedBy())
                .build();

        // Map origins from request to entity
        if (request.getOrigins() != null) {
            List<java.util.Map<String, Object>> originMapList = request.getOrigins().stream()
                    .map(o -> {
                        java.util.Map<String, Object> m = new java.util.HashMap<>();
                        m.put("farmId", o.getFarmId());
                        m.put("batchId", o.getBatchId());
                        m.put("quantity", o.getQuantity());
                        return m;
                    }).collect(Collectors.toList());
            credit.setOrigins(originMapList);
        }

        CarbonCredit saved = carbonCreditRepository.save(credit);

        // Notify admins for verification via WebSocket
        webSocketService.notifyCreditPendingVerification(saved.getId(), saved.getCreditCode());

        return mapToResponse(saved);
    }

    @Override
    public CarbonCreditResponse verifyAndActivateCredit(Integer creditId, UUID verifiedBy) {
        log.info("Verifying credit: {}", creditId);
        CarbonCredit credit = carbonCreditRepository.findById(creditId)
                .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", creditId));

        credit.setCreditStatus(CreditStatus.AVAILABLE);
        credit.setVerifierUserId(verifiedBy);
        credit.setVerificationDate(java.time.LocalDate.now());

        CarbonCredit saved = carbonCreditRepository.save(credit);

        // Auto-allocate credits to project owners
        allocateCreditsToOwners(saved.getId(), verifiedBy);

        return mapToResponse(saved);
    }

    @Override
    public void allocateCreditsToOwners(Integer creditId, UUID allocatedBy) {
        log.info("Allocating credits for creditId: {}", creditId);
        CarbonCredit credit = carbonCreditRepository.findById(creditId)
                .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", creditId));

        // Find contracts (OWNERSHIP or INVESTMENT) for this project that have credit
        // rights
        List<Contract> activeContracts = contractRepository.findByProjectId(credit.getProjectId())
                .stream()
                .filter(c -> c.getContractStatus() == ContractStatus.ACTIVE)
                .filter(c -> c.getContractType() == ContractType.OWNERSHIP
                        || c.getContractType() == ContractType.INVESTMENT)
                .collect(Collectors.toList());

        int totalAllocated = 0;
        for (Contract contract : activeContracts) {
            if (contract.getCarbonCreditPercentage() == null
                    || contract.getCarbonCreditPercentage().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            int allocated = credit.getCreditsIssued() * contract.getCarbonCreditPercentage().intValue() / 100;
            if (allocated <= 0)
                continue;

            CreditAllocation allocation = CreditAllocation.builder()
                    .creditId(creditId)
                    .contractId(contract.getId())
                    .ownerId(contract.getPartyAId() != null ? contract.getPartyAId() : contract.getPartyBId())
                    .allocatedCredits(allocated)
                    .allocationPercentage(contract.getCarbonCreditPercentage())
                    .allocationStatus(AllocationStatus.ALLOCATED)
                    .allocatedAt(OffsetDateTime.now())
                    .build();

            allocationRepository.save(allocation);
            totalAllocated += allocated;

            // Notify owner via WebSocket
            webSocketService.notifyCreditVerified(allocation.getOwnerId(), creditId, credit.getCreditCode());
        }

        credit.setCreditsAllocated(totalAllocated);
        credit.setCreditsAvailable(credit.getCreditsIssued() - totalAllocated);
        carbonCreditRepository.save(credit);

        log.info("Finished allocation for credit {}: {} credits allocated", credit.getCreditCode(), totalAllocated);
    }

    @Override
    public CreditTransactionResponse purchaseCredits(CreditPurchaseRequest request, UUID buyerId) {
        log.info("Processing credit purchase for buyer: {}", buyerId);
        CarbonCredit credit = carbonCreditRepository.findById(request.getCreditId())
                .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", request.getCreditId()));

        Project project = projectRepository.findById(credit.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", credit.getProjectId()));

        // Logic: Prevent purchase if project has reached its CO2 target
        if (project.getActualCo2Kg() != null && project.getTargetCo2Kg() != null
                && project.getActualCo2Kg().compareTo(project.getTargetCo2Kg()) >= 0) {
            throw new IllegalStateException(
                    "Carbon credits cannot be purchased for this project as it has reached or exceeded its CO2 target sequestration.");
        }

        if (credit.getCreditsAvailable() < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough credits available");
        }

        BigDecimal totalAmount = credit.getCurrentPricePerCredit().multiply(new BigDecimal(request.getQuantity()));

        CreditTransaction transaction = CreditTransaction.builder()
                .transactionCode("TXN-" + System.currentTimeMillis())
                .creditId(credit.getId())
                .buyerId(buyerId)
                .quantity(request.getQuantity())
                .unitPrice(credit.getCurrentPricePerCredit())
                .totalAmount(totalAmount)
                .transactionType(TransactionType.PURCHASE)
                .transactionStatus(TransactionStatus.COMPLETED)
                .transactionDate(OffsetDateTime.now())
                .build();

        CreditTransaction saved = transactionRepository.save(transaction);

        // Update credit inventory
        credit.setCreditsSold(credit.getCreditsSold() + request.getQuantity());
        credit.setCreditsAvailable(credit.getCreditsAvailable() - request.getQuantity());
        if (credit.getCreditsAvailable() == 0) {
            credit.setCreditStatus(CreditStatus.SOLD_OUT);
        } else {
            credit.setCreditStatus(CreditStatus.PARTIALLY_SOLD);
        }
        carbonCreditRepository.save(credit);

        return mapToTransactionResponse(saved);
    }

    @Override
    public CreditTransactionResponse retireCredits(CreditRetireRequest request, UUID retiredBy) {
        log.info("Processing credit retirement for user: {}", retiredBy);

        CarbonCredit credit = carbonCreditRepository.findById(request.getCreditId())
                .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", request.getCreditId()));

        // Calculate user balance for this specific credit
        int balance = getUserCreditBalance(retiredBy, credit.getId());

        if (balance < request.getQuantity()) {
            throw new IllegalArgumentException(String.format(
                    "Insufficient credit balance. Available: %d, Requested: %d", balance, request.getQuantity()));
        }

        CreditTransaction transaction = CreditTransaction.builder()
                .transactionCode("RET-" + System.currentTimeMillis())
                .creditId(credit.getId())
                .buyerId(retiredBy)
                .quantity(request.getQuantity())
                .unitPrice(credit.getCurrentPricePerCredit())
                .totalAmount(BigDecimal.ZERO)
                .transactionType(TransactionType.RETIREMENT)
                .transactionStatus(TransactionStatus.COMPLETED)
                .retirementReason(request.getReason())
                .transactionDate(OffsetDateTime.now())
                .retiredAt(OffsetDateTime.now())
                .build();

        CreditTransaction saved = transactionRepository.save(transaction);

        credit.setCreditsRetired(credit.getCreditsRetired() + request.getQuantity());
        carbonCreditRepository.save(credit);

        return mapToTransactionResponse(saved);
    }

    private int getUserCreditBalance(UUID userId, Integer creditId) {
        // Better: use specific creditId filter
        Integer specificAllocated = allocationRepository.findAll().stream()
                .filter(a -> a.getOwnerId().equals(userId) && a.getCreditId().equals(creditId)
                        && a.getAllocationStatus() == com.capston.project.back.end.common.AllocationStatus.ALLOCATED)
                .mapToInt(CreditAllocation::getAllocatedCredits)
                .sum();

        Integer purchased = transactionRepository.sumPurchasedByUserIdAndCreditId(userId, creditId);
        Integer retired = transactionRepository.sumRetiredByUserIdAndCreditId(userId, creditId);

        return (specificAllocated != null ? specificAllocated : 0)
                + (purchased != null ? purchased : 0)
                - (retired != null ? retired : 0);
    }

    // ==================== READ METHODS ====================

    @Override
    public CarbonCreditResponse getCreditById(Integer id) {
        CarbonCredit credit = carbonCreditRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", id));
        return mapToResponse(credit);
    }

    @Override
    public CarbonCreditResponse getCreditByCode(String code) {
        CarbonCredit credit = carbonCreditRepository.findByCreditCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "code", code));
        return mapToResponse(credit);
    }

    @Override
    public CarbonCreditResponse updateCredit(Integer id, CarbonCreditRequest request) {
        CarbonCredit credit = carbonCreditRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", id));

        if (request.getCurrentPricePerCredit() != null)
            credit.setCurrentPricePerCredit(request.getCurrentPricePerCredit());
        if (request.getCreditStatus() != null)
            credit.setCreditStatus(request.getCreditStatus());

        return mapToResponse(carbonCreditRepository.save(credit));
    }

    @Override
    public void deleteCredit(Integer id) {
        if (!carbonCreditRepository.existsById(id))
            throw new ResourceNotFoundException("CarbonCredit", "id", id);
        carbonCreditRepository.deleteById(id);
    }

    @Override
    public Page<CarbonCreditResponse> getAllCredits(Pageable pageable) {
        return carbonCreditRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<CarbonCreditResponse> getCreditsByProjectId(Integer projectId, Pageable pageable) {
        return carbonCreditRepository.findByProjectId(projectId, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<CarbonCreditResponse> getCreditsByStatus(CreditStatus status, Pageable pageable) {
        return carbonCreditRepository.findByCreditStatus(status, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<CarbonCreditResponse> getAvailableCredits(Pageable pageable) {
        return carbonCreditRepository.findAvailableCredits(pageable).map(this::mapToResponse);
    }

    @Override
    public List<CreditAllocationResponse> getAllocationsByCreditId(Integer creditId) {
        return allocationRepository.findByCreditId(creditId).stream()
                .map(this::mapToAllocationResponse).collect(Collectors.toList());
    }

    @Override
    public List<CreditAllocationResponse> getAllocationsByOwnerId(UUID ownerId) {
        return allocationRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToAllocationResponse).collect(Collectors.toList());
    }

    @Override
    public CreditAllocationResponse claimAllocation(Integer allocationId, UUID claimedBy) {
        CreditAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("CreditAllocation", "id", allocationId));
        allocation.setAllocationStatus(AllocationStatus.CLAIMED);
        allocation.setClaimedAt(OffsetDateTime.now());
        return mapToAllocationResponse(allocationRepository.save(allocation));
    }

    @Override
    public List<CreditTransactionResponse> getTransactionsByCreditId(Integer creditId) {
        return transactionRepository.findByCreditId(creditId).stream()
                .map(this::mapToTransactionResponse).collect(Collectors.toList());
    }

    @Override
    public List<CreditTransactionResponse> getTransactionsByBuyerId(UUID buyerId) {
        return transactionRepository.findByBuyerId(buyerId).stream()
                .map(this::mapToTransactionResponse).collect(Collectors.toList());
    }

    @Override
    public CreditSummaryResponse getCreditSummary() {
        return CreditSummaryResponse.builder()
                .totalCreditsIssued(carbonCreditRepository.sumCreditsIssued())
                .totalCreditsSold(carbonCreditRepository.sumCreditsSold())
                .totalCreditsRetired(carbonCreditRepository.sumCreditsRetired())
                .totalCreditsAvailable(carbonCreditRepository.sumCreditsAvailable())
                .totalRevenue(transactionRepository.sumTotalRevenue())
                .build();
    }

    @Override
    public CreditSummaryResponse getCreditSummaryByProjectId(Integer projectId) {
        return CreditSummaryResponse.builder()
                .totalCreditsIssued(carbonCreditRepository.sumCreditsIssuedByProjectId(projectId))
                .totalCreditsSold(carbonCreditRepository.sumCreditsSoldByProjectId(projectId))
                .totalCreditsRetired(carbonCreditRepository.sumCreditsRetiredByProjectId(projectId))
                .totalCreditsAvailable(carbonCreditRepository.sumCreditsAvailableByProjectId(projectId))
                .totalRevenue(transactionRepository.sumRevenueByCreditId(projectId))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getMyCreditBalance(UUID userId) {
        Integer allocated = allocationRepository.sumAllocatedCreditsByOwnerId(userId);
        Integer purchased = transactionRepository.sumPurchasedByUserId(userId);
        Integer retired = transactionRepository.sumRetiredByUserId(userId);

        return (allocated != null ? allocated : 0)
                + (purchased != null ? purchased : 0)
                - (retired != null ? retired : 0);
    }

    // ==================== MAPPING ====================

    private CarbonCreditResponse mapToResponse(CarbonCredit credit) {
        CarbonCreditResponse response = modelMapper.map(credit, CarbonCreditResponse.class);
        projectRepository.findById(credit.getProjectId()).ifPresent(p -> response.setProjectName(p.getName()));

        if (credit.getOrigins() != null) {
            List<CarbonCreditResponse.TreeOriginResponse> originResponses = credit.getOrigins().stream()
                    .map(o -> {
                        Integer fId = (Integer) o.get("farmId");
                        Integer bId = (Integer) o.get("batchId");
                        Integer qty = (Integer) o.get("quantity");

                        CarbonCreditResponse.TreeOriginResponse tor = CarbonCreditResponse.TreeOriginResponse.builder()
                                .farmId(fId)
                                .batchId(bId)
                                .quantity(qty)
                                .build();

                        if (fId != null) {
                            farmRepository.findById(fId).ifPresent(f -> tor.setFarmName(f.getName()));
                        }
                        if (bId != null) {
                            treeBatchRepository.findById(bId).ifPresent(b -> tor.setBatchCode(b.getBatchCode()));
                        }
                        return tor;
                    }).collect(Collectors.toList());
            response.setOrigins(originResponses);
        }
        return response;
    }

    private CreditAllocationResponse mapToAllocationResponse(CreditAllocation allocation) {
        CreditAllocationResponse response = modelMapper.map(allocation, CreditAllocationResponse.class);
        carbonCreditRepository.findById(allocation.getCreditId()).ifPresent(c -> {
            response.setCreditCode(c.getCreditCode());
            projectRepository.findById(c.getProjectId()).ifPresent(p -> {
                response.setProjectId(p.getId());
                response.setProjectName(p.getName());
            });
        });
        return response;
    }

    private CreditTransactionResponse mapToTransactionResponse(CreditTransaction txn) {
        CreditTransactionResponse response = modelMapper.map(txn, CreditTransactionResponse.class);
        carbonCreditRepository.findById(txn.getCreditId()).ifPresent(c -> {
            response.setCreditCode(c.getCreditCode());
            projectRepository.findById(c.getProjectId()).ifPresent(p -> {
                response.setProjectId(p.getId());
                response.setProjectName(p.getName());
            });

            // If transaction has specific purchase details (for aggregated purchases)
            // For now, we reuse the credit's origins proportional to quantity
            if (c.getOrigins() != null) {
                List<CarbonCreditResponse.TreeOriginResponse> originResponses = c.getOrigins().stream()
                        .map(o -> {
                            Integer fId = (Integer) o.get("farmId");
                            Integer bId = (Integer) o.get("batchId");
                            Integer qtyInIssuance = (Integer) o.get("quantity");

                            // Proportional quantity for this transaction
                            double ratio = (double) txn.getQuantity() / c.getCreditsIssued();
                            int txnQty = (int) Math.round(qtyInIssuance * ratio);

                            CarbonCreditResponse.TreeOriginResponse tor = CarbonCreditResponse.TreeOriginResponse
                                    .builder()
                                    .farmId(fId)
                                    .batchId(bId)
                                    .quantity(txnQty)
                                    .build();

                            if (fId != null) {
                                farmRepository.findById(fId).ifPresent(f -> tor.setFarmName(f.getName()));
                            }
                            if (bId != null) {
                                treeBatchRepository.findById(bId).ifPresent(b -> tor.setBatchCode(b.getBatchCode()));
                            }
                            return tor;
                        }).collect(Collectors.toList());
                response.setOrigins(originResponses);
            }
        });
        return response;
    }

    private String generateCreditCode(String projectCode) {
        return "CC-" + projectCode + "-" + java.time.Year.now().getValue() + "-" + System.currentTimeMillis() % 1000;
    }
}
