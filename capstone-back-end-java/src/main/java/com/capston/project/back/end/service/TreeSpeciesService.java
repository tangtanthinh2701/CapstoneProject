package com.capston.project.back.end.service;

import com.capston.project.back.end.request.CarbonCalculatorRequest;
import com.capston.project.back.end.request.TreeSpeciesRequest;

import com.capston.project.back.end.response.CarbonCalculatorResponse;
import com.capston.project.back.end.response.TreeSpeciesResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TreeSpeciesService {
	TreeSpeciesResponse create(TreeSpeciesRequest request);

	List<TreeSpeciesResponse> createBulk(List<TreeSpeciesRequest> requests);

	TreeSpeciesResponse getById(Integer id);

	TreeSpeciesResponse update(Integer id, TreeSpeciesRequest request);

	void delete(Integer id);

	Page<TreeSpeciesResponse> getAll(Pageable pageable);

	Page<TreeSpeciesResponse> search(String keyword, Pageable pageable);

	List<TreeSpeciesResponse> getAllActive();

	List<TreeSpeciesResponse> getTopByCarbonAbsorption(int limit);

	CarbonCalculatorResponse estimateCarbonSequestration(CarbonCalculatorRequest request);
}
