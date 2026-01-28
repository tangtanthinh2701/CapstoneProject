package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.PhaseStatus;
import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.ProjectPartner;
import com.capston.project.back.end.entity.ProjectPhase;
import com.capston.project.back.end.exception.DuplicateResourceException;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.ProjectPartnerRepository;
import com.capston.project.back.end.repository.ProjectPhaseRepository;
import com.capston.project.back.end.request.ProjectPhaseRequest;
import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.util.SecurityUtils;
import com.capston.project.back.end.response.ProjectPhaseResponse;
import com.capston.project.back.end.response.ProjectResponse;
import com.capston.project.back.end.service.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProjectServiceImpl implements ProjectService {
	private final ProjectRepository projectRepository;
	private final ProjectPhaseRepository projectPhaseRepository;
	private final ProjectPartnerRepository projectPartnerRepository;
	private final ModelMapper modelMapper;
	private final SecurityUtils securityUtils;

	@Override
	public ProjectResponse createProject(ProjectRequest request, UUID managerId) {
		log.info("Creating new project: {}", request.getName());

		// Tạo project entity
		Project project = modelMapper.map(request, Project.class);

		// Generate unique code
		project.setCode(generateProjectCode());

		project.setManagerId(managerId);

		// Set default status nếu null
		if (project.getProjectStatus() == null) {
			project.setProjectStatus(ProjectStatus.PLANNING);
		}

		// Xử lý phases nếu có
		if (request.getPhases() != null && !request.getPhases().isEmpty()) {
			for (ProjectPhaseRequest phaseRequest : request.getPhases()) {
				phaseRequest.setCreatedBy(managerId);
				ProjectPhase phase = mapToPhaseEntity(phaseRequest);
				project.addPhase(phase);
			}
		}

		// Save project (cascade save phases)
		Project savedProject = projectRepository.save(project);

		// Recalculate computed fields từ phases
		savedProject.recalculateFromPhases();
		savedProject = projectRepository.save(savedProject);

		log.info("Created project with code: {}", savedProject.getCode());
		return mapToProjectResponse(savedProject);
	}

	@Override
	public ProjectResponse getProjectById(Integer id) {
		Project project = projectRepository.findByIdWithPhases(id)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
		return mapToProjectResponse(project);
	}

	@Override
	public ProjectResponse getProjectByCode(String code) {
		Project project = projectRepository.findByCodeWithPhases(code)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "code", code));
		return mapToProjectResponse(project);
	}

	@Override
	public ProjectResponse updateProject(Integer id, ProjectRequest request) {
		log.info("Updating project with id: {}", id);

		Project project = projectRepository.findByIdWithPhases(id)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

		// Check ownership for non-admin users
		if (!securityUtils.isAdmin() && !project.getManagerId().equals(securityUtils.getCurrentUserId())) {
			throw new org.springframework.security.access.AccessDeniedException(
					"You do not have permission to update this project");
		}

		// Update basic fields (không update computed fields)
		if (request.getName() != null) {
			project.setName(request.getName());
		}
		if (request.getDescription() != null) {
			project.setDescription(request.getDescription());
		}
		if (request.getProjectStatus() != null) {
			project.setProjectStatus(request.getProjectStatus());
		}

		// Xử lý phases nếu có trong request
		if (request.getPhases() != null) {
			updateProjectPhases(project, request.getPhases());
		}

		// Recalculate và save
		project.recalculateFromPhases();
		Project savedProject = projectRepository.save(project);

		log.info("Updated project with code: {}", savedProject.getCode());
		return mapToProjectResponse(savedProject);
	}

	@Override
	public void deleteProject(Integer id) {
		log.info("Deleting project with id: {}", id);

		Project project = projectRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

		// Check ownership for non-admin users
		if (!securityUtils.isAdmin() && !project.getManagerId().equals(securityUtils.getCurrentUserId())) {
			throw new org.springframework.security.access.AccessDeniedException(
					"You do not have permission to delete this project");
		}

		projectRepository.deleteById(id);
		log.info("Deleted project with id: {}", id);
	}

	@Override
	public Page<ProjectResponse> getAllProjects(Pageable pageable) {
		Page<Integer> idsPage;

		if (securityUtils.isAdmin()) {
			idsPage = projectRepository.findAllProjectIds(pageable);
		} else {
			idsPage = projectRepository.findProjectIdsByManager(securityUtils.getCurrentUserId(), pageable);
		}

		if (idsPage.isEmpty()) {
			return Page.empty(pageable);
		}

		List<Project> projects = projectRepository.findAllWithPhasesByIds(idsPage.getContent());

		Map<Integer, Project> projectMap = projects.stream()
				.collect(Collectors.toMap(Project::getId, p -> p));

		List<ProjectResponse> responses = idsPage.getContent()
				.stream()
				.map(projectMap::get)
				.filter(Objects::nonNull)
				.map(this::mapToProjectResponse)
				.collect(Collectors.toList());

		return new PageImpl<>(responses, pageable, idsPage.getTotalElements());
	}

	@Override
	public Page<ProjectResponse> getProjectsByStatus(ProjectStatus status, Pageable pageable) {
		return projectRepository.findByProjectStatus(status, pageable)
				.map(this::mapToProjectResponseWithoutPhases);
	}

	@Override
	public Page<ProjectResponse> getProjectsByManager(UUID managerId, Pageable pageable) {
		return projectRepository.findByManagerId(managerId, pageable)
				.map(this::mapToProjectResponseWithoutPhases);
	}

	@Override
	public Page<ProjectResponse> searchProjects(String keyword, Pageable pageable) {
		if (securityUtils.isAdmin()) {
			return projectRepository.searchByKeyword(keyword, pageable)
					.map(this::mapToProjectResponseWithoutPhases);
		} else {
			return projectRepository.searchByKeywordAndManager(keyword, securityUtils.getCurrentUserId(), pageable)
					.map(this::mapToProjectResponseWithoutPhases);
		}
	}

	@Override
	public ProjectPhaseResponse addPhaseToProject(Integer projectId, ProjectPhaseRequest request) {
		log.info("Adding phase to project:  {}", projectId);

		Project project = projectRepository.findByIdWithPhases(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

		// Check ownership for non-admin users
		if (!securityUtils.isAdmin() && !project.getManagerId().equals(securityUtils.getCurrentUserId())) {
			throw new org.springframework.security.access.AccessDeniedException(
					"You do not have permission to manage phases for this project");
		}

		// Check duplicate phase order
		if (projectPhaseRepository.existsByProjectIdAndPhaseNumber(projectId, request.getPhaseNumber())) {
			throw new DuplicateResourceException(
					String.format("Phase number %d already exists in project %d",
							request.getPhaseNumber(), projectId));
		}

		ProjectPhase phase = mapToPhaseEntity(request);
		project.addPhase(phase);

		// Save và recalculate
		projectRepository.save(project);
		project.recalculateFromPhases();
		projectRepository.save(project);

		log.info("Added phase number {} to project {}", phase.getPhaseNumber(), projectId);

		return mapToPhaseResponse(phase);
	}

	@Override
	public ProjectPhaseResponse updatePhase(Integer projectId, Integer phaseId, ProjectPhaseRequest request) {
		log.info("Updating phase {} in project {}", phaseId, projectId);

		Project project = projectRepository.findByIdWithPhases(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

		// Check ownership for non-admin users
		if (!securityUtils.isAdmin() && !project.getManagerId().equals(securityUtils.getCurrentUserId())) {
			throw new org.springframework.security.access.AccessDeniedException(
					"You do not have permission to manage phases for this project");
		}

		ProjectPhase phase = projectPhaseRepository.findById(phaseId)
				.orElseThrow(() -> new ResourceNotFoundException("ProjectPhase", "id", phaseId));

		// Verify phase belongs to project
		if (!phase.getProject().getId().equals(projectId)) {
			throw new IllegalArgumentException("Phase does not belong to this project");
		}

		// Check duplicate phase order (nếu thay đổi)
		if (request.getPhaseNumber() != null &&
				!request.getPhaseNumber().equals(phase.getPhaseNumber()) &&
				projectPhaseRepository.existsByProjectIdAndPhaseNumber(projectId, request.getPhaseNumber())) {
			throw new DuplicateResourceException(
					String.format("Phase number %d already exists in project %d",
							request.getPhaseNumber(), projectId));
		}

		// Update fields
		updatePhaseFromRequest(phase, request);

		// Save phase
		projectPhaseRepository.save(phase);

		// Recalculate project
		project.recalculateFromPhases();
		projectRepository.save(project);

		log.info("Updated phase {} in project {}", phaseId, projectId);
		return mapToPhaseResponse(phase);
	}

	@Override
	public void deletePhase(Integer projectId, Integer phaseId) {
		log.info("Deleting phase {} from project {}", phaseId, projectId);

		Project project = projectRepository.findByIdWithPhases(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

		// Check ownership for non-admin users
		if (!securityUtils.isAdmin() && !project.getManagerId().equals(securityUtils.getCurrentUserId())) {
			throw new org.springframework.security.access.AccessDeniedException("You do not have permission to manage phases for this project");
		}

		ProjectPhase phase = projectPhaseRepository.findById(phaseId)
				.orElseThrow(() -> new ResourceNotFoundException("ProjectPhase", "id", phaseId));

		// Verify phase belongs to project
		if (!phase.getProject().getId().equals(projectId)) {
			throw new IllegalArgumentException("Phase does not belong to this project");
		}

		project.removePhase(phase);
		projectPhaseRepository.delete(phase);

		// Recalculate project
		project.recalculateFromPhases();
		projectRepository.save(project);

		log.info("Deleted phase {} from project {}", phaseId, projectId);
	}

	@Override
	public List<ProjectPhaseResponse> getPhasesByProjectId(Integer projectId) {
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}

		return projectPhaseRepository.findByProjectIdOrderByPhaseNumberAsc(projectId)
				.stream()
				.map(this::mapToPhaseResponse)
				.collect(Collectors.toList());
	}

	@Override
	public void recalculateProjectFields(Integer projectId) {
		log.info("Recalculating fields for project:  {}", projectId);

		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

		// Check ownership for non-admin users
		if (!securityUtils.isAdmin() && !project.getManagerId().equals(securityUtils.getCurrentUserId())) {
			throw new org.springframework.security.access.AccessDeniedException(
					"You do not have permission to recalculate this project");
		}

		BigDecimal budget = projectPhaseRepository.sumBudgetByProjectId(projectId);
		BigDecimal targetCarbon = projectPhaseRepository.sumTargetCarbonByProjectId(projectId);
		BigDecimal currentCarbon = projectPhaseRepository.sumCurrentCarbonByProjectId(projectId);

		projectRepository.updateComputedFields(projectId, budget, targetCarbon, currentCarbon);
		log.info("Recalculated project {}:  budget={}, target={}, current={}",
				projectId, budget, targetCarbon, currentCarbon);
	}

	@Override
	public void recalculateAllProjects() {
		log.info("Starting recalculation of all projects");

		List<Integer> projectIds = projectRepository.findAllProjectIds();

		for (Integer projectId : projectIds) {
			try {
				recalculateProjectFields(projectId);
			} catch (Exception e) {
				log.error("Failed to recalculate project {}:  {}", projectId, e.getMessage());
			}
		}

		log.info("Completed recalculation of {} projects", projectIds.size());
	}

	private String generateProjectCode() {
		String prefix = "PRJ-";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
		String code = prefix + timestamp;

		while (projectRepository.existsByCode(code)) {
			// Add small delay to ensure unique timestamp
			try {
				Thread.sleep(1);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
			timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
			code = prefix + timestamp;
		}
		return code;
	}

	private ProjectPhase mapToPhaseEntity(ProjectPhaseRequest request) {
		ProjectPhase phase = ProjectPhase.builder()
				.phaseNumber(request.getPhaseNumber())
				.phaseName(request.getPhaseName())
				.description(request.getDescription())
				.phaseStatus(request.getPhaseStatus() != null ? request.getPhaseStatus() : PhaseStatus.PLANNING)
				.plannedStartDate(request.getPlannedStartDate())
				.plannedEndDate(request.getPlannedEndDate())
				.actualStartDate(request.getActualStartDate())
				.actualEndDate(request.getActualEndDate())
				.budget(request.getBudget() != null ? request.getBudget() : BigDecimal.ZERO)
				.targetCo2Kg(request.getTargetCo2Kg() != null ? request.getTargetCo2Kg() : BigDecimal.ZERO)
				.notes(request.getNotes())
				.createdBy(request.getCreatedBy())
				.actualCost(BigDecimal.ZERO)
				.actualCo2Kg(BigDecimal.ZERO)
				.build();
		return phase;
	}

	private void updatePhaseFromRequest(ProjectPhase phase, ProjectPhaseRequest request) {
		if (request.getPhaseNumber() != null) {
			phase.setPhaseNumber(request.getPhaseNumber());
		}
		if (request.getPhaseName() != null) {
			phase.setPhaseName(request.getPhaseName());
		}
		if (request.getDescription() != null) {
			phase.setDescription(request.getDescription());
		}
		if (request.getPhaseStatus() != null) {
			phase.setPhaseStatus(request.getPhaseStatus());
		}
		if (request.getPlannedStartDate() != null) {
			phase.setPlannedStartDate(request.getPlannedStartDate());
		}
		if (request.getPlannedEndDate() != null) {
			phase.setPlannedEndDate(request.getPlannedEndDate());
		}
		if (request.getActualStartDate() != null) {
			phase.setActualStartDate(request.getActualStartDate());
		}
		if (request.getActualEndDate() != null) {
			phase.setActualEndDate(request.getActualEndDate());
		}
		if (request.getBudget() != null) {
			phase.setBudget(request.getBudget());
		}
		if (request.getTargetCo2Kg() != null) {
			phase.setTargetCo2Kg(request.getTargetCo2Kg());
		}
		if (request.getNotes() != null) {
			phase.setNotes(request.getNotes());
		}
		if (request.getCreatedBy() != null) {
			phase.setCreatedBy(request.getCreatedBy());
		}
		// Không update actualCost và actualCo2Kg - computed fields
	}

	private void updateProjectPhases(Project project, List<ProjectPhaseRequest> phaseRequests) {
		// Tạo map của existing phases by id
		var existingPhasesById = project.getPhases().stream()
				.filter(p -> p.getId() != null)
				.collect(Collectors.toMap(ProjectPhase::getId, p -> p));

		List<ProjectPhase> newPhases = new ArrayList<>();

		for (ProjectPhaseRequest request : phaseRequests) {
			if (request.getId() != null && existingPhasesById.containsKey(request.getId())) {
				// Update existing phase
				ProjectPhase existingPhase = existingPhasesById.get(request.getId());
				updatePhaseFromRequest(existingPhase, request);
				newPhases.add(existingPhase);
				existingPhasesById.remove(request.getId());
			} else {
				// Create new phase
				ProjectPhase newPhase = mapToPhaseEntity(request);
				newPhase.setProject(project);
				newPhases.add(newPhase);
			}
		}

		// Remove phases không còn trong request
		for (ProjectPhase phaseToRemove : existingPhasesById.values()) {
			project.removePhase(phaseToRemove);
		}

		// Clear và add all phases
		project.getPhases().clear();
		for (ProjectPhase phase : newPhases) {
			project.addPhase(phase);
		}
	}

	private ProjectResponse mapToProjectResponse(Project project) {
		List<ProjectPhaseResponse> phaseResponses = project.getPhases() != null ? project.getPhases().stream()
				.map(this::mapToPhaseResponse)
				.collect(Collectors.toList()) : new ArrayList<>();

		long completedPhases = project.getPhases() != null ? project.getPhases().stream()
				.filter(p -> p.getPhaseStatus() == PhaseStatus.COMPLETED)
				.count() : 0;

		return ProjectResponse.builder()
				.id(project.getId())
				.code(project.getCode())
				.name(project.getName())
				.description(project.getDescription())
				.projectStatus(project.getProjectStatus())
				.managerId(project.getManagerId())
				.totalBudget(project.getTotalBudget())
				.targetCo2Kg(project.getTargetCo2Kg())
				.actualCo2Kg(project.getActualCo2Kg())
				.createdAt(project.getCreatedAt())
				.updatedAt(project.getUpdatedAt())
				.phases(phaseResponses)
				.totalPhases(phaseResponses.size())
				.completedPhases(completedPhases)
				.build();
	}

	private ProjectResponse mapToProjectResponseWithoutPhases(Project project) {
		return ProjectResponse.builder()
				.id(project.getId())
				.code(project.getCode())
				.name(project.getName())
				.description(project.getDescription())
				.projectStatus(project.getProjectStatus())
				.managerId(project.getManagerId())
				.totalBudget(project.getTotalBudget())
				.targetCo2Kg(project.getTargetCo2Kg())
				.actualCo2Kg(project.getActualCo2Kg())
				.createdAt(project.getCreatedAt())
				.updatedAt(project.getUpdatedAt())
				.build();
	}

	private ProjectPhaseResponse mapToPhaseResponse(ProjectPhase phase) {
		return ProjectPhaseResponse.builder()
				.id(phase.getId())
				.projectId(phase.getProjectId())
				.phaseNumber(phase.getPhaseNumber())
				.phaseName(phase.getPhaseName())
				.description(phase.getDescription())
				.phaseStatus(phase.getPhaseStatus())
				.plannedStartDate(phase.getPlannedStartDate())
				.plannedEndDate(phase.getPlannedEndDate())
				.actualStartDate(phase.getActualStartDate())
				.actualEndDate(phase.getActualEndDate())
				.budget(phase.getBudget())
				.actualCost(phase.getActualCost())
				.targetCo2Kg(phase.getTargetCo2Kg())
				.actualCo2Kg(phase.getActualCo2Kg())
				.notes(phase.getNotes())
				.createdBy(phase.getCreatedBy())
				.createdAt(phase.getCreatedAt())
				.updatedAt(phase.getUpdatedAt())
				.build();
	}

	@Override
	public void addPartnerToProject(Integer projectId, UUID partnerUserId, String partnerRole,
			BigDecimal contributionAmount, String notes) {
		log.info("Adding partner {} to project {} with role {}", partnerUserId, projectId, partnerRole);
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}
		com.capston.project.back.end.common.PartnerRole roleEnum = com.capston.project.back.end.common.PartnerRole
				.valueOf(partnerRole);
		ProjectPartner partner = ProjectPartner.builder()
				.projectId(projectId)
				.partnerUserId(partnerUserId)
				.partnerRole(roleEnum)
				.contributionAmount(contributionAmount)
				.notes(notes)
				.build();
		projectPartnerRepository.save(partner);
	}

	@Override
	public void removePartnerFromProject(Integer projectId, UUID partnerUserId) {
		log.info("Removing partner {} from project {}", partnerUserId, projectId);
		projectPartnerRepository.deleteByProjectIdAndPartnerUserId(projectId, partnerUserId);
	}
}
