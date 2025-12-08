package com.capston.project.back.end.service;

import com.capston.project.back.end.request.CarbonCreditRequest;
import com.capston.project.back.end.request.CreditTransactionRequest;
import com.capston.project.back.end.response.CarbonCreditResponse;
import com.capston.project.back.end.response.CreditTransactionResponse;
import com.capston.project.back.end.response.generic.PageResponse;

import java.util.UUID;

public interface CarbonCreditService {
	CarbonCreditResponse issueCarbonCredit(CarbonCreditRequest request, UUID issuerId);
	CreditTransactionResponse purchaseCredits(CreditTransactionRequest request, UUID enterpriseId);
	CreditTransactionResponse retireCredits(Integer transactionId, String retirementReason, UUID enterpriseId);
	PageResponse<CarbonCreditResponse> getAvailableCredits(int page, int size);
	PageResponse<CarbonCreditResponse> getCreditsByProject(Integer projectId, int page, int size);
	PageResponse<CreditTransactionResponse> getTransactionsByEnterprise(UUID enterpriseId, int page, int size);

}
