package com.capston.project.back.end.service;

import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.request.ProjectFilterRequest;
import com.capston.project.back.end.response.ProjectListResponse;
import com.capston.project.back.end.response.ProjectResponse;
import com.capston.project.back.end.response.ProjectSummaryResponse;
import com.capston.project.back.end.response.generic.PageResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface ProjectService {
	ProjectResponse createProject(ProjectRequest request, UUID managerId);

	PageResponse<ProjectListResponse> getAllProjects(String name, String status, LocalDate fromDate, LocalDate toDate,
	                                                 int page, int size);

	PageResponse<ProjectListResponse> getPublicProjects(int page, int size);

	ProjectResponse getProjectById(Integer id);

	ProjectResponse updateProject(Integer id, ProjectRequest request);

	void deleteProject(Integer id);
}
