package com.capston.project.back.end.service;

import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.request.CarbonCreditRequest;
import com.capston.project.back.end.request.CreditPurchaseRequest;
import com.capston.project.back.end.request.CreditRetireRequest;
import com.capston.project.back.end.response.CarbonCreditResponse;
import com.capston.project.back.end.response.CreditAllocationResponse;
import com.capston.project.back.end.response.CreditSummaryResponse;
import com.capston.project.back.end.response.CreditTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CarbonCreditService {
	// Carbon Credit CRUD
	CarbonCreditResponse createCredit(CarbonCreditRequest request);
	CarbonCreditResponse getCreditById(Integer id);
	CarbonCreditResponse getCreditByCode(String code);
	CarbonCreditResponse updateCredit(Integer id, CarbonCreditRequest request);
	void deleteCredit(Integer id);

	// Carbon Credit List
	Page<CarbonCreditResponse> getAllCredits(Pageable pageable);
	Page<CarbonCreditResponse> getCreditsByProjectId(Integer projectId, Pageable pageable);
	Page<CarbonCreditResponse> getCreditsByStatus(CreditStatus status, Pageable pageable);
	Page<CarbonCreditResponse> getAvailableCredits(Pageable pageable);

	// Credit Workflow
	CarbonCreditResponse verifyAndActivateCredit(Integer creditId, UUID verifiedBy);
	void allocateCreditsToOwners(Integer creditId, UUID allocatedBy);

	// Credit Allocation
	List<CreditAllocationResponse> getAllocationsByCreditId(Integer creditId);
	List<CreditAllocationResponse> getAllocationsByOwnerId(UUID ownerId);
	CreditAllocationResponse claimAllocation(Integer allocationId, UUID claimedBy);

	// Credit Transaction
	CreditTransactionResponse purchaseCredits(CreditPurchaseRequest request, UUID buyerId);
	CreditTransactionResponse retireCredits(CreditRetireRequest request, UUID retiredBy);
	List<CreditTransactionResponse> getTransactionsByCreditId(Integer creditId);
	List<CreditTransactionResponse> getTransactionsByBuyerId(UUID buyerId);

	// Statistics
	CreditSummaryResponse getCreditSummary();
	CreditSummaryResponse getCreditSummaryByProjectId(Integer projectId);
}