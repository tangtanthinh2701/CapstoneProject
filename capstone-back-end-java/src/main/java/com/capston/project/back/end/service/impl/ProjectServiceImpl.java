package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.request.ProjectRequest;
import com.capston.project.back.end.request.TreeSpeciesOnPhaseRequest;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.ProjectPhase;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.entity.TreeSpeciesOnPhase;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.response.ProjectListResponse;
import com.capston.project.back.end.response.ProjectPhaseResponse;
import com.capston.project.back.end.response.ProjectResponse;
import com.capston.project.back.end.response.TreeSpeciesOnPhaseResponse;
import com.capston.project.back.end.response.TreeSpeciesSimpleResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import com.capston.project.back.end.service.ProjectService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
	private final ProjectRepository projectRepository;
	private final TreeSpeciesRepository treeSpeciesRepository;
	private final ModelMapper modelMapper;


	@Override
	@Transactional
	public ProjectResponse createProject(ProjectRequest request, UUID managerId) {
		String code = generateProjectCode();
		Project project = Project.builder()
		                         .code(code)
		                         .name(request.getName())
		                         .description(request.getDescription())
		                         .locationText(request.getLocationText())
		                         .latitude(request.getLatitude())
		                         .longitude(request.getLongitude())
		                         .area(request.getArea())
		                         .areaUnit(request.getAreaUnit())
		                         .usableArea(request.getUsableArea())
		                         .plantingDate(request.getPlantingDate())
		                         .totalTreesPlanned(request.getTotalTreesPlanned())
		                         .totalTreesActual(0)
		                         .plantingDensity(request.getPlantingDensity())
		                         .projectStatus(request.getStatus())
		                         .managerId(managerId)
		                         .partnerOrganizations(request.getPartnerOrganizations())
		                         .isPublic(request.getIsPublic())
		                         .phases(new ArrayList<>())
		                         .build();

		// Thu thập toàn bộ speciesId từ request
		Set<Integer> speciesIds = request.getPhases()
		                                 .stream()
		                                 .flatMap(p -> p.getTreeSpecies().stream())
		                                 .map(TreeSpeciesOnPhaseRequest::getTreeSpeciesId)
		                                 .collect(Collectors.toSet());

		// Truy vấn database lấy toàn bộ Treespecies
		Map<Integer, TreeSpecies> speciesMap = treeSpeciesRepository.findAllById(speciesIds)
		                                                            .stream()
		                                                            .collect(Collectors.toMap(TreeSpecies::getId, s -> s));

		// Tạo phases + speciesOnPhase
		List<ProjectPhase> phases = request.getPhases()
		                                   .stream()
		                                   .map(phaseReq -> {ProjectPhase phase = ProjectPhase.builder()
		                                                                                      .project(project)
		                                                                                      .phaseNumber(phaseReq.getPhaseNumber())
		                                                                                      .phaseName(phaseReq.getPhaseName())
		                                                                                      .description(phaseReq.getDescription())
		                                                                                      .phaseStatus(phaseReq.getPhaseStatus())
		                                                                                      .startDate(phaseReq.getStartDate())
		                                                                                      .endDate(phaseReq.getEndDate())
		                                                                                      .expectedDurationDays(phaseReq.getExpectedDurationDays())
		                                                                                      .budget(phaseReq.getBudget())
		                                                                                      .treeSpeciesOnPhases(new ArrayList<>()).build();

			List<TreeSpeciesOnPhase> tsOnPhaseList = phaseReq.getTreeSpecies()
			                                                 .stream()
			                                                 .map(tsReq -> {TreeSpecies treeSpecies = speciesMap.get(tsReq.getTreeSpeciesId());
				if (treeSpecies == null) {
					throw new ResourceNotFoundException("TreeSpecies not found id = " + tsReq.getTreeSpeciesId());
				}
				return TreeSpeciesOnPhase.builder()
				                         .phase(phase)
				                         .treeSpecies(treeSpecies)
				                         .quantityPlanned(tsReq.getQuantityPlanned())
				                         .quantityActual(0)
				                         .quantityDied(0)
				                         .costPerTree(tsReq.getCostPerTree())
				                         .plantingCost(tsReq.getPlantingCost())
				                         .maintenanceCostYearly(tsReq.getMaintenanceCostYearly())
				                         .notes(tsReq.getNotes())
				                         .build();
			}).collect(Collectors.toList());
			phase.getTreeSpeciesOnPhases().addAll(tsOnPhaseList);
			return phase;
		}).collect(Collectors.toList());

		project.getPhases().addAll(phases);

		Project savedProject = projectRepository.save(project);
		return convertToResponse(savedProject);
	}

	@Override
	public PageResponse<ProjectListResponse> getAllProjects(String name, String status, LocalDate fromDate,
	                                                        LocalDate toDate, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

		Specification<Project> spec = (root, query, cb) -> cb.conjunction();

		if (name != null && !name.isEmpty()) {
			spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
		}

		if (status != null && !status.isEmpty()) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("projectStatus"), status));
		}

		if (fromDate != null) {
			spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("plantingDate"), fromDate));
		}

		if (toDate != null) {
			spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("plantingDate"), toDate));
		}

		Page<Project> projectPage = projectRepository.findAll(spec, pageable);

		return PageResponse.<ProjectListResponse>builder().content(
				                   projectPage.getContent().stream().map(this::convertToListResponse).collect(Collectors.toList()))
		                   .pageNumber(projectPage.getNumber()).pageSize(projectPage.getSize()).totalElements(
						projectPage.getTotalElements()).totalPages(projectPage.getTotalPages()).last(
						projectPage.isLast()).build();
	}

	@Override
	public PageResponse<ProjectListResponse> getPublicProjects(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<Project> projectPage = projectRepository.findAllPublicProjects(pageable);

		return PageResponse.<ProjectListResponse>builder().content(
				                   projectPage.getContent().stream().map(this::convertToListResponse).collect(Collectors.toList()))
		                   .pageNumber(projectPage.getNumber()).pageSize(projectPage.getSize()).totalElements(
						projectPage.getTotalElements()).totalPages(projectPage.getTotalPages()).last(
						projectPage.isLast()).build();
	}


	@Override
	public ProjectResponse getProjectById(Integer id) {
		Project project = projectRepository.findById(id).orElseThrow(
				() -> new ResourceNotFoundException("Project not found with id: " + id));

		return convertToResponse(project);
	}

	@Override
	public ProjectResponse updateProject(Integer id, ProjectRequest request) {
		Project project = projectRepository.findById(id).orElseThrow(
				() -> new ResourceNotFoundException("Project not found with id: " + id));
		project.setName(request.getName());
		project.setDescription(request.getDescription());
		project.setLocationText(request.getLocationText());
		project.setLatitude(request.getLatitude());
		project.setLongitude(request.getLongitude());
		project.setArea(request.getArea());
		project.setAreaUnit(request.getAreaUnit());
		project.setUsableArea(request.getUsableArea());
		project.setPlantingDate(request.getPlantingDate());
		project.setTotalTreesPlanned(request.getTotalTreesPlanned());
		project.setPlantingDensity(request.getPlantingDensity());
		project.setProjectStatus(request.getStatus());
		project.setPartnerOrganizations(request.getPartnerOrganizations());
		project.setIsPublic(request.getIsPublic());

		Project savedProject = projectRepository.save(project);
		return convertToResponse(savedProject);
	}

	@Override
	public void deleteProject(Integer id) {
		if (!projectRepository.existsById(id)) {
			throw new ResourceNotFoundException("Project not found with ID: " + id);
		}

		projectRepository.deleteById(id);
	}

	private String generateProjectCode() {
		String prefix = "PRJ-";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
		String code = prefix + timestamp;

		while (projectRepository.existsByCode(code)) {
			timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
			code = prefix + timestamp;
		}
		return code;
	}

	private ProjectResponse convertToResponse(Project project) {
		ProjectResponse response = modelMapper.map(project, ProjectResponse.class);
		if (project.getPhases() != null && !project.getPhases().isEmpty()) {
			response.setPhases(
					project.getPhases().stream().map(this::convertPhaseToResponse).collect(Collectors.toList()));
		}
		return response;
	}

	private ProjectPhaseResponse convertPhaseToResponse(ProjectPhase phase) {
		ProjectPhaseResponse response = modelMapper.map(phase, ProjectPhaseResponse.class);

		if (phase.getTreeSpeciesOnPhases() != null && !phase.getTreeSpeciesOnPhases().isEmpty()) {
			response.setTreeSpecies(
					phase.getTreeSpeciesOnPhases().stream().map(this::convertTreeSpeciesOnPhaseToResponse)
					     .collect(Collectors.toList()));
		}

		return response;
	}

	private TreeSpeciesOnPhaseResponse convertTreeSpeciesOnPhaseToResponse(TreeSpeciesOnPhase ts) {
		TreeSpeciesOnPhaseResponse response = modelMapper.map(ts, TreeSpeciesOnPhaseResponse.class);
		TreeSpeciesSimpleResponse treeSpeciesResponse = modelMapper.map(ts.getTreeSpecies(),
		                                                                TreeSpeciesSimpleResponse.class);
		response.setTreeSpecies(treeSpeciesResponse);
		return response;
	}

	private ProjectListResponse convertToListResponse(Project project) {
		return modelMapper.map(project, ProjectListResponse.class);
	}

}
