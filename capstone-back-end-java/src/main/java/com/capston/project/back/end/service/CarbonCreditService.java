package com.capston.project.back.end.service;

import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.common.TransactionStatus;
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
	Page<CarbonCreditResponse> getCreditsByStatus(CreditStatus status, Pageable pageable);
	List<CarbonCreditResponse> getCreditsByProjectId(Integer projectId);
	List<CarbonCreditResponse> getAvailableCredits();
	Page<CarbonCreditResponse> searchCredits(String keyword, Pageable pageable);

	// Credit Workflow
	CarbonCreditResponse verifyAndActivateCredit(Integer id, UUID verifiedBy);
	CarbonCreditResponse cancelCredit(Integer id, String reason);

	// Credit Allocation
	CreditAllocationResponse allocateCreditsToOwners(Integer creditId);
	List<CreditAllocationResponse> getAllocationsByCreditId(Integer creditId);
	List<CreditAllocationResponse> getAllocationsByOwnerId(UUID ownerId);
	CreditAllocationResponse claimAllocation(Integer allocationId);

	// Credit Transaction (Purchase)
	CreditTransactionResponse purchaseCredits(CreditPurchaseRequest request);
	CreditTransactionResponse retireCredits(CreditRetireRequest request);
	CreditTransactionResponse getTransactionById(Integer id);
	List<CreditTransactionResponse> getTransactionsByCreditId(Integer creditId);
	List<CreditTransactionResponse> getTransactionsByEnterpriseId(UUID enterpriseId);
	Page<CreditTransactionResponse> getTransactionsByStatus(TransactionStatus status, Pageable pageable);

	// Statistics
	CreditSummaryResponse getCreditSummary();
	CreditSummaryResponse getCreditSummaryByProject(Integer projectId);

	// Scheduled tasks
	void checkAndUpdateExpiredCredits();
}