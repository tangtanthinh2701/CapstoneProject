package com.capston.project.back.end.controller;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.dtos.ProjectDTO;
import com.capston.project.back.end.repository.UserRepository;
import com.capston.project.back.end.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
	public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectDTO request,
	                                                     Authentication authentication) {
		UUID managerId = userRepository.findByUsername(authentication.getName())
		                               .orElseThrow(() -> new RuntimeException("User không tồn tại"))
		                               .getId();
		ProjectDTO response = projectService.createProject(request, managerId);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/get-projects")
	public ResponseEntity<Page<ProjectDTO>> getProjects(@RequestParam(required = false) String name,
	                                                    @RequestParam(required = false) String location,
	                                                    @RequestParam(required = false) ProjectStatus status,
	                                                    @RequestParam(required = false) Integer treeSpeciesId,
	                                                    @RequestParam(required = false)
	                                                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	                                                    LocalDate fromDate, @RequestParam(required = false)
	                                                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
	                                                    @RequestParam(defaultValue = "0") int page,
	                                                    @RequestParam(defaultValue = "20") int size) {
		Page<ProjectDTO> projects = projectService.getProjects(name, location, status, treeSpeciesId, fromDate, toDate, page, size);
		return ResponseEntity.ok(projects);
	}

	@GetMapping("/{id}")
	public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Integer id) {
		ProjectDTO response = projectService.getProjectById(id);
		return ResponseEntity.ok(response);
	}
}
