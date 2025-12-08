package com.capston.project.back.end.controller;

import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.AnnualGrowthDataRequest;
import com.capston.project.back.end.response.AnnualGrowthDataResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.AnnualGrowthDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/growth-data")
@RequiredArgsConstructor
public class AnnualGrowthDataController {
	private final AnnualGrowthDataService growthDataService;
	private final UserRepository userRepository;

	@PostMapping
	public ResponseEntity<ApiResponse<AnnualGrowthDataResponse>> createOrUpdateGrowthData(@Valid @RequestBody AnnualGrowthDataRequest request,
	                                                                                      Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID recorderId = user.getId();
		AnnualGrowthDataResponse response = growthDataService.createOrUpdateGrowthData(request, recorderId);
		return ResponseEntity.ok(ApiResponse.success("Cập nhật dữ liệu sinh trưởng thành công", response));
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<ApiResponse<List<AnnualGrowthDataResponse>>> getGrowthDataByProject(@PathVariable Integer projectId) {
		List<AnnualGrowthDataResponse> response = growthDataService.getGrowthDataByProject(projectId);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/project/{projectId}/year/{year}")
	public ResponseEntity<ApiResponse<List<AnnualGrowthDataResponse>>> getGrowthDataByProjectAndYear(@PathVariable Integer projectId, @PathVariable Integer year) {
		List<AnnualGrowthDataResponse> response = growthDataService.getGrowthDataByProjectAndYear(projectId, year);
		return ResponseEntity.ok(ApiResponse.success(response));
	}
}
