package com.capston.project.back.end.service;

import com.capston.project.back.end.common.PurchaseStatus;
import com.capston.project.back.end.request.CarbonAllocationRequest;
import com.capston.project.back.end.request.TreePurchaseRequest;
import com.capston.project.back.end.response.CarbonSummaryResponse;
import com.capston.project.back.end.response.TreePurchaseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TreePurchaseService {
	// Purchase Operations
	TreePurchaseResponse createPurchase(TreePurchaseRequest request, UUID managerId);

	TreePurchaseResponse approvePurchase(Integer purchaseId, UUID approvedBy);

	TreePurchaseResponse deliverPurchase(Integer purchaseId);

	TreePurchaseResponse cancelPurchase(Integer purchaseId, String reason);

	TreePurchaseResponse getPurchaseById(Integer purchaseId);

	// List Purchases
	List<TreePurchaseResponse> getPurchasesByPhaseId(Integer phaseId);

	List<TreePurchaseResponse> getPurchasesByProjectId(Integer projectId);

	Page<TreePurchaseResponse> getPurchasesByStatus(PurchaseStatus status, Pageable pageable);

	// Carbon Summary
	CarbonSummaryResponse getCarbonSummaryByPhaseId(Integer phaseId);

	// Carbon Reserve & Allocation
	void transferSurplusToReserve(Integer phaseId, UUID userId);

	void allocateCarbonFromReserve(CarbonAllocationRequest request, UUID userId);

	// Auto-calculate
	void recalculatePhaseCarbon(Integer phaseId);

	void recalculateProjectCarbon(Integer projectId);
}
