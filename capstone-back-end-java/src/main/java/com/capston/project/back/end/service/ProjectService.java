package com.capston.project.back.end.service;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.dtos.ProjectDTO;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.UUID;

public interface ProjectService {
	ProjectDTO createProject(ProjectDTO dto, UUID managerId);

	Page<ProjectDTO> getProjects(String name, String location, ProjectStatus status, Integer treeSpeciesId, LocalDate fromDate, LocalDate toDate, int page, int size);

	ProjectDTO getProjectById(Integer id);
}
