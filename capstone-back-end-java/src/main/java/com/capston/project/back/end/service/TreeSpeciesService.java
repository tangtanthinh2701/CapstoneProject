package com.capston.project.back.end.service;

import com.capston.project.back.end.request.TreeSpeciesRequest;

import com.capston.project.back.end.response.TreeSpeciesListResponse;
import com.capston.project.back.end.response.TreeSpeciesResponse;
import com.capston.project.back.end.response.generic.PageResponse;

public interface TreeSpeciesService {
	TreeSpeciesResponse createTreeSpecies(TreeSpeciesRequest request);
	TreeSpeciesResponse updateTreeSpecies(Integer id, TreeSpeciesRequest request);
	TreeSpeciesResponse getTreeSpeciesById(Integer id);
	PageResponse<TreeSpeciesListResponse> getAllTreeSpecies(String name, String growthRate, Boolean isActive, int page, int size);
	PageResponse<TreeSpeciesListResponse> getActiveTreeSpecies(int page, int size);
	void deleteTreeSpecies(Integer id);
	void hardDeleteTreeSpecies(Integer id);
}
