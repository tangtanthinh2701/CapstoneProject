package com.capston.project.back.end.service;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.request.ProjectPhaseRequest;
import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.response.ProjectPhaseResponse;
import com.capston.project.back.end.response.ProjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
	ProjectResponse createProject(ProjectRequest request, UUID managerId);

	ProjectResponse getProjectById(Integer id);

	ProjectResponse getProjectByCode(String code);

	ProjectResponse updateProject(Integer id, ProjectRequest request);

	void deleteProject(Integer id);

	// Project List & Search
	Page<ProjectResponse> getAllProjects(Pageable pageable);

	Page<ProjectResponse> getProjectsByStatus(ProjectStatus status, Pageable pageable);

	Page<ProjectResponse> getProjectsByManager(UUID managerId, Pageable pageable);

	Page<ProjectResponse> getPublicProjects(Pageable pageable);

	Page<ProjectResponse> searchProjects(String keyword, Pageable pageable);

	// Phase Management
	ProjectPhaseResponse addPhaseToProject(Integer projectId, ProjectPhaseRequest request);

	ProjectPhaseResponse updatePhase(Integer projectId, Integer phaseId, ProjectPhaseRequest request);

	void deletePhase(Integer projectId, Integer phaseId);

	List<ProjectPhaseResponse> getPhasesByProjectId(Integer projectId);

	// Recalculate computed fields
	void recalculateProjectFields(Integer projectId);

	void recalculateAllProjects();

	// Farm and Partner Assignment
	void assignFarmToProject(Integer projectId, Integer farmId, java.util.UUID assignedBy);

	void removeFarmFromProject(Integer projectId, Integer farmId);

	void addPartnerToProject(Integer projectId, java.util.UUID partnerUserId, String partnerRole,
			java.math.BigDecimal contributionAmount, String notes);

	void removePartnerFromProject(Integer projectId, java.util.UUID partnerUserId);
}
