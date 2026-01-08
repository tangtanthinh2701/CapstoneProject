package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.AllocationStatus;
import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.common.TransactionStatus;
import com.capston.project.back.end.entity.CarbonCredit;
import com.capston.project.back.end.entity.CarbonCreditAllocation;
import com.capston.project.back.end.entity.CreditTransaction;
import com.capston.project.back.end.entity.OxiOwnership;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.CarbonCreditAllocationRepository;
import com.capston.project.back.end.repository.CarbonCreditRepository;
import com.capston.project.back.end.repository.CreditTransactionRepository;
import com.capston.project.back.end.repository.OxiOwnershipRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.request.CarbonCreditRequest;
import com.capston.project.back.end.request.CreditPurchaseRequest;
import com.capston.project.back.end.request.CreditRetireRequest;
import com.capston.project.back.end.response.CarbonCreditResponse;
import com.capston.project.back.end.response.CreditAllocationResponse;
import com.capston.project.back.end.response.CreditSummaryResponse;
import com.capston.project.back.end.response.CreditTransactionResponse;
import com.capston.project.back.end.service.CarbonCreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CarbonCreditServiceImpl implements CarbonCreditService {

	private final CarbonCreditRepository creditRepository;
	private final CarbonCreditAllocationRepository allocationRepository;
	private final CreditTransactionRepository transactionRepository;
	private final ProjectRepository projectRepository;
	private final OxiOwnershipRepository ownershipRepository;

	// ==================== CARBON CREDIT CRUD ====================

	@Override
	@Transactional
	public CarbonCreditResponse createCredit(CarbonCreditRequest request) {
		log.info("Creating carbon credit for project: {}, year: {}", request.getProjectId(), request.getReportYear());

		Project project = projectRepository.findById(request.getProjectId())
		                                   .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

		String creditCode = generateCreditCode(request.getReportYear());

		CarbonCredit credit = CarbonCredit.builder()
		                                  .creditCode(creditCode)
		                                  .project(project)
		                                  .reportYear(request.getReportYear())
		                                  .totalCo2Tons(request.getTotalCo2Tons())
		                                  .creditsIssued(request.getCreditsIssued())
		                                  .creditsSold(0)
		                                  .creditsRetired(0)
		                                  .creditsAvailable(request.getCreditsIssued())
		                                  .pricePerCredit(request.getPricePerCredit())
		                                  .creditsStatus(CreditStatus.PENDING)
		                                  .verificationStandard(request.getVerificationStandard())
		                                  .certificateUrl(request.getCertificateUrl())
		                                  .issuedBy(request.getIssuedBy())
		                                  .expiresAt(request.getExpiresAt())
		                                  .build();

		CarbonCredit saved = creditRepository.save(credit);
		log.info("Created carbon credit with code: {}", saved.getCreditCode());

		return mapToCreditResponse(saved);
	}

	@Override
	public CarbonCreditResponse getCreditById(Integer id) {
		CarbonCredit credit = creditRepository.findByIdWithDetails(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", id));
		return mapToCreditResponseWithDetails(credit);
	}

	@Override
	public CarbonCreditResponse getCreditByCode(String code) {
		CarbonCredit credit = creditRepository.findByCreditCode(code)
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "code", code));
		return mapToCreditResponse(credit);
	}

	@Override
	@Transactional
	public CarbonCreditResponse updateCredit(Integer id, CarbonCreditRequest request) {
		log.info("Updating carbon credit: {}", id);

		CarbonCredit credit = creditRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", id));

		// Only allow update if PENDING
		if (credit.getCreditsStatus() != CreditStatus.PENDING) {
			throw new IllegalStateException("Can only update PENDING credits");
		}

		if (request.getTotalCo2Tons() != null) {
			credit.setTotalCo2Tons(request.getTotalCo2Tons());
		}
		if (request.getCreditsIssued() != null) {
			credit.setCreditsIssued(request.getCreditsIssued());
			credit.setCreditsAvailable(request.getCreditsIssued());
		}
		if (request.getPricePerCredit() != null) {
			credit.setPricePerCredit(request.getPricePerCredit());
		}
		if (request.getVerificationStandard() != null) {
			credit.setVerificationStandard(request.getVerificationStandard());
		}
		if (request.getCertificateUrl() != null) {
			credit. setCertificateUrl(request. getCertificateUrl());
		}
		if (request.getExpiresAt() != null) {
			credit.setExpiresAt(request.getExpiresAt());
		}

		CarbonCredit saved = creditRepository.save(credit);
		return mapToCreditResponse(saved);
	}

	@Override
	@Transactional
	public void deleteCredit(Integer id) {
		log.info("Deleting carbon credit: {}", id);

		CarbonCredit credit = creditRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", id));

		// Only allow delete if PENDING or CANCELLED
		if (credit.getCreditsStatus() != CreditStatus.PENDING &&
		    credit.getCreditsStatus() != CreditStatus.CANCELLED) {
			throw new IllegalStateException("Can only delete PENDING or CANCELLED credits");
		}

		creditRepository.delete(credit);
		log.info("Deleted carbon credit:  {}", id);
	}

	// ==================== CARBON CREDIT LIST ====================

	@Override
	public Page<CarbonCreditResponse> getAllCredits(Pageable pageable) {
		Page<Integer> idsPage = creditRepository.findAllCreditIds(pageable);

		if (idsPage.isEmpty()) {
			return Page.empty(pageable);
		}

		List<CarbonCredit> credits = creditRepository.findAllWithProjectByIds(idsPage.getContent());

		Map<Integer, CarbonCredit> creditMap = credits.stream()
		                                              .collect(Collectors.toMap(CarbonCredit::getId, c -> c));

		List<CarbonCreditResponse> responses = idsPage.getContent()
		                                              .stream()
		                                              .map(creditMap::get)
		                                              .filter(Objects::nonNull)
		                                              .map(this::mapToCreditResponse)
		                                              .collect(Collectors.toList());

		return new PageImpl<>(responses, pageable, idsPage.getTotalElements());
	}

	@Override
	public Page<CarbonCreditResponse> getCreditsByStatus(CreditStatus status, Pageable pageable) {
		return creditRepository.findByCreditsStatus(status, pageable)
		                       .map(this::mapToCreditResponse);
	}

	@Override
	public List<CarbonCreditResponse> getCreditsByProjectId(Integer projectId) {
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}

		return creditRepository.findByProjectIdWithProject(projectId)
		                       .stream()
		                       .map(this::mapToCreditResponse)
		                       .collect(Collectors.toList());
	}

	@Override
	public List<CarbonCreditResponse> getAvailableCredits() {
		return creditRepository.findAvailableCreditsWithProject()
		                       .stream()
		                       .map(this::mapToCreditResponse)
		                       .collect(Collectors.toList());
	}

	@Override
	public Page<CarbonCreditResponse> searchCredits(String keyword, Pageable pageable) {
		return creditRepository.searchByKeyword(keyword, pageable)
		                       .map(this::mapToCreditResponse);
	}

	// ==================== CREDIT WORKFLOW ====================

	@Override
	@Transactional
	public CarbonCreditResponse verifyAndActivateCredit(Integer id, UUID verifiedBy) {
		log.info("Verifying and activating credit: {}", id);

		CarbonCredit credit = creditRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", id));

		if (credit.getCreditsStatus() != CreditStatus.PENDING) {
			throw new IllegalStateException("Can only activate PENDING credits");
		}

		credit.setCreditsStatus(CreditStatus.AVAILABLE);
		credit.setIssuedAt(OffsetDateTime.now());
		credit.setIssuedBy(verifiedBy);

		CarbonCredit saved = creditRepository.save(credit);
		log.info("Credit {} activated", id);

		return mapToCreditResponse(saved);
	}

	@Override
	@Transactional
	public CarbonCreditResponse cancelCredit(Integer id, String reason) {
		log.info("Cancelling credit: {}", id);

		CarbonCredit credit = creditRepository.findById(id)
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", id));

		if (credit.getCreditsSold() > 0 || credit.getCreditsRetired() > 0) {
			throw new IllegalStateException("Cannot cancel credit that has been sold or retired");
		}

		credit.setCreditsStatus(CreditStatus.CANCELLED);
		CarbonCredit saved = creditRepository.save(credit);

		log.info("Credit {} cancelled.  Reason: {}", id, reason);
		return mapToCreditResponse(saved);
	}

	// ==================== CREDIT ALLOCATION ====================

	@Override
	@Transactional
	public CreditAllocationResponse allocateCreditsToOwners(Integer creditId) {
		log.info("Allocating credits to owners for credit: {}", creditId);

		CarbonCredit credit = creditRepository.findByIdWithProject(creditId)
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", creditId));

		if (credit.getCreditsStatus() != CreditStatus.AVAILABLE &&
		    credit.getCreditsStatus() != CreditStatus.PARTIALLY_SOLD) {
			throw new IllegalStateException("Credits must be AVAILABLE or PARTIALLY_SOLD to allocate");
		}

		// Get active ownerships for this project
		List<OxiOwnership> ownerships = ownershipRepository.findActiveByProjectId(credit.getProjectId());

		if (ownerships.isEmpty()) {
			throw new IllegalStateException("No active ownerships found for this project");
		}

		List<CarbonCreditAllocation> allocations = new ArrayList<>();

		for (OxiOwnership ownership :  ownerships) {
			// Check if already allocated
			if (allocationRepository.existsByCarbonCreditIdAndOwnershipId(creditId, ownership.getId())) {
				continue;
			}

			// Calculate allocated credits based on ownership percentage
			BigDecimal percentage = ownership.getCarbonCreditPercentage();
			int allocatedCredits = percentage.multiply(BigDecimal.valueOf(credit.getCreditsIssued()))
			                                 .divide(new BigDecimal("100"), 0, RoundingMode.FLOOR)
			                                 .intValue();

			if (allocatedCredits > 0) {
				CarbonCreditAllocation allocation = CarbonCreditAllocation.builder()
				                                                          .carbonCredit(credit)
				                                                          .ownership(ownership)
				                                                          .allocatedCredits(allocatedCredits)
				                                                          .percentage(percentage)
				                                                          . ownerId(ownership.getOwnerId())
				                                                          .status(AllocationStatus.ALLOCATED)
				                                                          .build();

				allocations.add(allocationRepository.save(allocation));
				log.info("Allocated {} credits to owner {} for ownership {}",
				         allocatedCredits, ownership.getOwnerId(), ownership.getId());
			}
		}

		if (allocations.isEmpty()) {
			throw new IllegalStateException("No new allocations were created");
		}

		// Return first allocation as response (or could return list)
		return mapToAllocationResponse(allocations.get(0));
	}

	@Override
	public List<CreditAllocationResponse> getAllocationsByCreditId(Integer creditId) {
		return allocationRepository.findByCreditIdWithDetails(creditId).stream()
		                           .map(this::mapToAllocationResponse)
		                           .collect(Collectors.toList());
	}

	@Override
	public List<CreditAllocationResponse> getAllocationsByOwnerId(UUID ownerId) {
		return allocationRepository.findByOwnerIdWithDetails(ownerId).stream()
		                           .map(this::mapToAllocationResponse)
		                           .collect(Collectors. toList());
	}

	@Override
	@Transactional
	public CreditAllocationResponse claimAllocation(Integer allocationId) {
		log.info("Claiming allocation: {}", allocationId);

		CarbonCreditAllocation allocation = allocationRepository.findById(allocationId)
		                                                        .orElseThrow(() -> new ResourceNotFoundException("CarbonCreditAllocation", "id", allocationId));

		if (allocation.getStatus() != AllocationStatus.ALLOCATED) {
			throw new IllegalStateException("Allocation has already been claimed or processed");
		}

		allocation. setStatus(AllocationStatus. CLAIMED);
		allocation.setClaimedAt(OffsetDateTime.now());

		CarbonCreditAllocation saved = allocationRepository.save(allocation);
		log.info("Allocation {} claimed", allocationId);

		return mapToAllocationResponse(saved);
	}

	// ==================== CREDIT TRANSACTION ====================

	@Override
	@Transactional
	public CreditTransactionResponse purchaseCredits(CreditPurchaseRequest request) {
		log.info("Purchasing {} credits from credit {} by enterprise {}",
		         request.getQuantity(), request.getCreditId(), request.getEnterpriseId());

		CarbonCredit credit = creditRepository.findByIdWithProject(request.getCreditId())
		                                      .orElseThrow(() -> new ResourceNotFoundException("CarbonCredit", "id", request.getCreditId()));

		// Validate
		if (! credit.canSell(request.getQuantity())) {
			throw new IllegalStateException("Not enough credits available.  Available: " + credit.getCreditsAvailable());
		}

		BigDecimal unitPrice = request.getUnitPrice() != null ?
		                       request.getUnitPrice() :
		                       credit.getPricePerCredit();

		if (unitPrice == null) {
			throw new IllegalArgumentException("Unit price is required");
		}

		BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

		String transactionCode = generateTransactionCode();

		CreditTransaction transaction = CreditTransaction.builder()
		                                                 .transactionCode(transactionCode)
		                                                 .carbonCredit(credit)
		                                                 .enterpriseId(request.getEnterpriseId())
		                                                 .quantity(request.getQuantity())
		                                                 .unitPrice(unitPrice)
		                                                 .totalAmount(totalAmount)
		                                                 .transactionStatus(TransactionStatus.PURCHASED)
		                                                 .purchasedAt(OffsetDateTime.now())
		                                                 .build();

		// Update credit
		credit.sellCredits(request.getQuantity());
		creditRepository.save(credit);

		CreditTransaction saved = transactionRepository.save(transaction);
		log.info("Created transaction {} for {} credits, total: {}",
		         transactionCode, request.getQuantity(), totalAmount);

		return mapToTransactionResponse(saved);
	}

	@Override
	@Transactional
	public CreditTransactionResponse retireCredits(CreditRetireRequest request) {
		log.info("Retiring credits for transaction: {}", request.getTransactionId());

		CreditTransaction transaction = transactionRepository.findByIdWithDetails(request.getTransactionId())
		                                                     .orElseThrow(() -> new ResourceNotFoundException("CreditTransaction", "id", request.getTransactionId()));

		if (transaction.getTransactionStatus() != TransactionStatus.PURCHASED) {
			throw new IllegalStateException("Can only retire PURCHASED credits");
		}

		transaction.setTransactionStatus(TransactionStatus.RETIRED);
		transaction.setRetirementReason(request.getRetirementReason());
		transaction.setRetiredAt(OffsetDateTime.now());

		if (request.getCertificateUrl() != null) {
			transaction.setCertificateUrl(request.getCertificateUrl());
		}

		// Update credit stats
		CarbonCredit credit = transaction.getCarbonCredit();
		credit.setCreditsRetired(credit.getCreditsRetired() + transaction.getQuantity());
		credit.setCreditsSold(credit.getCreditsSold() - transaction.getQuantity());
		creditRepository.save(credit);

		CreditTransaction saved = transactionRepository.save(transaction);
		log.info("Transaction {} retired.  Reason: {}", request.getTransactionId(), request.getRetirementReason());

		return mapToTransactionResponse(saved);
	}

	@Override
	public CreditTransactionResponse getTransactionById(Integer id) {
		CreditTransaction transaction = transactionRepository.findByIdWithDetails(id)
		                                                     .orElseThrow(() -> new
				                                                     ResourceNotFoundException("CreditTransaction", "id", id));
		return mapToTransactionResponse(transaction);
	}

	@Override
	public List<CreditTransactionResponse> getTransactionsByCreditId(Integer creditId) {
		return transactionRepository.findByCreditIdWithDetails(creditId)
		                            .stream()
		                            .map(this::mapToTransactionResponse)
		                            .collect(Collectors.toList());
	}

	@Override
	public List<CreditTransactionResponse> getTransactionsByEnterpriseId(UUID enterpriseId) {
		return transactionRepository.findByEnterpriseIdWithDetails(enterpriseId)
		                            .stream()
		                            .map(this::mapToTransactionResponse)
		                            .collect(Collectors.toList());
	}

	@Override
	public Page<CreditTransactionResponse> getTransactionsByStatus(TransactionStatus status, Pageable pageable) {
		return transactionRepository.findByTransactionStatus(status, pageable)
		                            .map(this::mapToTransactionResponse);
	}

	// ==================== STATISTICS ====================

	@Override
	public CreditSummaryResponse getCreditSummary() {
		return CreditSummaryResponse.builder()
		                            .totalCreditRecords(creditRepository.count())
		                            .availableCreditRecords(creditRepository.countByCreditsStatus(CreditStatus.AVAILABLE) +
		                                                    creditRepository.countByCreditsStatus(CreditStatus.PARTIALLY_SOLD))
		                            .soldOutCreditRecords(creditRepository.countByCreditsStatus(CreditStatus.SOLD_OUT))
		                            .totalCreditsIssued(creditRepository.sumTotalCreditsIssued())
		                            .totalCreditsSold(creditRepository.sumTotalCreditsSold())
		                            .totalCreditsRetired(creditRepository.sumTotalCreditsRetired())
		                            .totalCreditsAvailable(creditRepository.sumTotalCreditsAvailable())
		                            .totalCo2Tons(creditRepository.sumTotalCo2Tons())
		                            .totalRevenue(transactionRepository.sumTotalRevenue())
		                            .averagePricePerCredit(transactionRepository.avgPricePerCredit())
		                            .totalTransactions(transactionRepository.count())
		                            .purchasedTransactions(transactionRepository.countByTransactionStatus(TransactionStatus.PURCHASED))
		                            .retiredTransactions(transactionRepository.countByTransactionStatus(TransactionStatus.RETIRED))
		                            .build();
	}

	@Override
	public CreditSummaryResponse getCreditSummaryByProject(Integer projectId) {
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}

		List<CarbonCredit> credits = creditRepository.findByProjectId(projectId);

		long totalIssued = credits.stream().mapToLong(CarbonCredit::getCreditsIssued).sum();
		long totalSold = credits.stream().mapToLong(CarbonCredit::getCreditsSold).sum();
		long totalRetired = credits.stream().mapToLong(CarbonCredit::getCreditsRetired).sum();
		long totalAvailable = credits.stream().mapToLong(CarbonCredit::getCreditsAvailable).sum();

		BigDecimal totalCo2 = creditRepository.sumCo2TonsByProjectId(projectId);

		BigDecimal totalRevenue = credits.stream()
		                                 .map(c -> transactionRepository.sumRevenueByCreditId(c.getId()))
		                                 .reduce(BigDecimal. ZERO, BigDecimal::add);

		return CreditSummaryResponse.builder()
		                            .totalCreditRecords((long) credits.size())
		                            .totalCreditsIssued(totalIssued)
		                            .totalCreditsSold(totalSold)
		                            .totalCreditsRetired(totalRetired)
		                            .totalCreditsAvailable(totalAvailable)
		                            .totalCo2Tons(totalCo2)
		                            .totalRevenue(totalRevenue)
		                            .build();
	}

	// ==================== SCHEDULED TASKS ====================

	@Override
	@Transactional
	public void checkAndUpdateExpiredCredits() {
		log.info("Checking for expired credits.. .");

		List<CarbonCredit> expired = creditRepository.findExpired(OffsetDateTime.now());

		for (CarbonCredit credit :  expired) {
			credit.setCreditsStatus(CreditStatus.EXPIRED);
			creditRepository.save(credit);
			log.info("Credit {} marked as EXPIRED", credit.getCreditCode());
		}

		log.info("Found {} expired credits", expired.size());
	}

	// ==================== HELPER METHODS ====================

	private String generateCreditCode(Integer year) {
		String prefix = "CC-" + year + "-";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(7);
		String code = prefix + timestamp;

		while (creditRepository.existsByCreditCode(code)) {
			try {
				Thread.sleep(1);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
			timestamp = String.valueOf(System.currentTimeMillis()).substring(7);
			code = prefix + timestamp;
		}
		return code;
	}

	private String generateTransactionCode() {
		String prefix = "TXN-";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(5);
		String code = prefix + timestamp;

		while (transactionRepository.existsByTransactionCode(code)) {
			try {
				Thread.sleep(1);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
			timestamp = String.valueOf(System. currentTimeMillis()).substring(5);
			code = prefix + timestamp;
		}
		return code;
	}

	private CarbonCreditResponse mapToCreditResponse(CarbonCredit credit) {
		return CarbonCreditResponse.builder()
		                           .id(credit.getId())
		                           .creditCode(credit.getCreditCode())
		                           .projectId(credit.getProject() != null ? credit.getProject().getId() : null)
		                           .projectName(credit.getProject() != null ? credit.getProject().getName() : null)
		                           .projectCode(credit.getProject() != null ? credit.getProject().getCode() : null)
		                           .reportYear(credit.getReportYear())
		                           .totalCo2Tons(credit.getTotalCo2Tons())
		                           .creditsIssued(credit.getCreditsIssued())
		                           .creditsSold(credit.getCreditsSold())
		                           .creditsRetired(credit.getCreditsRetired())
		                           .creditsAvailable(credit.getCreditsAvailable())
		                           .pricePerCredit(credit.getPricePerCredit())
		                           .creditsStatus(credit.getCreditsStatus())
		                           .hasAvailableCredits(credit.hasAvailableCredits())
		                           .isExpired(credit.isExpired())
		                           .verificationStandard(credit.getVerificationStandard())
		                           .certificateUrl(credit.getCertificateUrl())
		                           .issuedBy(credit.getIssuedBy())
		                           .issuedAt(credit.getIssuedAt())
		                           .expiresAt(credit.getExpiresAt())
		                           .createdAt(credit.getCreatedAt())
		                           .updatedAt(credit.getUpdatedAt())
		                           .build();
	}

	private CarbonCreditResponse mapToCreditResponseWithDetails(CarbonCredit credit) {
		CarbonCreditResponse response = mapToCreditResponse(credit);

		// Add allocations
		if (credit.getAllocations() != null) {
			List<CreditAllocationResponse> allocations = credit.getAllocations()
			                                                   .stream()
			                                                   .map(this::mapToAllocationResponse)
			                                                   .collect(Collectors.toList());
			response.setAllocations(allocations);
		}

		// Add transaction stats
		List<CreditTransaction> transactions = transactionRepository.findByCarbonCreditId(credit.getId());
		response.setTotalTransactions(transactions.size());

		BigDecimal totalRevenue = transactions.stream()
		                                      .filter(t -> t.getTransactionStatus() == TransactionStatus. PURCHASED)
		                                      .map(CreditTransaction::getTotalAmount)
		                                      .reduce(BigDecimal.ZERO, BigDecimal::add);
		response.setTotalRevenue(totalRevenue);

		return response;
	}

	private CreditAllocationResponse mapToAllocationResponse(CarbonCreditAllocation allocation) {
		return CreditAllocationResponse.builder()
		                               .id(allocation.getId())
		                               .creditId(allocation.getCarbonCredit() != null ? allocation.getCarbonCredit().getId() : null)
		                               .creditCode(allocation.getCarbonCredit() != null ?
		                                           allocation.getCarbonCredit().getCreditCode() :
		                                           null)
		                               .ownershipId(allocation.getOwnershipId())
		                               .projectId(allocation.getOwnership() != null && allocation.getOwnership().getProject() != null ?
		                                          allocation.getOwnership().getProject().getId() :
		                                          null)
		                               .projectName(allocation.getOwnership() != null && allocation.getOwnership().getProject() != null ?
		                                            allocation.getOwnership().getProject().getName() :
		                                            null)
		                               .allocatedCredits(allocation.getAllocatedCredits())
		                               .percentage(allocation.getPercentage())
		                               .ownerId(allocation.getOwnerId())
		                               .status(allocation.getStatus())
		                               .claimedAt(allocation.getClaimedAt())
		                               .notes(allocation.getNotes())
		                               .createdAt(allocation.getCreatedAt())
		                               .build();
	}

	private CreditTransactionResponse mapToTransactionResponse(CreditTransaction transaction) {
		return CreditTransactionResponse.builder()
		                                .id(transaction.getId())
		                                .transactionCode(transaction.getTransactionCode())
		                                .creditId(transaction.getCarbonCredit() != null ?
		                                          transaction.getCarbonCredit().getId() :
		                                          null)
		                                .creditCode(transaction.getCarbonCredit() != null ?
		                                            transaction.getCarbonCredit().getCreditCode() :
		                                            null)
		                                .projectId(transaction.getCarbonCredit() != null &&
		                                           transaction.getCarbonCredit().getProject() != null ?
		                                           transaction.getCarbonCredit().getProject().getId() :
		                                           null)
		                                .projectName(transaction.getCarbonCredit() != null &&
		                                             transaction.getCarbonCredit().getProject() != null ?
		                                             transaction.getCarbonCredit().getProject().getName() :
		                                             null)
		                                .enterpriseId(transaction.getEnterpriseId())
		                                .quantity(transaction.getQuantity())
		                                .unitPrice(transaction.getUnitPrice())
		                                .totalAmount(transaction.getTotalAmount())
		                                .transactionStatus(transaction.getTransactionStatus())
		                                .certificateUrl(transaction.getCertificateUrl())
		                                .retirementReason(transaction.getRetirementReason())
		                                .purchasedAt(transaction.getPurchasedAt())
		                                .retiredAt(transaction.getRetiredAt())
		                                .createdAt(transaction.getCreatedAt())
		                                .build();
	}
}
