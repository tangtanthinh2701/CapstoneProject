package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.CreditStatus;
import com.capston.project.back.end.common.TransactionStatus;
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
import org.springframework.data. domain.Page;
import org. springframework.data.domain.PageRequest;
import org.springframework. data.domain.Pageable;
import org.springframework.data. domain.Sort;
import org. springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework. web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/carbon-credits")
@RequiredArgsConstructor
public class CarbonCreditController {

	private final CarbonCreditService carbonCreditService;

	// ==================== CARBON CREDIT CRUD ====================

	@PostMapping
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> createCredit(@Valid @RequestBody CarbonCreditRequest request) {
		CarbonCreditResponse response = carbonCreditService.createCredit(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Carbon credit created successfully", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> getCreditById(@PathVariable Integer id) {
		CarbonCreditResponse response = carbonCreditService.getCreditById(id);
		return ResponseEntity. ok(ApiResponse.success(response));
	}

	@GetMapping("/code/{code}")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> getCreditByCode(@PathVariable String code) {
		CarbonCreditResponse response = carbonCreditService.getCreditByCode(code);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> updateCredit(@PathVariable Integer id,
	                                                                      @Valid @RequestBody CarbonCreditRequest request) {
		CarbonCreditResponse response = carbonCreditService.updateCredit(id, request);
		return ResponseEntity. ok(ApiResponse.success("Carbon credit updated successfully", response));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteCredit(@PathVariable Integer id) {
		carbonCreditService.deleteCredit(id);
		return ResponseEntity.ok(ApiResponse.success("Carbon credit deleted successfully", null));
	}

	// ==================== CARBON CREDIT LIST ====================

	@GetMapping
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getAllCredits(@RequestParam(defaultValue = "0") int page,
	                                                                             @RequestParam(defaultValue = "10") int size,
	                                                                             @RequestParam(defaultValue = "createdAt") String sortBy,
	                                                                             @RequestParam(defaultValue = "desc") String sortDir) {
		Sort sort = sortDir.equalsIgnoreCase("asc")
		            ? Sort.by(sortBy).ascending()
		            : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<CarbonCreditResponse> creditPage = carbonCreditService.getAllCredits(pageable);

		return ResponseEntity.ok(ApiResponse. success("Carbon credits retrieved successfully",
		                                              creditPage.getContent(),
		                                              buildPageInfo(creditPage)));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getCreditsByStatus(@PathVariable CreditStatus status,
	                                                                                  @RequestParam(defaultValue = "0") int page,
	                                                                                  @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<CarbonCreditResponse> creditPage = carbonCreditService.getCreditsByStatus(status, pageable);

		return ResponseEntity.ok(ApiResponse.success("Credits retrieved successfully",
		                                             creditPage. getContent(),
		                                             buildPageInfo(creditPage)));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getCreditsByProjectId(@PathVariable Integer projectId) {
		List<CarbonCreditResponse> credits = carbonCreditService.getCreditsByProjectId(projectId);
		return ResponseEntity. ok(ApiResponse.success(credits));
	}

	@GetMapping("/available")
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> getAvailableCredits() {
		List<CarbonCreditResponse> credits = carbonCreditService.getAvailableCredits();
		return ResponseEntity.ok(ApiResponse.success("Available credits", credits));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<CarbonCreditResponse>>> searchCredits(@RequestParam String keyword,
	                                                                             @RequestParam(defaultValue = "0") int page,
	                                                                             @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<CarbonCreditResponse> creditPage = carbonCreditService.searchCredits(keyword, pageable);

		return ResponseEntity.ok(ApiResponse.success("Search completed",
		                                             creditPage.getContent(),
		                                             buildPageInfo(creditPage)));
	}

	// ==================== CREDIT WORKFLOW ====================

	@PostMapping("/{id}/verify")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> verifyAndActivateCredit(@PathVariable Integer id,
	                                                                                 @RequestParam UUID verifiedBy) {
		CarbonCreditResponse response = carbonCreditService.verifyAndActivateCredit(id, verifiedBy);
		return ResponseEntity.ok(ApiResponse.success("Credit verified and activated", response));
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<ApiResponse<CarbonCreditResponse>> cancelCredit(@PathVariable Integer id,
	                                                                      @RequestParam String reason) {
		CarbonCreditResponse response = carbonCreditService.cancelCredit(id, reason);
		return ResponseEntity.ok(ApiResponse.success("Credit cancelled", response));
	}

	// ==================== CREDIT ALLOCATION ====================

	@PostMapping("/{creditId}/allocate")
	public ResponseEntity<ApiResponse<CreditAllocationResponse>> allocateCreditsToOwners(@PathVariable Integer creditId) {
		CreditAllocationResponse response = carbonCreditService.allocateCreditsToOwners(creditId);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Credits allocated to owners", response));
	}

	@GetMapping("/{creditId}/allocations")
	public ResponseEntity<ApiResponse<List<CreditAllocationResponse>>> getAllocationsByCreditId(@PathVariable Integer creditId) {
		List<CreditAllocationResponse> allocations = carbonCreditService.getAllocationsByCreditId(creditId);
		return ResponseEntity.ok(ApiResponse.success(allocations));
	}

	@GetMapping("/allocations/owner/{ownerId}")
	public ResponseEntity<ApiResponse<List<CreditAllocationResponse>>> getAllocationsByOwnerId(@PathVariable UUID ownerId) {
		List<CreditAllocationResponse> allocations = carbonCreditService.getAllocationsByOwnerId(ownerId);
		return ResponseEntity.ok(ApiResponse.success(allocations));
	}

	@PostMapping("/allocations/{allocationId}/claim")
	public ResponseEntity<ApiResponse<CreditAllocationResponse>> claimAllocation(@PathVariable Integer allocationId) {
		CreditAllocationResponse response = carbonCreditService.claimAllocation(allocationId);
		return ResponseEntity.ok(ApiResponse.success("Allocation claimed", response));
	}

	// ==================== CREDIT TRANSACTION ====================

	@PostMapping("/purchase")
	public ResponseEntity<ApiResponse<CreditTransactionResponse>> purchaseCredits(@Valid @RequestBody CreditPurchaseRequest request) {
		CreditTransactionResponse response = carbonCreditService.purchaseCredits(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Credits purchased successfully", response));
	}

	@PostMapping("/retire")
	public ResponseEntity<ApiResponse<CreditTransactionResponse>> retireCredits(@Valid @RequestBody CreditRetireRequest request) {
		CreditTransactionResponse response = carbonCreditService.retireCredits(request);
		return ResponseEntity.ok(ApiResponse.success("Credits retired successfully", response));
	}

	@GetMapping("/transactions/{id}")
	public ResponseEntity<ApiResponse<CreditTransactionResponse>> getTransactionById(@PathVariable Integer id) {
		CreditTransactionResponse response = carbonCreditService.getTransactionById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/{creditId}/transactions")
	public ResponseEntity<ApiResponse<List<CreditTransactionResponse>>> getTransactionsByCreditId(@PathVariable Integer creditId) {
		List<CreditTransactionResponse> transactions = carbonCreditService.getTransactionsByCreditId(creditId);
		return ResponseEntity.ok(ApiResponse.success(transactions));
	}

	@GetMapping("/transactions/enterprise/{enterpriseId}")
	public ResponseEntity<ApiResponse<List<CreditTransactionResponse>>> getTransactionsByEnterpriseId(@PathVariable UUID enterpriseId) {
		List<CreditTransactionResponse> transactions = carbonCreditService.getTransactionsByEnterpriseId(enterpriseId);
		return ResponseEntity.ok(ApiResponse.success(transactions));
	}

	@GetMapping("/transactions/status/{status}")
	public ResponseEntity<ApiResponse<List<CreditTransactionResponse>>> getTransactionsByStatus(@PathVariable TransactionStatus status,
	                                                                                            @RequestParam(defaultValue = "0") int page,
	                                                                                            @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("purchasedAt").descending());
		Page<CreditTransactionResponse> transactionPage = carbonCreditService.getTransactionsByStatus(status, pageable);

		return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully",
		                                             transactionPage.getContent(),
		                                             buildPageInfo(transactionPage)));
	}

	// ==================== STATISTICS ====================

	@GetMapping("/summary")
	public ResponseEntity<ApiResponse<CreditSummaryResponse>> getCreditSummary() {
		CreditSummaryResponse summary = carbonCreditService.getCreditSummary();
		return ResponseEntity.ok(ApiResponse.success("Credit summary retrieved", summary));
	}

	@GetMapping("/summary/project/{projectId}")
	public ResponseEntity<ApiResponse<CreditSummaryResponse>> getCreditSummaryByProject(@PathVariable Integer projectId) {
		CreditSummaryResponse summary = carbonCreditService.getCreditSummaryByProject(projectId);
		return ResponseEntity.ok(ApiResponse.success("Project credit summary retrieved", summary));
	}

	private ApiResponse. PageInfo buildPageInfo(Page<? > page) {
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