package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.FarmRequest;
import com.capston.project.back.end.request.TreesFarmRequest;
import com.capston.project.back.end.response.AvailableTreesResponse;
import com.capston.project.back.end.response.FarmResponse;
import com.capston.project.back.end.response.TreesFarmResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.FarmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {
	private final FarmService farmService;
	private final UserRepository userRepository;

	@PostMapping
	public ResponseEntity<ApiResponse<FarmResponse>> createFarm(@Valid @RequestBody FarmRequest request,
	                                                            Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username)
		                          .orElseThrow(() -> new RuntimeException("User not found"));
		UUID managerId = user.getId();
		FarmResponse response = farmService.createFarm(request, managerId);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Farm created successfully", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<FarmResponse>> getFarmById(@PathVariable Integer id) {
		FarmResponse response = farmService.getFarmById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/code/{code}")
	public ResponseEntity<ApiResponse<FarmResponse>> getFarmByCode(@PathVariable String code) {
		FarmResponse response = farmService.getFarmByCode(code);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<FarmResponse>> updateFarm(@PathVariable Integer id,
	                                                            @Valid @RequestBody FarmRequest request) {
		FarmResponse response = farmService.updateFarm(id, request);
		return ResponseEntity.ok(ApiResponse.success("Farm updated successfully", response));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteFarm(@PathVariable Integer id) {
		farmService.deleteFarm(id);
		return ResponseEntity.ok(ApiResponse.success("Farm deleted successfully", null));
	}

	// ==================== FARM LIST ====================

	@GetMapping
	public ResponseEntity<ApiResponse<List<FarmResponse>>> getAllFarms(@RequestParam(defaultValue = "0") int page,
	                                                                   @RequestParam(defaultValue = "10") int size,
	                                                                   @RequestParam(defaultValue = "createdAt") String sortBy,
	                                                                   @RequestParam(defaultValue = "desc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("asc")
		            ? Sort.by(sortBy).ascending()
		            : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<FarmResponse> farmPage = farmService.getAllFarms(pageable);

		return ResponseEntity.ok(ApiResponse.success("Farms retrieved successfully",
		                                             farmPage.getContent(),
		                                             buildPageInfo(farmPage)));
	}

	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<FarmResponse>>> getFarmsByStatus(@PathVariable FarmStatus status,
	                                                                        @RequestParam(defaultValue = "0") int page,
	                                                                        @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<FarmResponse> farmPage = farmService.getFarmsByStatus(status, pageable);

		return ResponseEntity.ok(ApiResponse.success("Farms retrieved successfully",
		                                             farmPage.getContent(),
		                                             buildPageInfo(farmPage)));
	}

	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<FarmResponse>>> searchFarms(@RequestParam String keyword,
	                                                                   @RequestParam(defaultValue = "0") int page,
	                                                                   @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<FarmResponse> farmPage = farmService.searchFarms(keyword, pageable);

		return ResponseEntity.ok(ApiResponse.success("Search completed", farmPage.getContent(), buildPageInfo(farmPage)));
	}

	// ==================== TREES IN FARM ====================

	@PostMapping("/trees")
	public ResponseEntity<ApiResponse<TreesFarmResponse>> addTreesToFarm(@Valid @RequestBody TreesFarmRequest request,
	                                                                     Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID managerId = user.getId();
		TreesFarmResponse response = farmService.addTreesToFarm(request, managerId);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Trees added to farm successfully", response));
	}

	@PutMapping("/trees/{treesFarmId}")
	public ResponseEntity<ApiResponse<TreesFarmResponse>> updateTreesFarm(@PathVariable Integer treesFarmId,
	                                                                      @Valid @RequestBody TreesFarmRequest request) {
		TreesFarmResponse response = farmService.updateTreesFarm(treesFarmId, request);
		return ResponseEntity.ok(ApiResponse.success("Trees updated successfully", response));
	}

	@DeleteMapping("/trees/{treesFarmId}")
	public ResponseEntity<ApiResponse<Void>> removeTreesFromFarm(@PathVariable Integer treesFarmId) {
		farmService.removeTreesFromFarm(treesFarmId);
		return ResponseEntity.ok(ApiResponse.success("Trees removed from farm successfully", null));
	}

	@GetMapping("/{farmId}/trees")
	public ResponseEntity<ApiResponse<List<TreesFarmResponse>>> getTreesByFarmId(@PathVariable Integer farmId) {
		List<TreesFarmResponse> trees = farmService.getTreesByFarmId(farmId);
		return ResponseEntity.ok(ApiResponse.success(trees));
	}

	// ==================== AVAILABLE TREES FOR SALE ====================

	@GetMapping("/available-trees")
	public ResponseEntity<ApiResponse<List<AvailableTreesResponse>>> getAvailableTreesForSale() {
		List<AvailableTreesResponse> trees = farmService.getAvailableTreesForSale();
		return ResponseEntity.ok(ApiResponse.success("Available trees for sale", trees));
	}

	@GetMapping("/available-trees/species/{speciesId}")
	public ResponseEntity<ApiResponse<List<AvailableTreesResponse>>> getAvailableTreesBySpecies(@PathVariable Integer speciesId) {
		List<AvailableTreesResponse> trees = farmService.getAvailableTreesBySpecies(speciesId);
		return ResponseEntity.ok(ApiResponse.success(trees));
	}

	@GetMapping("/{farmId}/available-trees")
	public ResponseEntity<ApiResponse<List<AvailableTreesResponse>>> getAvailableTreesByFarm(@PathVariable Integer farmId) {
		List<AvailableTreesResponse> trees = farmService.getAvailableTreesByFarm(farmId);
		return ResponseEntity.ok(ApiResponse.success(trees));
	}

	// ==================== RECALCULATE ====================

	@PostMapping("/{farmId}/recalculate")
	public ResponseEntity<ApiResponse<FarmResponse>> recalculateFarmStats(@PathVariable Integer farmId) {
		farmService.recalculateFarmStats(farmId);
		FarmResponse response = farmService.getFarmById(farmId);
		return ResponseEntity.ok(ApiResponse.success("Farm stats recalculated", response));
	}

	@PostMapping("/recalculate-all")
	public ResponseEntity<ApiResponse<Void>> recalculateAllFarmStats() {
		farmService.recalculateAllFarmStats();
		return ResponseEntity.ok(ApiResponse.success("All farm stats recalculated", null));
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
