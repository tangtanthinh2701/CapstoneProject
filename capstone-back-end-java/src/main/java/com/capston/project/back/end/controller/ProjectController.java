package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.response.ProjectListResponse;
import com.capston.project.back.end.response.ProjectResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import com.capston.project.back.end.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
	private final ProjectService projectService;
	private final UserRepository userRepository;

	@PostMapping("/create-projects")
	public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest request, Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID managerId = user.getId();
		ProjectResponse response = projectService.createProject(request, managerId);
		return ResponseEntity.ok(ApiResponse.success("Tạo dự án thành công", response));
	}

	@GetMapping("/get-projects")
	public ResponseEntity<ApiResponse<PageResponse<ProjectListResponse>>>
	getAllProjects(@RequestParam(required = false) String name, @RequestParam(required = false) ProjectStatus status,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {

		PageResponse<ProjectListResponse> response = projectService.getAllProjects(name, status, fromDate, toDate, page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Integer id) {
		ProjectResponse response = projectService.getProjectById(id);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(@PathVariable Integer id, @Valid @RequestBody ProjectRequest request) {
		ProjectResponse response = projectService.updateProject(id, request);
		return ResponseEntity.ok(ApiResponse.success("Cập nhật dự án thành công", response));
	}

	@GetMapping("/public")
	public ResponseEntity<ApiResponse<PageResponse<ProjectListResponse>>> getPublicProjects(@RequestParam(defaultValue = "0") int page,
	                                                                                        @RequestParam(defaultValue = "20") int size) {

		PageResponse<ProjectListResponse> response = projectService.getPublicProjects(page, size);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Integer id) {
		projectService.deleteProject(id);

		return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", null));
	}
}
