package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.OwnershipStatus;
import com.capston.project.back.end.common.TransferStatus;
import com.capston.project.back.end.request.OwnershipTransferRequest;
import com.capston.project.back.end.request.OxiOwnershipRequest;
import com.capston.project.back.end.response.OwnershipSummaryResponse;
import com.capston.project.back.end.response.OwnershipTransferResponse;
import com.capston.project.back.end.response.OxiOwnershipResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.OxiOwnershipService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/ownerships")
@RequiredArgsConstructor
public class OxiOwnershipController {

	private final OxiOwnershipService ownershipService;

	// ==================== OWNERSHIP CRUD ====================

	@PostMapping
	public ResponseEntity<ApiResponse<OxiOwnershipResponse>> createOwnership(@Valid @RequestBody OxiOwnershipRequest request) {
		OxiOwnershipResponse response = ownershipService.createOwnership(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Ownership created successfully", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<OxiOwnershipResponse>> getOwnershipById(@PathVariable Integer id) {
		OxiOwnershipResponse response = ownershipService.getOwnershipById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<OxiOwnershipResponse>> updateOwnership(@PathVariable Integer id, @Valid @RequestBody OxiOwnershipRequest request) {
		OxiOwnershipResponse response = ownershipService.updateOwnership(id, request);
		return ResponseEntity.ok(ApiResponse.success("Ownership updated successfully", response));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteOwnership(@PathVariable Integer id) {
		ownershipService.deleteOwnership(id);
		return ResponseEntity.ok(ApiResponse.success("Ownership deleted successfully", null));
	}

	// ==================== OWNERSHIP LIST ====================

	@GetMapping
	public ResponseEntity<ApiResponse<List<OxiOwnershipResponse>>> getAllOwnerships(@RequestParam(defaultValue = "0") int page,
	                                                                                @RequestParam(defaultValue = "10") int size,
	                                                                                @RequestParam(defaultValue = "createdAt") String sortBy,
	                                                                                @RequestParam(defaultValue = "desc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<OxiOwnershipResponse> ownershipPage = ownershipService.getAllOwnerships(pageable);

		return ResponseEntity.ok(ApiResponse.success("Ownerships retrieved successfully", ownershipPage.getContent(), buildPageInfo(ownershipPage)));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<OxiOwnershipResponse>>> getOwnershipsByStatus(@PathVariable OwnershipStatus status,
	                                                                                     @RequestParam(defaultValue = "0") int page,
	                                                                                     @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<OxiOwnershipResponse> ownershipPage = ownershipService.getOwnershipsByStatus(status, pageable);

		return ResponseEntity.ok(ApiResponse.success("Ownerships retrieved successfully", ownershipPage.getContent(), buildPageInfo(ownershipPage)));
	}

	@GetMapping("/contract/{contractId}")
	public ResponseEntity<ApiResponse<List<OxiOwnershipResponse>>> getOwnershipsByContractId(@PathVariable Integer contractId) {
		List<OxiOwnershipResponse> ownerships = ownershipService.getOwnershipsByContractId(contractId);
		return ResponseEntity.ok(ApiResponse.success(ownerships));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<OxiOwnershipResponse>>> getOwnershipsByProjectId(@PathVariable Integer projectId) {
		List<OxiOwnershipResponse> ownerships = ownershipService.getOwnershipsByProjectId(projectId);
		return ResponseEntity.ok(ApiResponse.success(ownerships));
	}

	@GetMapping("/owner/{ownerId}")
	public ResponseEntity<ApiResponse<List<OxiOwnershipResponse>>> getOwnershipsByOwnerId(@PathVariable UUID ownerId,
	                                                                                      @RequestParam(defaultValue = "0") int page,
	                                                                                      @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<OxiOwnershipResponse> ownershipPage = ownershipService.getOwnershipsByOwnerIdPaged(ownerId, pageable);

		return ResponseEntity.ok(ApiResponse.success("Ownerships retrieved successfully", ownershipPage.getContent(), buildPageInfo(ownershipPage)));
	}

	// ==================== OWNERSHIP WORKFLOW ====================

	@PostMapping("/{id}/activate")
	public ResponseEntity<ApiResponse<OxiOwnershipResponse>> activateOwnership(@PathVariable Integer id) {
		OxiOwnershipResponse response = ownershipService.activateOwnership(id);
		return ResponseEntity.ok(ApiResponse.success("Ownership activated successfully", response));
	}

	@PostMapping("/{id}/terminate")
	public ResponseEntity<ApiResponse<OxiOwnershipResponse>> terminateOwnership(@PathVariable Integer id, @RequestParam String reason) {
		OxiOwnershipResponse response = ownershipService.terminateOwnership(id, reason);
		return ResponseEntity.ok(ApiResponse.success("Ownership terminated", response));
	}

	// ==================== TRANSFER MANAGEMENT ====================

	@PostMapping("/transfers")
	public ResponseEntity<ApiResponse<OwnershipTransferResponse>> requestTransfer(@Valid @RequestBody OwnershipTransferRequest request) {
		OwnershipTransferResponse response = ownershipService.requestTransfer(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Transfer request created", response));
	}

	@PostMapping("/transfers/{transferId}/approve")
	public ResponseEntity<ApiResponse<OwnershipTransferResponse>> approveTransfer(@PathVariable Integer transferId, @RequestParam UUID approvedBy) {
		OwnershipTransferResponse response = ownershipService.approveTransfer(transferId, approvedBy);
		return ResponseEntity.ok(ApiResponse.success("Transfer approved", response));
	}

	@PostMapping("/transfers/{transferId}/reject")
	public ResponseEntity<ApiResponse<OwnershipTransferResponse>> rejectTransfer(@PathVariable Integer transferId, @RequestParam String reason) {
		OwnershipTransferResponse response = ownershipService.rejectTransfer(transferId, reason);
		return ResponseEntity.ok(ApiResponse.success("Transfer rejected", response));
	}

	@PostMapping("/transfers/{transferId}/cancel")
	public ResponseEntity<ApiResponse<OwnershipTransferResponse>> cancelTransfer(@PathVariable Integer transferId) {
		OwnershipTransferResponse response = ownershipService.cancelTransfer(transferId);
		return ResponseEntity.ok(ApiResponse.success("Transfer cancelled", response));
	}

	@GetMapping("/{ownershipId}/transfers")
	public ResponseEntity<ApiResponse<List<OwnershipTransferResponse>>> getTransfersByOwnershipId(@PathVariable Integer ownershipId) {
		List<OwnershipTransferResponse> transfers = ownershipService.getTransfersByOwnershipId(ownershipId);
		return ResponseEntity.ok(ApiResponse.success(transfers));
	}

	@GetMapping("/transfers/user/{userId}")
	public ResponseEntity<ApiResponse<List<OwnershipTransferResponse>>> getTransfersByUserId(@PathVariable UUID userId) {
		List<OwnershipTransferResponse> transfers = ownershipService.getTransfersByUserId(userId);
		return ResponseEntity.ok(ApiResponse.success(transfers));
	}

	@GetMapping("/transfers/status/{status}")
	public ResponseEntity<ApiResponse<List<OwnershipTransferResponse>>> getTransfersByStatus(
			@PathVariable TransferStatus status,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<OwnershipTransferResponse> transferPage = ownershipService.getTransfersByStatus(status, pageable);

		return ResponseEntity. ok(ApiResponse.success("Transfers retrieved successfully", transferPage.getContent(), buildPageInfo(transferPage)));
	}

	// ==================== STATISTICS ====================

	@GetMapping("/summary")
	public ResponseEntity<ApiResponse<OwnershipSummaryResponse>> getOwnershipSummary() {
		OwnershipSummaryResponse summary = ownershipService.getOwnershipSummary();
		return ResponseEntity.ok(ApiResponse. success("Ownership summary retrieved", summary));
	}

	@GetMapping("/summary/owner/{ownerId}")
	public ResponseEntity<ApiResponse<OwnershipSummaryResponse>> getOwnershipSummaryByOwner(@PathVariable UUID ownerId) {
		OwnershipSummaryResponse summary = ownershipService.getOwnershipSummaryByOwner(ownerId);
		return ResponseEntity.ok(ApiResponse.success("Owner summary retrieved", summary));
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
