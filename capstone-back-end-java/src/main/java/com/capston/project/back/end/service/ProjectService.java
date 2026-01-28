package com.capston.project.back.end.service;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.request.ProjectPhaseRequest;
import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.response.ProjectPhaseResponse;
import com.capston.project.back.end.response.ProjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

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

	Page<ProjectResponse> searchProjects(String keyword, Pageable pageable);

	// Phase Management
	ProjectPhaseResponse addPhaseToProject(Integer projectId, ProjectPhaseRequest request);

	ProjectPhaseResponse updatePhase(Integer projectId, Integer phaseId, ProjectPhaseRequest request);

	void deletePhase(Integer projectId, Integer phaseId);

	List<ProjectPhaseResponse> getPhasesByProjectId(Integer projectId);

	// Recalculate computed fields
	void recalculateProjectFields(Integer projectId);

	void recalculateAllProjects();

	// Partner Assignment
	void addPartnerToProject(Integer projectId, UUID partnerUserId, String partnerRole,
			BigDecimal contributionAmount, String notes);

	void removePartnerFromProject(Integer projectId, UUID partnerUserId);
}
