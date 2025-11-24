package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.PhaseStatus;
import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.dtos.ProjectDTO;
import com.capston.project.back.end.dtos.ProjectPhaseDTO;
import com.capston.project.back.end.dtos.TreeSpeciesDTO;
import com.capston.project.back.end.models.Project;
import com.capston.project.back.end.models.ProjectPhase;
import com.capston.project.back.end.models.TreeSpecies;
import com.capston.project.back.end.models.TreeSpeciesOnPhase;
import com.capston.project.back.end.repository.ProjectPhaseRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.repository.TreeSpeciesOnPhaseRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
	private final ProjectRepository projectRepository;
	private final TreeSpeciesRepository treeSpeciesRepository;
	private final ProjectPhaseRepository projectPhaseRepository;
	private final TreeSpeciesOnPhaseRepository treeSpeciesOnPhaseRepository;


	@Override
	public ProjectDTO createProject(ProjectDTO dto, UUID managerId) {
		// Validate tổng số cây
		int totalFromSpecies = dto.getTreeSpecies()
		                          .stream()
		                          .mapToInt(TreeSpeciesDTO::getQuantityPlanned)
		                          .sum();

		if (totalFromSpecies != dto.getTotalTreesPlanned()) {
			throw new RuntimeException("Tổng số cây không khớp");
		}

		if (dto.getUsableArea() != null && dto.getUsableArea().compareTo(dto.getArea()) > 0) {
			throw new RuntimeException("Diện tích sử dụng không được lớn hơn tổng diện tích");
		}

		// Tạo project
		Project project = Project.builder()
		                         .name(dto.getName())
		                         .description(dto.getDescription())
		                         .locationText(dto.getLocationText())
		                         .latitude(dto.getLatitude())
		                         .longitude(dto.getLongitude())
		                         .area(dto.getArea())
		                         .areaUnit(dto.getAreaUnit())
		                         .usableArea(dto.getUsableArea())
		                         .plantingDate(dto.getPlantingDate())
		                         .totalTreesPlanned(dto.getTotalTreesPlanned())
		                         .totalTreesActual(0)
		                         .plantingDensity(dto.getPlantingDensity())
		                         .status(ProjectStatus.PLANNING)
		                         .managerId(managerId)
		                         .partnerOrganizations(dto.getPartnerOrganizations())
		                         .isPublic(true)
		                         .phases(new ArrayList<>())
		                         .build();

		project = projectRepository.save(project);

		// Tạo phase
		ProjectPhase phase = ProjectPhase.builder()
		                                 .project(project)
		                                 .phaseNumber(1)
		                                 .phaseName(dto.getPhaseName())
		                                 .phaseStatus(PhaseStatus.PLANNING)
		                                 .startDate(dto.getPlantingDate())
		                                 .expectedDurationDays(dto.getExpectedDurationDays())
		                                 .budget(dto.getBudget())
		                                 .actualCost(BigDecimal.ZERO)
		                                 .createdBy(managerId)
		                                 .build();

		project.addPhase(phase);
		phase = projectPhaseRepository.save(phase);

		// Thêm tree species
		final ProjectPhase savedPhase = phase;
		for (TreeSpeciesDTO tsDto : dto.getTreeSpecies()) {
			TreeSpecies treeSpecies = treeSpeciesRepository.findById(tsDto.getId())
			                                               .orElseThrow(() -> new RuntimeException("Không tìm thấy loại cây"));

			TreeSpeciesOnPhase tsop = TreeSpeciesOnPhase.builder()
			                                            .phase(savedPhase)
			                                            .treeSpecies(treeSpecies)
			                                            .quantityPlanned(tsDto.getQuantityPlanned())
			                                            .quantityActual(0)
			                                            .quantityDied(0)
			                                            .costPerTree(tsDto.getCostPerTree())
			                                            .plantingCost(tsDto.getPlantingCost())
			                                            .maintenanceCostYearly(tsDto.getMaintenanceCostYearly())
			                                            .notes(tsDto.getNotes())
			                                            .build();

			treeSpeciesOnPhaseRepository.save(tsop);
		}

		return mapToDTO(projectRepository.save(project));
	}

	@Override
	public Page<ProjectDTO> getProjects(String name, String location, ProjectStatus status, Integer treeSpeciesId,
	                                    LocalDate fromDate, LocalDate toDate, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Page<Project> projects = projectRepository.searchProjects(name, location, status, treeSpeciesId, fromDate, toDate, pageable);
		return projects.map(this::mapToListDTO);
	}

	@Override
	public ProjectDTO getProjectById(Integer id) {
		Project project = projectRepository.findById(id)
		                                   .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
		return mapToDTO(project);
	}

	private ProjectDTO mapToDTO(Project p) {
		List<ProjectPhaseDTO> phaseDTOs = p.getPhases().stream().map(phase -> {
			List<TreeSpeciesOnPhase> tsopList = treeSpeciesOnPhaseRepository.findByPhaseId(phase.getId());
			List<TreeSpeciesDTO> tsDTOs = tsopList.stream()
			                                      .map(tsop -> TreeSpeciesDTO.builder()
			                                                                          .id(tsop.getId())
			                                                                          .name(tsop.getTreeSpecies().getName())
			                                                                          .scientificName(tsop.getTreeSpecies().getScientificName())
			                                                                          .carbonAbsorptionRate(tsop.getTreeSpecies().getCarbonAbsorptionRate())
			                                                                          .quantityPlanned(tsop.getQuantityPlanned())
			                                                                          .quantityActual(tsop.getQuantityActual())
			                                                                          .quantityDied(tsop.getQuantityDied())
			                                                                          .costPerTree(tsop.getCostPerTree())
			                                                                          .plantingCost(tsop.getPlantingCost())
			                                                                          .maintenanceCostYearly(tsop.getMaintenanceCostYearly())
			                                                                          .notes(tsop.getNotes()).build())
			                                      .collect(Collectors.toList());

			return ProjectPhaseDTO.builder()
			                      .id(phase.getId())
			                      .phaseNumber(phase.getPhaseNumber())
			                      .phaseName(phase.getPhaseName())
			                      .description(phase.getDescription())
			                      .phaseStatus(phase.getPhaseStatus())
			                      .startDate(phase.getStartDate())
			                      .endDate(phase.getEndDate())
			                      .expectedDurationDays(phase.getExpectedDurationDays())
			                      .actualDurationDays(phase.getActualDurationDays())
			                      .budget(phase.getBudget())
			                      .actualCost(phase.getActualCost())
			                      .treeSpecies(tsDTOs)
			                      .build();
		}).collect(Collectors.toList());

		return ProjectDTO.builder()
		                 .id(p.getId())
		                 .code(p.getCode())
		                 .name(p.getName())
		                 .description(p.getDescription())
		                 .locationText(p.getLocationText())
		                 .latitude(p.getLatitude())
		                 .longitude(p.getLongitude())
		                 .area(p.getArea())
		                 .areaUnit(p.getAreaUnit())
		                 .usableArea(p.getUsableArea())
		                 .plantingDate(p.getPlantingDate())
		                 .totalTreesPlanned(p.getTotalTreesPlanned())
		                 .totalTreesActual(p.getTotalTreesActual())
		                 .plantingDensity(p.getPlantingDensity())
		                 .status(p.getStatus())
		                 .managerId(p.getManagerId())
		                 .partnerOrganizations(p.getPartnerOrganizations())
		                 .isPublic(p.getIsPublic())
		                 .createdAt(p.getCreatedAt())
		                 .updatedAt(p.getUpdatedAt())
		                 .phases(phaseDTOs)
		                 .build();
	}

	private ProjectDTO mapToListDTO(Project p) {
		int totalTreeSpecies = p.getPhases().stream().mapToInt(
				phase -> treeSpeciesOnPhaseRepository.findByPhaseId(phase.getId()).size()).sum();

		return ProjectDTO.builder()
		                 .id(p.getId())
		                 .code(p.getCode())
		                 .name(p.getName())
		                 .locationText(p.getLocationText())
		                 .area(p.getArea())
		                 .areaUnit(p.getAreaUnit())
		                 .totalTreesPlanned(p.getTotalTreesPlanned())
		                 .totalTreesActual(p.getTotalTreesActual())
		                 .status(p.getStatus())
		                 .plantingDate(p.getPlantingDate())
		                 .numberOfPhases(p.getPhases().size())
		                 .numberOfTreeSpecies(totalTreeSpecies)
		                 .build();
	}
}
