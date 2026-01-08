package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.entity.Partner;
import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.ProjectPartner;
import com.capston.project.back.end.exception.DuplicateResourceException;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.PartnerRepository;
import com.capston.project.back.end.repository.ProjectPartnerRepository;
import com.capston.project.back.end.repository.ProjectRepository;
import com.capston.project.back.end.request.PartnerRequest;
import com.capston.project.back.end.request.ProjectPartnerRequest;
import com.capston.project.back.end.response.PartnerResponse;
import com.capston.project.back.end.response.ProjectPartnerResponse;
import com.capston.project.back.end.service.PartnerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PartnerServiceImpl implements PartnerService {

	private final PartnerRepository partnerRepository;
	private final ProjectPartnerRepository projectPartnerRepository;
	private final ProjectRepository projectRepository;

	// ==================== PARTNER CRUD ====================

	@Override
	@Transactional
	public PartnerResponse createPartner(PartnerRequest request) {
		log.info("Creating partner: {}", request.getPartnerName());

		if (partnerRepository.existsByPartnerNameIgnoreCase(request. getPartnerName())) {
			throw new DuplicateResourceException("Partner with name '" + request.getPartnerName() + "' already exists");
		}

		Partner partner = Partner.builder()
		                         .partnerName(request.getPartnerName())
		                         .imgUrl(request.getImgUrl())
		                         .build();

		Partner saved = partnerRepository.save(partner);
		log.info("Created partner with id: {}", saved.getId());

		return mapToPartnerResponse(saved);
	}

	@Override
	public PartnerResponse getPartnerById(Integer id) {
		Partner partner = partnerRepository.findByIdWithProjects(id)
		                                   .orElseThrow(() -> new ResourceNotFoundException("Partner", "id", id));
		return mapToPartnerResponseWithProjects(partner);
	}

	@Override
	@Transactional
	public PartnerResponse updatePartner(Integer id, PartnerRequest request) {
		log.info("Updating partner:  {}", id);

		Partner partner = partnerRepository.findById(id)
		                                   .orElseThrow(() -> new ResourceNotFoundException("Partner", "id", id));

		if (request.getPartnerName() != null &&
		    !request.getPartnerName().equalsIgnoreCase(partner.getPartnerName())) {
			if (partnerRepository.existsByPartnerNameIgnoreCase(request.getPartnerName())) {
				throw new DuplicateResourceException("Partner with name '" + request.getPartnerName() + "' already exists");
			}
			partner.setPartnerName(request.getPartnerName());
		}

		if (request.getImgUrl() != null) {
			partner.setImgUrl(request.getImgUrl());
		}

		Partner saved = partnerRepository.save(partner);
		return mapToPartnerResponse(saved);
	}

	@Override
	@Transactional
	public void deletePartner(Integer id) {
		log.info("Deleting partner: {}", id);

		Partner partner = partnerRepository.findById(id)
		                                   .orElseThrow(() -> new ResourceNotFoundException("Partner", "id", id));

		Long projectCount = projectPartnerRepository.countProjectsByPartnerId(id);
		if (projectCount > 0) {
			throw new IllegalStateException("Cannot delete partner with " + projectCount + " associated projects");
		}

		partnerRepository.delete(partner);
		log.info("Deleted partner: {}", id);
	}

	@Override
	public Page<PartnerResponse> getAllPartners(Pageable pageable) {
		return partnerRepository.findAll(pageable)
		                        .map(this::mapToPartnerResponse);
	}

	@Override
	public Page<PartnerResponse> searchPartners(String keyword, Pageable pageable) {
		return partnerRepository.searchByKeyword(keyword, pageable)
		                        .map(this:: mapToPartnerResponse);
	}

	@Override
	public List<PartnerResponse> getAllPartnersSimple() {
		return partnerRepository.findAll().stream()
		                        .map(this::mapToPartnerResponse)
		                        .collect(Collectors.toList());
	}

	// ==================== PROJECT-PARTNER ASSOCIATION ====================

	@Override
	@Transactional
	public ProjectPartnerResponse addPartnerToProject(ProjectPartnerRequest request) {
		log.info("Adding partner {} to project {}", request.getPartnerId(), request.getProjectId());

		Project project = projectRepository.findById(request.getProjectId())
		                                   .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

		Partner partner = partnerRepository.findById(request.getPartnerId())
		                                   .orElseThrow(() -> new ResourceNotFoundException("Partner", "id", request.getPartnerId()));

		if (projectPartnerRepository.existsByProjectIdAndPartnerId(request.getProjectId(), request.getPartnerId())) {
			throw new DuplicateResourceException("Partner is already associated with this project");
		}

		ProjectPartner projectPartner = ProjectPartner.builder()
		                                              .project(project)
		                                              .partner(partner)
		                                              .role(request. getRole())
		                                              .notes(request.getNotes())
		                                              .build();

		ProjectPartner saved = projectPartnerRepository.save(projectPartner);
		log.info("Added partner {} to project {}", request.getPartnerId(), request.getProjectId());

		return mapToProjectPartnerResponse(saved);
	}

	@Override
	@Transactional
	public ProjectPartnerResponse updateProjectPartner(Integer id, ProjectPartnerRequest request) {
		log.info("Updating project-partner association:  {}", id);

		ProjectPartner projectPartner = projectPartnerRepository.findById(id)
		                                                        .orElseThrow(() -> new ResourceNotFoundException("ProjectPartner", "id", id));

		if (request.getRole() != null) {
			projectPartner.setRole(request. getRole());
		}
		if (request.getNotes() != null) {
			projectPartner.setNotes(request. getNotes());
		}

		ProjectPartner saved = projectPartnerRepository.save(projectPartner);
		return mapToProjectPartnerResponse(saved);
	}

	@Override
	@Transactional
	public void removePartnerFromProject(Integer projectId, Integer partnerId) {
		log.info("Removing partner {} from project {}", partnerId, projectId);

		ProjectPartner projectPartner = projectPartnerRepository. findByProjectIdAndPartnerId(projectId, partnerId)
		                                                        .orElseThrow(() -> new ResourceNotFoundException("ProjectPartner",
		                                                                                                         "projectId=" + projectId + ", partnerId", partnerId));

		projectPartnerRepository.delete(projectPartner);
		log.info("Removed partner {} from project {}", partnerId, projectId);
	}

	@Override
	public List<ProjectPartnerResponse> getPartnersByProjectId(Integer projectId) {
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}

		return projectPartnerRepository.findByProjectIdWithDetails(projectId).stream()
		                               .map(this::mapToProjectPartnerResponse)
		                               .collect(Collectors. toList());
	}

	@Override
	public List<ProjectPartnerResponse> getProjectsByPartnerId(Integer partnerId) {
		if (!partnerRepository. existsById(partnerId)) {
			throw new ResourceNotFoundException("Partner", "id", partnerId);
		}

		return projectPartnerRepository.findByPartnerIdWithDetails(partnerId).stream()
		                               .map(this::mapToProjectPartnerResponse)
		                               .collect(Collectors.toList());
	}

	@Override
	public List<PartnerResponse> getAvailablePartnersForProject(Integer projectId) {
		if (!projectRepository.existsById(projectId)) {
			throw new ResourceNotFoundException("Project", "id", projectId);
		}

		return partnerRepository.findPartnersNotInProject(projectId).stream()
		                        .map(this::mapToPartnerResponse)
		                        .collect(Collectors. toList());
	}

	// ==================== HELPER METHODS ====================

	private PartnerResponse mapToPartnerResponse(Partner partner) {
		return PartnerResponse.builder()
		                      .id(partner.getId())
		                      .partnerName(partner.getPartnerName())
		                      .imgUrl(partner.getImgUrl())
		                      .build();
	}

	private PartnerResponse mapToPartnerResponseWithProjects(Partner partner) {
		List<PartnerResponse. ProjectPartnerInfo> projectInfos = new ArrayList<>();

		if (partner.getProjectPartners() != null) {
			projectInfos = partner.getProjectPartners().stream()
			                      . map(pp -> PartnerResponse.ProjectPartnerInfo.builder()
			                                                                    .projectId(pp.getProject().getId())
			                                                                    .projectName(pp.getProject().getName())
			                                                                    .projectCode(pp.getProject().getCode())
			                                                                    .role(pp. getRole())
			                                                                    .build())
			                      .collect(Collectors.toList());
		}

		return PartnerResponse. builder()
		                      .id(partner.getId())
		                      .partnerName(partner.getPartnerName())
		                      .imgUrl(partner.getImgUrl())
		                      .totalProjects(projectInfos.size())
		                      .projects(projectInfos)
		                      .build();
	}

	private ProjectPartnerResponse mapToProjectPartnerResponse(ProjectPartner pp) {
		return ProjectPartnerResponse.builder()
		                             .id(pp.getId())
		                             .projectId(pp.getProject() != null ? pp.getProject().getId() : null)
		                             .projectName(pp.getProject() != null ? pp.getProject().getName() : null)
		                             .projectCode(pp.getProject() != null ? pp.getProject().getCode() : null)
		                             .partnerId(pp.getPartner() != null ? pp.getPartner().getId() : null)
		                             .partnerName(pp.getPartner() != null ? pp.getPartner().getPartnerName() : null)
		                             .partnerImgUrl(pp.getPartner() != null ? pp.getPartner().getImgUrl() : null)
		                             .role(pp.getRole())
		                             .notes(pp.getNotes())
		                             .createdAt(pp.getCreatedAt())
		                             .build();
	}
}
