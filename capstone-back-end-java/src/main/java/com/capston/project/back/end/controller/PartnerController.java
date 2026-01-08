package com.capston.project.back.end.controller;

import com.capston.project.back.end.request.PartnerRequest;
import com.capston.project.back.end.request.ProjectPartnerRequest;
import com.capston.project.back.end.response.PartnerResponse;
import com.capston.project.back.end.response.ProjectPartnerResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.PartnerService;
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
@RequestMapping("/api/partners")
@RequiredArgsConstructor
public class PartnerController {

	private final PartnerService partnerService;

	// ==================== PARTNER CRUD ====================

	@PostMapping
	public ResponseEntity<ApiResponse<PartnerResponse>> createPartner(@Valid @RequestBody PartnerRequest request) {
		PartnerResponse response = partnerService.createPartner(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse. success("Partner created successfully", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<PartnerResponse>> getPartnerById(@PathVariable Integer id) {
		PartnerResponse response = partnerService.getPartnerById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<PartnerResponse>> updatePartner(
			@PathVariable Integer id,
			@Valid @RequestBody PartnerRequest request) {
		PartnerResponse response = partnerService.updatePartner(id, request);
		return ResponseEntity.ok(ApiResponse.success("Partner updated successfully", response));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deletePartner(@PathVariable Integer id) {
		partnerService.deletePartner(id);
		return ResponseEntity.ok(ApiResponse.success("Partner deleted successfully", null));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<PartnerResponse>>> getAllPartners(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "partnerName") String sortBy,
			@RequestParam(defaultValue = "asc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("asc")
		            ? Sort.by(sortBy).ascending()
		            : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest. of(page, size, sort);

		Page<PartnerResponse> partnerPage = partnerService.getAllPartners(pageable);

		return ResponseEntity.ok(ApiResponse. success(
				"Partners retrieved successfully",
				partnerPage.getContent(),
				buildPageInfo(partnerPage)
		                                             ));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<PartnerResponse>>> searchPartners(
			@RequestParam String keyword,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest. of(page, size);
		Page<PartnerResponse> partnerPage = partnerService.searchPartners(keyword, pageable);

		return ResponseEntity.ok(ApiResponse.success(
				"Search completed",
				partnerPage.getContent(),
				buildPageInfo(partnerPage)
		                                            ));
	}

	@GetMapping("/all")
	public ResponseEntity<ApiResponse<List<PartnerResponse>>> getAllPartnersSimple() {
		List<PartnerResponse> partners = partnerService. getAllPartnersSimple();
		return ResponseEntity.ok(ApiResponse.success(partners));
	}

	// ==================== PROJECT-PARTNER ASSOCIATION ====================

	@PostMapping("/project-partner")
	public ResponseEntity<ApiResponse<ProjectPartnerResponse>> addPartnerToProject(
			@Valid @RequestBody ProjectPartnerRequest request) {
		ProjectPartnerResponse response = partnerService. addPartnerToProject(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Partner added to project successfully", response));
	}

	@PutMapping("/project-partner/{id}")
	public ResponseEntity<ApiResponse<ProjectPartnerResponse>> updateProjectPartner(
			@PathVariable Integer id,
			@Valid @RequestBody ProjectPartnerRequest request) {
		ProjectPartnerResponse response = partnerService.updateProjectPartner(id, request);
		return ResponseEntity.ok(ApiResponse.success("Project-Partner updated successfully", response));
	}

	@DeleteMapping("/project/{projectId}/partner/{partnerId}")
	public ResponseEntity<ApiResponse<Void>> removePartnerFromProject(
			@PathVariable Integer projectId,
			@PathVariable Integer partnerId) {
		partnerService.removePartnerFromProject(projectId, partnerId);
		return ResponseEntity.ok(ApiResponse.success("Partner removed from project successfully", null));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<ProjectPartnerResponse>>> getPartnersByProjectId(
			@PathVariable Integer projectId) {
		List<ProjectPartnerResponse> partners = partnerService.getPartnersByProjectId(projectId);
		return ResponseEntity. ok(ApiResponse.success(partners));
	}

	@GetMapping("/{partnerId}/projects")
	public ResponseEntity<ApiResponse<List<ProjectPartnerResponse>>> getProjectsByPartnerId(
			@PathVariable Integer partnerId) {
		List<ProjectPartnerResponse> projects = partnerService.getProjectsByPartnerId(partnerId);
		return ResponseEntity.ok(ApiResponse.success(projects));
	}

	@GetMapping("/available/{projectId}")
	public ResponseEntity<ApiResponse<List<PartnerResponse>>> getAvailablePartnersForProject(
			@PathVariable Integer projectId) {
		List<PartnerResponse> partners = partnerService.getAvailablePartnersForProject(projectId);
		return ResponseEntity.ok(ApiResponse.success("Available partners for project", partners));
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