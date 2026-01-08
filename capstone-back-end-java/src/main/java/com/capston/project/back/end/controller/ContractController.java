package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.request.ContractApprovalRequest;
import com.capston.project.back.end.request.ContractRenewalRequest;
import com.capston.project.back.end.request.ContractRequest;
import com.capston.project.back.end.request.ContractTerminationRequest;
import com.capston.project.back.end.response.ContractRenewalResponse;
import com.capston.project.back.end.response.ContractResponse;
import com.capston.project.back.end.response.ContractSummaryResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {
	private final ContractService contractService;

	@PostMapping
	public ResponseEntity<ApiResponse<ContractResponse>> createContract(@Valid @RequestBody ContractRequest request) {
		ContractResponse response = contractService. createContract(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Contract created successfully", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ContractResponse>> getContractById(@PathVariable Integer id) {
		ContractResponse response = contractService.getContractById(id);
		return ResponseEntity. ok(ApiResponse.success(response));
	}

	@GetMapping("/code/{code}")
	public ResponseEntity<ApiResponse<ContractResponse>> getContractByCode(@PathVariable String code) {
		ContractResponse response = contractService.getContractByCode(code);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ContractResponse>> updateContract(@PathVariable Integer id, @Valid @RequestBody ContractRequest request) {
		ContractResponse response = contractService.updateContract(id, request);
		return ResponseEntity.ok(ApiResponse.success("Contract updated successfully", response));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteContract(@PathVariable Integer id) {
		contractService.deleteContract(id);
		return ResponseEntity.ok(ApiResponse.success("Contract deleted successfully", null));
	}

	// ==================== CONTRACT LIST ====================

	@GetMapping
	public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "createdAt") String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<ContractResponse> contractPage = contractService.getAllContracts(pageable);

		return ResponseEntity.ok(ApiResponse. success(
				"Contracts retrieved successfully",
				contractPage.getContent(),
				buildPageInfo(contractPage)
		                                             ));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<ContractResponse>>> getContractsByStatus(@PathVariable ContractStatus status,
	                                                                                @RequestParam(defaultValue = "0") int page,
	                                                                                @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<ContractResponse> contractPage = contractService.getContractsByStatus(status, pageable);

		return ResponseEntity.ok(ApiResponse.success("Contracts retrieved successfully", contractPage.getContent(), buildPageInfo(contractPage)));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<ContractResponse>>> getContractsByProjectId(@PathVariable Integer projectId) {
		List<ContractResponse> contracts = contractService.getContractsByProjectId(projectId);
		return ResponseEntity.ok(ApiResponse.success(contracts));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<ContractResponse>>> searchContracts(@RequestParam String keyword,
	                                                                           @RequestParam(defaultValue = "0") int page,
	                                                                           @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<ContractResponse> contractPage = contractService.searchContracts(keyword, pageable);

		return ResponseEntity.ok(ApiResponse.success("Search completed", contractPage.getContent(), buildPageInfo(contractPage)));
	}

	// ==================== CONTRACT WORKFLOW ====================

	@PostMapping("/{id}/submit")
	public ResponseEntity<ApiResponse<ContractResponse>> submitForApproval(@PathVariable Integer id) {
		ContractResponse response = contractService. submitForApproval(id);
		return ResponseEntity.ok(ApiResponse.success("Contract submitted for approval", response));
	}

	@PostMapping("/{id}/approve")
	public ResponseEntity<ApiResponse<ContractResponse>> approveContract(@PathVariable Integer id, @RequestBody ContractApprovalRequest request) {
		ContractResponse response = contractService.approveContract(id, request);
		return ResponseEntity.ok(ApiResponse.success("Contract approved successfully", response));
	}

	@PostMapping("/{id}/reject")
	public ResponseEntity<ApiResponse<ContractResponse>> rejectContract(@PathVariable Integer id, @RequestParam String reason) {
		ContractResponse response = contractService.rejectContract(id, reason);
		return ResponseEntity.ok(ApiResponse.success("Contract rejected", response));
	}

	@PostMapping("/{id}/activate")
	public ResponseEntity<ApiResponse<ContractResponse>> activateContract(@PathVariable Integer id) {
		ContractResponse response = contractService. activateContract(id);
		return ResponseEntity.ok(ApiResponse.success("Contract activated successfully", response));
	}

	@PostMapping("/{id}/terminate")
	public ResponseEntity<ApiResponse<ContractResponse>> terminateContract(@PathVariable Integer id, @Valid @RequestBody ContractTerminationRequest request) {
		ContractResponse response = contractService.terminateContract(id, request);
		return ResponseEntity.ok(ApiResponse.success("Contract terminated", response));
	}

	// ==================== CONTRACT RENEWAL ====================

	@PostMapping("/renewals")
	public ResponseEntity<ApiResponse<ContractRenewalResponse>> requestRenewal(@Valid @RequestBody ContractRenewalRequest request) {
		ContractRenewalResponse response = contractService.requestRenewal(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Renewal request created", response));
	}

	@PostMapping("/renewals/{renewalId}/approve")
	public ResponseEntity<ApiResponse<ContractRenewalResponse>> approveRenewal(@PathVariable Integer renewalId,
	                                                                           @RequestBody ContractApprovalRequest request) {
		ContractRenewalResponse response = contractService.approveRenewal(renewalId, request);
		return ResponseEntity.ok(ApiResponse.success("Renewal approved", response));
	}

	@PostMapping("/renewals/{renewalId}/reject")
	public ResponseEntity<ApiResponse<ContractRenewalResponse>> rejectRenewal(@PathVariable Integer renewalId,
	                                                                          @RequestParam String reason) {
		ContractRenewalResponse response = contractService.rejectRenewal(renewalId, reason);
		return ResponseEntity.ok(ApiResponse.success("Renewal rejected", response));
	}

	@GetMapping("/{contractId}/renewals")
	public ResponseEntity<ApiResponse<List<ContractRenewalResponse>>> getRenewalsByContractId(@PathVariable Integer contractId) {
		List<ContractRenewalResponse> renewals = contractService.getRenewalsByContractId(contractId);
		return ResponseEntity.ok(ApiResponse.success(renewals));
	}

	// ==================== STATISTICS ====================

	@GetMapping("/summary")
	public ResponseEntity<ApiResponse<ContractSummaryResponse>> getContractSummary() {
		ContractSummaryResponse summary = contractService.getContractSummary();
		return ResponseEntity.ok(ApiResponse.success("Contract summary retrieved", summary));
	}

	@GetMapping("/expiring-soon")
	public ResponseEntity<ApiResponse<List<ContractResponse>>> getExpiringSoonContracts() {
		List<ContractResponse> contracts = contractService.getExpiringSoonContracts();
		return ResponseEntity.ok(ApiResponse.success("Expiring soon contracts", contracts));
	}

	@GetMapping("/expired")
	public ResponseEntity<ApiResponse<List<ContractResponse>>> getExpiredContracts() {
		List<ContractResponse> contracts = contractService.getExpiredContracts();
		return ResponseEntity.ok(ApiResponse.success("Expired contracts", contracts));
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
