package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.FarmRequest;
import com.capston.project.back.end.response.FarmResponse;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {
	private final FarmService farmService;
	private final UserRepository userRepository;

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
	public ResponseEntity<ApiResponse<FarmResponse>> createFarm(@Valid @RequestBody FarmRequest request,
			Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
		FarmResponse response = farmService.createFarm(request, user.getId());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Farm created successfully", response));
	}

	@GetMapping("/my-farms")
	@PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
	public ResponseEntity<ApiResponse<List<FarmResponse>>> getMyFarms(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<FarmResponse> farmPage = farmService.getMyFarms(user.getId(), pageable);

		return ResponseEntity.ok(ApiResponse.success("My farms retrieved successfully",
				farmPage.getContent(),
				buildPageInfo(farmPage)));
	}

	@GetMapping("/code/{code}")
	public ResponseEntity<ApiResponse<FarmResponse>> getFarmByCode(@PathVariable String code) {
		FarmResponse response = farmService.getFarmByCode(code);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
	public ResponseEntity<ApiResponse<FarmResponse>> updateFarm(@PathVariable Integer id,
			@Valid @RequestBody FarmRequest request) {
		FarmResponse response = farmService.updateFarm(id, request);
		return ResponseEntity.ok(ApiResponse.success("Farm updated successfully", response));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
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
	public ResponseEntity<ApiResponse<List<FarmResponse>>> searchFarms(@RequestParam String keyword) {
		List<FarmResponse> farms = farmService.searchFarms(keyword);
		return ResponseEntity.ok(ApiResponse.success("Search completed", farms));
	}

	@GetMapping("/{id:[0-9]+}")
	public ResponseEntity<ApiResponse<FarmResponse>> getFarmById(@PathVariable Integer id) {
		FarmResponse response = farmService.getFarmById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
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
