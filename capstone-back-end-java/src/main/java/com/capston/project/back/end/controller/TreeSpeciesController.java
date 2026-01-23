package com.capston.project.back.end.controller;

import com.capston.project.back.end.request.TreeSpeciesRequest;
import com.capston.project.back.end.response.TreeSpeciesResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.TreeSpeciesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/tree-species")
@RequiredArgsConstructor
public class TreeSpeciesController {
	private final TreeSpeciesService treeSpeciesService;

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<TreeSpeciesResponse>> create(@Valid @RequestBody TreeSpeciesRequest request) {
		TreeSpeciesResponse response = treeSpeciesService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Tree species created successfully", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<TreeSpeciesResponse>> getById(@PathVariable Integer id) {
		TreeSpeciesResponse response = treeSpeciesService.getById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<TreeSpeciesResponse>> update(@PathVariable Integer id,
	                                                               @Valid @RequestBody TreeSpeciesRequest request) {
		TreeSpeciesResponse response = treeSpeciesService.update(id, request);
		return ResponseEntity.ok(ApiResponse.success("Tree species updated successfully", response));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
		treeSpeciesService.delete(id);
		return ResponseEntity.ok(ApiResponse.success("Tree species deleted successfully", null));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<TreeSpeciesResponse>>> getAll(@RequestParam(defaultValue = "0") int page,
	                                                                     @RequestParam(defaultValue = "10") int size,
	                                                                     @RequestParam(defaultValue = "name") String sortBy,
	                                                                     @RequestParam(defaultValue = "asc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("asc")
		            ? Sort.by(sortBy).ascending()
		            : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<TreeSpeciesResponse> speciesPage = treeSpeciesService.getAll(pageable);

		return ResponseEntity.ok(ApiResponse.success("Tree species retrieved successfully",
		                                             speciesPage.getContent(),
		                                             buildPageInfo(speciesPage)));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<TreeSpeciesResponse>>> search(@RequestParam String keyword,
	                                                                     @RequestParam(defaultValue = "0") int page,
	                                                                     @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<TreeSpeciesResponse> speciesPage = treeSpeciesService.search(keyword, pageable);

		return ResponseEntity.ok(ApiResponse.success("Search completed",
		                                             speciesPage.getContent(),
		                                             buildPageInfo(speciesPage)));
	}

	@GetMapping("/all")
	public ResponseEntity<ApiResponse<List<TreeSpeciesResponse>>> getAllActive() {
		List<TreeSpeciesResponse> species = treeSpeciesService.getAllActive();
		return ResponseEntity.ok(ApiResponse.success(species));
	}

	@GetMapping("/top-carbon")
	public ResponseEntity<ApiResponse<List<TreeSpeciesResponse>>> getTopByCarbonAbsorption(@RequestParam(defaultValue = "10") int limit) {
		List<TreeSpeciesResponse> species = treeSpeciesService.getTopByCarbonAbsorption(limit);
		return ResponseEntity.ok(ApiResponse.success("Top carbon absorbing species", species));
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
