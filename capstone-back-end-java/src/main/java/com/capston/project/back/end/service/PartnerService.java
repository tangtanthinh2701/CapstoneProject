package com.capston.project.back.end.service;

import com.capston.project.back.end.request.PartnerRequest;
import com.capston.project.back.end.request.ProjectPartnerRequest;
import com.capston.project.back.end.response.PartnerResponse;
import com.capston.project.back.end.response.ProjectPartnerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PartnerService {
	PartnerResponse createPartner(PartnerRequest request);
	PartnerResponse getPartnerById(Integer id);
	PartnerResponse updatePartner(Integer id, PartnerRequest request);
	void deletePartner(Integer id);
	Page<PartnerResponse> getAllPartners(Pageable pageable);
	Page<PartnerResponse> searchPartners(String keyword, Pageable pageable);
	List<PartnerResponse> getAllPartnersSimple();

	// Project-Partner Association
	ProjectPartnerResponse addPartnerToProject(ProjectPartnerRequest request);
	ProjectPartnerResponse updateProjectPartner(Integer id, ProjectPartnerRequest request);
	void removePartnerFromProject(Integer projectId, Integer partnerId);
	List<ProjectPartnerResponse> getPartnersByProjectId(Integer projectId);
	List<ProjectPartnerResponse> getProjectsByPartnerId(Integer partnerId);
	List<PartnerResponse> getAvailablePartnersForProject(Integer projectId);
}
