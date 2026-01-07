package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.PurchaseStatus;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.CarbonAllocationRequest;
import com.capston.project.back.end.request.TreePurchaseRequest;
import com.capston.project.back.end.response.CarbonSummaryResponse;
import com.capston.project.back.end.response.TreePurchaseResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.TreePurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tree-purchases")
@RequiredArgsConstructor
public class TreePurchaseController {

	private final TreePurchaseService treePurchaseService;
	private final UserRepository userRepository;

	// ==================== PURCHASE OPERATIONS ====================

	@PostMapping
	public ResponseEntity<ApiResponse<TreePurchaseResponse>> createPurchase(@Valid @RequestBody TreePurchaseRequest request, Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID managerId = user.getId();
		TreePurchaseResponse response = treePurchaseService.createPurchase(request, managerId);
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(ApiResponse. success("Purchase created successfully", response));
	}

	@GetMapping("/{purchaseId}")
	public ResponseEntity<ApiResponse<TreePurchaseResponse>> getPurchaseById(@PathVariable Integer purchaseId) {
		TreePurchaseResponse response = treePurchaseService.getPurchaseById(purchaseId);
		return ResponseEntity.ok(ApiResponse. success(response));
	}

	@PostMapping("/{purchaseId}/approve")
	public ResponseEntity<ApiResponse<TreePurchaseResponse>> approvePurchase(@PathVariable Integer purchaseId, @RequestParam UUID approvedBy) {
		TreePurchaseResponse response = treePurchaseService.approvePurchase(purchaseId, approvedBy);
		return ResponseEntity.ok(ApiResponse.success("Purchase approved successfully", response));
	}

	@PostMapping("/{purchaseId}/deliver")
	public ResponseEntity<ApiResponse<TreePurchaseResponse>> deliverPurchase(@PathVariable Integer purchaseId) {
		TreePurchaseResponse response = treePurchaseService.deliverPurchase(purchaseId);
		return ResponseEntity. ok(ApiResponse.success("Purchase delivered successfully", response));
	}

	@PostMapping("/{purchaseId}/cancel")
	public ResponseEntity<ApiResponse<TreePurchaseResponse>> cancelPurchase(@PathVariable Integer purchaseId, @RequestParam String reason) {
		TreePurchaseResponse response = treePurchaseService.cancelPurchase(purchaseId, reason);
		return ResponseEntity.ok(ApiResponse.success("Purchase cancelled successfully", response));
	}

	// ==================== LIST PURCHASES ====================

	@GetMapping("/phase/{phaseId}")
	public ResponseEntity<ApiResponse<List<TreePurchaseResponse>>> getPurchasesByPhaseId(@PathVariable Integer phaseId) {
		List<TreePurchaseResponse> purchases = treePurchaseService.getPurchasesByPhaseId(phaseId);
		return ResponseEntity.ok(ApiResponse.success(purchases));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<TreePurchaseResponse>>> getPurchasesByProjectId(@PathVariable Integer projectId) {
		List<TreePurchaseResponse> purchases = treePurchaseService.getPurchasesByProjectId(projectId);
		return ResponseEntity. ok(ApiResponse.success(purchases));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<TreePurchaseResponse>>> getPurchasesByStatus(@PathVariable PurchaseStatus status,
	                                                                                    @RequestParam(defaultValue = "0") int page,
	                                                                                    @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<TreePurchaseResponse> purchasePage = treePurchaseService.getPurchasesByStatus(status, pageable);

		return ResponseEntity. ok(ApiResponse.success("Purchases retrieved successfully", purchasePage.getContent(), buildPageInfo(purchasePage)));
	}

	// ==================== CARBON SUMMARY ====================

	@GetMapping("/phase/{phaseId}/carbon-summary")
	public ResponseEntity<ApiResponse<CarbonSummaryResponse>> getCarbonSummary(@PathVariable Integer phaseId) {
		CarbonSummaryResponse summary = treePurchaseService.getCarbonSummaryByPhaseId(phaseId);
		return ResponseEntity.ok(ApiResponse.success("Carbon summary retrieved", summary));
	}

	// ==================== CARBON RESERVE & ALLOCATION ====================

	@PostMapping("/phase/{phaseId}/transfer-surplus")
	public ResponseEntity<ApiResponse<Void>> transferSurplusToReserve(@PathVariable Integer phaseId, @RequestParam UUID userId) {
		treePurchaseService.transferSurplusToReserve(phaseId, userId);
		return ResponseEntity.ok(ApiResponse.success("Surplus carbon transferred to reserve", null));
	}

	@PostMapping("/allocate-carbon")
	public ResponseEntity<ApiResponse<Void>> allocateCarbonFromReserve(@Valid @RequestBody CarbonAllocationRequest request, Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID allocatorId = user.getId();
		treePurchaseService.allocateCarbonFromReserve(request, allocatorId);
		return ResponseEntity.ok(ApiResponse.success("Carbon allocated from reserve", null));
	}

	// ==================== RECALCULATE ====================

	@PostMapping("/phase/{phaseId}/recalculate")
	public ResponseEntity<ApiResponse<CarbonSummaryResponse>> recalculatePhaseCarbon(@PathVariable Integer phaseId) {
		treePurchaseService.recalculatePhaseCarbon(phaseId);
		CarbonSummaryResponse summary = treePurchaseService.getCarbonSummaryByPhaseId(phaseId);
		return ResponseEntity.ok(ApiResponse.success("Phase carbon recalculated", summary));
	}

	@PostMapping("/project/{projectId}/recalculate")
	public ResponseEntity<ApiResponse<Void>> recalculateProjectCarbon(@PathVariable Integer projectId) {
		treePurchaseService.recalculateProjectCarbon(projectId);
		return ResponseEntity.ok(ApiResponse.success("Project carbon recalculated", null));
	}

	private ApiResponse.PageInfo buildPageInfo(Page<?> page) {
		return ApiResponse.PageInfo.builder()
		                           .page(page.getNumber())
		                           .size(page.getSize())
		                           .totalElements(page.getTotalElements())
		                           .totalPages(page.getTotalPages())
		                           .hasNext(page.hasNext())
		                           .hasPrevious(page.hasPrevious())
		                           .build();
	}
}
