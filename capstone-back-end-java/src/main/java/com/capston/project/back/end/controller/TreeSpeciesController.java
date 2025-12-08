package com.capston.project.back.end.controller;

import com.capston.project.back.end.request.TreeSpeciesRequest;
import com.capston.project.back.end.response.TreeSpeciesListResponse;
import com.capston.project.back.end.response.TreeSpeciesResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import com.capston.project.back.end.service.TreeSpeciesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tree-species")
@RequiredArgsConstructor
public class TreeSpeciesController {
	private final TreeSpeciesService treeSpeciesService;

	@PostMapping("/create-treeSpecies")
	public ResponseEntity<ApiResponse<TreeSpeciesResponse>> createTreeSpecies(@Valid @RequestBody TreeSpeciesRequest request) {
		TreeSpeciesResponse response = treeSpeciesService.createTreeSpecies(request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Tạo loại cây thành công", response));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<TreeSpeciesResponse>> updateTreeSpecies(@PathVariable Integer id, @Valid @RequestBody TreeSpeciesRequest request) {
		TreeSpeciesResponse response = treeSpeciesService.updateTreeSpecies(id, request);
		return ResponseEntity.ok(ApiResponse.success("Cập nhật loại cây thành công", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<TreeSpeciesResponse>> getTreeSpeciesById(@PathVariable Integer id) {
		TreeSpeciesResponse response = treeSpeciesService.getTreeSpeciesById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<PageResponse<TreeSpeciesListResponse>>> getAllTreeSpecies(@RequestParam(required = false) String name,
	                                                                                            @RequestParam(required = false) String growthRate,
	                                                                                            @RequestParam(required = false) Boolean isActive,
	                                                                                            @RequestParam(defaultValue = "0") int page,
	                                                                                            @RequestParam(defaultValue = "20") int size) {
		PageResponse<TreeSpeciesListResponse> response = treeSpeciesService.getAllTreeSpecies(name, growthRate, isActive, page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/active")
	public ResponseEntity<ApiResponse<PageResponse<TreeSpeciesListResponse>>> getActiveTreeSpecies(@RequestParam(defaultValue = "0") int page,
	                                                                                               @RequestParam(defaultValue = "50") int size) {

		PageResponse<TreeSpeciesListResponse> response = treeSpeciesService.getActiveTreeSpecies(page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteTreeSpecies(@PathVariable Integer id) {
		treeSpeciesService.deleteTreeSpecies(id);
		return ResponseEntity.ok(ApiResponse.success("Xóa loại cây thành công", null));
	}

	@DeleteMapping("/{id}/hard")
	public ResponseEntity<ApiResponse<Void>> hardDeleteTreeSpecies(@PathVariable Integer id) {
		treeSpeciesService.hardDeleteTreeSpecies(id);
		return ResponseEntity.ok(ApiResponse.success("Xóa vĩnh viễn loại cây thành công", null));
	}
}
