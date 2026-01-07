package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.entity.User;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.request.ProjectPhaseRequest;
import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.response.ProjectPhaseResponse;
import com.capston.project.back.end.response.ProjectResponse;
import com.capston.project.back.end.response.generic.ApiResponse;
import com.capston.project.back.end.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
	private final ProjectService projectService;
	private final UserRepository userRepository;

	/**
	 * Create a new project with phases
	 */
	@PostMapping("/create-projects")
	public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest request,
	                                                                                      Authentication authentication) {
		String username = authentication.getName();
		User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		UUID managerId = user.getId();

		ProjectResponse response = projectService.createProject(request, managerId);
		return ResponseEntity.status(HttpStatus.CREATED)
				             .body(ApiResponse.success("Project created successfully", response));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Integer id) {

		ProjectResponse response = projectService.getProjectById(id);
		return ResponseEntity. ok(ApiResponse.success(response));
	}

	/**
	 * Lấy project theo code (bao gồm phases)
	 */
	@GetMapping("/code/{code}")
	public ResponseEntity<ApiResponse<ProjectResponse>> getProjectByCode(@PathVariable String code) {

		ProjectResponse response = projectService.getProjectByCode(code);
		return ResponseEntity.ok(ApiResponse.success(response));
	}

	/**
	 * Cập nhật project
	 */
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(@PathVariable Integer id,
	                                                                  @Valid @RequestBody ProjectRequest request) {
		ProjectResponse response = projectService.updateProject(id, request);
		return ResponseEntity. ok(ApiResponse.success("Project updated successfully", response));
	}

	/**
	 * Xóa project
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Integer id) {
		projectService.deleteProject(id);
		return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", null));
	}

	/**
	 * Lấy danh sách tất cả projects (có phân trang)
	 */
	@GetMapping
	public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAllProjects(@RequestParam(defaultValue = "0") int page,
	                                                                         @RequestParam(defaultValue = "20") int size,
	                                                                         @RequestParam(defaultValue = "createdAt") String sortBy,
	                                                                         @RequestParam(defaultValue = "desc") String sortDir) {

		Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest. of(page, size, sort);

		Page<ProjectResponse> projectPage = projectService.getAllProjects(pageable);

		return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully",
		                                              projectPage.getContent(),
		                                              buildPageInfo(projectPage)));
	}

	/**
	 * Lấy projects theo status
	 */
	@GetMapping("/status/{status}")
	public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjectsByStatus(@PathVariable ProjectStatus status,
	                                                                              @RequestParam(defaultValue = "0") int page,
	                                                                              @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest. of(page, size, Sort.by("createdAt").descending());
		Page<ProjectResponse> projectPage = projectService. getProjectsByStatus(status, pageable);

		return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully",
		                                             projectPage.getContent(),
		                                             buildPageInfo(projectPage)));
	}

	/**
	 * Lấy projects theo manager
	 */
	@GetMapping("/manager/{managerId}")
	public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjectsByManager(@PathVariable UUID managerId,
	                                                                               @RequestParam(defaultValue = "0") int page,
	                                                                               @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<ProjectResponse> projectPage = projectService.getProjectsByManager(managerId, pageable);

		return ResponseEntity. ok(ApiResponse.success("Projects retrieved successfully",
		                                              projectPage.getContent(),
		                                              buildPageInfo(projectPage)));
	}

	/**
	 * Lấy public projects
	 */
	@GetMapping("/public")
	public ResponseEntity<ApiResponse<List<ProjectResponse>>> getPublicProjects(@RequestParam(defaultValue = "0") int page,
	                                                                            @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<ProjectResponse> projectPage = projectService. getPublicProjects(pageable);

		return ResponseEntity.ok(ApiResponse.success("Public projects retrieved successfully",
		                                             projectPage.getContent(),
		                                             buildPageInfo(projectPage)));
	}

	/**
	 * Tìm kiếm projects
	 */
	@GetMapping("/search")
	public ResponseEntity<ApiResponse<List<ProjectResponse>>> searchProjects(@RequestParam String keyword,
	                                                                         @RequestParam(defaultValue = "0") int page,
	                                                                         @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<ProjectResponse> projectPage = projectService.searchProjects(keyword, pageable);

		return ResponseEntity.ok(ApiResponse.success("Search completed",
		                                             projectPage.getContent(),
		                                             buildPageInfo(projectPage)));
	}

	// ==================== PHASE ENDPOINTS ====================

	/**
	 * Lấy danh sách phases của project
	 */
	@GetMapping("/{projectId}/phases")
	public ResponseEntity<ApiResponse<List<ProjectPhaseResponse>>> getPhasesByProjectId(@PathVariable Integer projectId) {
		List<ProjectPhaseResponse> phases = projectService.getPhasesByProjectId(projectId);
		return ResponseEntity.ok(ApiResponse.success(phases));
	}

	/**
	 * Thêm phase vào project
	 */
	@PostMapping("/{projectId}/phases")
	public ResponseEntity<ApiResponse<ProjectPhaseResponse>> addPhaseToProject(@PathVariable Integer projectId,
	                                                                           @Valid @RequestBody ProjectPhaseRequest request) {

		ProjectPhaseResponse response = projectService.addPhaseToProject(projectId, request);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(ApiResponse.success("Phase added successfully", response));
	}

	/**
	 * Cập nhật phase
	 */
	@PutMapping("/{projectId}/phases/{phaseId}")
	public ResponseEntity<ApiResponse<ProjectPhaseResponse>> updatePhase(@PathVariable Integer projectId,
	                                                                     @PathVariable Integer phaseId,
	                                                                     @Valid @RequestBody ProjectPhaseRequest request) {

		ProjectPhaseResponse response = projectService.updatePhase(projectId, phaseId, request);
		return ResponseEntity. ok(ApiResponse.success("Phase updated successfully", response));
	}

	/**
	 * Xóa phase
	 */
	@DeleteMapping("/{projectId}/phases/{phaseId}")
	public ResponseEntity<ApiResponse<Void>> deletePhase(@PathVariable Integer projectId, @PathVariable Integer phaseId) {
		projectService.deletePhase(projectId, phaseId);
		return ResponseEntity.ok(ApiResponse.success("Phase deleted successfully", null));
	}

	// ==================== RECALCULATE ENDPOINTS ====================

	/**
	 * Tính toán lại các trường computed của một project
	 */
	@PostMapping("/{projectId}/recalculate")
	public ResponseEntity<ApiResponse<ProjectResponse>> recalculateProject(@PathVariable Integer projectId) {
		projectService.recalculateProjectFields(projectId);
		ProjectResponse response = projectService.getProjectById(projectId);
		return ResponseEntity.ok(ApiResponse.success("Project recalculated successfully", response));
	}

	/**
	 * Tính toán lại tất cả projects (Admin only)
	 */
	@PostMapping("/recalculate-all")
	public ResponseEntity<ApiResponse<Void>> recalculateAllProjects() {
		projectService. recalculateAllProjects();
		return ResponseEntity.ok(ApiResponse.success("All projects recalculated successfully", null));
	}

	// ==================== PRIVATE METHODS ====================
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
