package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.CarbonCreditRequest;
import com.capston.project.back.end.request.CreditPurchaseRequest;
import com.capston.project.back.end.request.CreditRetireRequest;
import com.capston.project.back.end.response.CarbonCreditResponse;
import com.capston.project.back.end.response.CreditAllocationResponse;
import com.capston.project.back.end.response.CreditSummaryResponse;
import com.capston.project.back.end.response.CreditTransactionResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.CarbonCreditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/carbon-credits")
@RequiredArgsConstructor
public class CarbonCreditController {

	private final CarbonCreditService carbonCreditService;
	private final UserRepository userRepository;

	// ==================== CARBON CREDIT CRUD ====================

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> createCredit(
			@Valid @RequestBody CarbonCreditRequest request) {
		CarbonCreditResponse response = carbonCreditService.createCredit(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Carbon credit created successfully", response));
	}

	// ==================== CARBON CREDIT LIST ====================

	@GetMapping("/available")
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getAvailableCredits(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<CarbonCreditResponse> creditPage = carbonCreditService.getAvailableCredits(pageable);
		return ResponseEntity
				.ok(ApiResponse.success("Available credits", creditPage.getContent(), buildPageInfo(creditPage)));
	}

	@GetMapping("/summary")
	public ResponseEntity<ApiResponse<CreditSummaryResponse>> getCreditSummary() {
		CreditSummaryResponse summary = carbonCreditService.getCreditSummary();
		return ResponseEntity.ok(ApiResponse.success("Credit summary retrieved", summary));
	}

	@GetMapping("/summary/project/{projectId}")
	public ResponseEntity<ApiResponse<CreditSummaryResponse>> getCreditSummaryByProject(
			@PathVariable Integer projectId) {
		CreditSummaryResponse summary = carbonCreditService.getCreditSummaryByProjectId(projectId);
		return ResponseEntity.ok(ApiResponse.success("Project credit summary retrieved", summary));
	}

	@GetMapping("/code/{code}")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> getCreditByCode(@PathVariable String code) {
		CarbonCreditResponse response = carbonCreditService.getCreditByCode(code);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getCreditsByStatus(@PathVariable CreditStatus status,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<CarbonCreditResponse> creditPage = carbonCreditService.getCreditsByStatus(status, pageable);

		return ResponseEntity.ok(ApiResponse.success("Credits retrieved successfully",
				creditPage.getContent(),
				buildPageInfo(creditPage)));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getCreditsByProjectId(
			@PathVariable Integer projectId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<CarbonCreditResponse> creditPage = carbonCreditService.getCreditsByProjectId(projectId, pageable);
		return ResponseEntity.ok(ApiResponse.success(creditPage.getContent()));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> getCreditById(@PathVariable Integer id) {
		CarbonCreditResponse response = carbonCreditService.getCreditById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> updateCredit(@PathVariable Integer id,
			@Valid @RequestBody CarbonCreditRequest request) {
		CarbonCreditResponse response = carbonCreditService.updateCredit(id, request);
		return ResponseEntity.ok(ApiResponse.success("Carbon credit updated successfully", response));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<Void>> deleteCredit(@PathVariable Integer id) {
		carbonCreditService.deleteCredit(id);
		return ResponseEntity.ok(ApiResponse.success("Carbon credit deleted successfully", null));
	}

	// ==================== CARBON CREDIT LIST ====================

	@GetMapping
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getAllCredits(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "createdAt") String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir) {
		Sort sort = sortDir.equalsIgnoreCase("asc")
				? Sort.by(sortBy).ascending()
				: Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<CarbonCreditResponse> creditPage = carbonCreditService.getAllCredits(pageable);

		return ResponseEntity.ok(ApiResponse.success("Carbon credits retrieved successfully",
				creditPage.getContent(),
				buildPageInfo(creditPage)));
	}

	// ==================== CREDIT WORKFLOW ====================

	@PostMapping("/{id}/verify")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> verifyAndActivateCredit(@PathVariable Integer id,
			Authentication authentication) {
		UUID verifiedBy = getUserIdFromAuth(authentication);
		CarbonCreditResponse response = carbonCreditService.verifyAndActivateCredit(id, verifiedBy);
		return ResponseEntity.ok(ApiResponse.success("Credit verified and activated", response));
	}

	// ==================== CREDIT ALLOCATION ====================

	@PostMapping("/{creditId}/allocate")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<Void>> allocateCreditsToOwners(@PathVariable Integer creditId,
			Authentication authentication) {
		UUID allocatedBy = getUserIdFromAuth(authentication);
		carbonCreditService.allocateCreditsToOwners(creditId, allocatedBy);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Credits allocated to owners", null));
	}

	@GetMapping("/{creditId}/allocations")
	public ResponseEntity<ApiResponse<List<CreditAllocationResponse>>> getAllocationsByCreditId(
			@PathVariable Integer creditId) {
		List<CreditAllocationResponse> allocations = carbonCreditService.getAllocationsByCreditId(creditId);
		return ResponseEntity.ok(ApiResponse.success(allocations));
	}

	@GetMapping("/allocations/owner/{ownerId}")
	public ResponseEntity<ApiResponse<List<CreditAllocationResponse>>> getAllocationsByOwnerId(
			@PathVariable UUID ownerId) {
		List<CreditAllocationResponse> allocations = carbonCreditService.getAllocationsByOwnerId(ownerId);
		return ResponseEntity.ok(ApiResponse.success(allocations));
	}

	@PostMapping("/allocations/{allocationId}/claim")
	public ResponseEntity<ApiResponse<CreditAllocationResponse>> claimAllocation(@PathVariable Integer allocationId,
			Authentication authentication) {
		UUID claimedBy = getUserIdFromAuth(authentication);
		CreditAllocationResponse response = carbonCreditService.claimAllocation(allocationId, claimedBy);
		return ResponseEntity.ok(ApiResponse.success("Allocation claimed", response));
	}

	// ==================== CREDIT TRANSACTION ====================

	@PostMapping("/purchase")
	public ResponseEntity<ApiResponse<CreditTransactionResponse>> purchaseCredits(
			@Valid @RequestBody CreditPurchaseRequest request,
			Authentication authentication) {
		UUID buyerId = getUserIdFromAuth(authentication);
		CreditTransactionResponse response = carbonCreditService.purchaseCredits(request, buyerId);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Credits purchased successfully", response));
	}

	@PostMapping("/retire")
	public ResponseEntity<ApiResponse<CreditTransactionResponse>> retireCredits(
			@Valid @RequestBody CreditRetireRequest request,
			Authentication authentication) {
		UUID retiredBy = getUserIdFromAuth(authentication);
		CreditTransactionResponse response = carbonCreditService.retireCredits(request, retiredBy);
		return ResponseEntity.ok(ApiResponse.success("Credits retired successfully", response));
	}

	@GetMapping("/my-allocations")
	public ResponseEntity<ApiResponse<List<CreditAllocationResponse>>> getMyAllocations(Authentication authentication) {
		UUID ownerId = getUserIdFromAuth(authentication);
		List<CreditAllocationResponse> allocations = carbonCreditService.getAllocationsByOwnerId(ownerId);
		return ResponseEntity.ok(ApiResponse.success("My allocations retrieved successfully", allocations));
	}

	@GetMapping("/my-transactions")
	public ResponseEntity<ApiResponse<List<CreditTransactionResponse>>> getMyTransactions(
			Authentication authentication) {
		UUID userId = getUserIdFromAuth(authentication);
		List<CreditTransactionResponse> transactions = carbonCreditService.getTransactionsByBuyerId(userId);
		return ResponseEntity.ok(ApiResponse.success("My transactions retrieved successfully", transactions));
	}

	@GetMapping("/{creditId}/transactions")
	public ResponseEntity<ApiResponse<List<CreditTransactionResponse>>> getTransactionsByCreditId(
			@PathVariable Integer creditId) {
		List<CreditTransactionResponse> transactions = carbonCreditService.getTransactionsByCreditId(creditId);
		return ResponseEntity.ok(ApiResponse.success(transactions));
	}

	@GetMapping("/transactions/buyer/{buyerId}")
	public ResponseEntity<ApiResponse<List<CreditTransactionResponse>>> getTransactionsByBuyerId(
			@PathVariable UUID buyerId) {
		List<CreditTransactionResponse> transactions = carbonCreditService.getTransactionsByBuyerId(buyerId);
		return ResponseEntity.ok(ApiResponse.success(transactions));
	}

	// ==================== STATISTICS ====================

	@GetMapping("/my-balance")
	public ResponseEntity<ApiResponse<Integer>> getMyCreditBalance(Authentication authentication) {
		UUID userId = getUserIdFromAuth(authentication);
		Integer balance = carbonCreditService.getMyCreditBalance(userId);
		return ResponseEntity.ok(ApiResponse.success("Your credit balance retrieved successfully", balance));
	}

	// ==================== HELPER METHODS ====================

	private UUID getUserIdFromAuth(Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("User not found"));
		return user.getId();
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