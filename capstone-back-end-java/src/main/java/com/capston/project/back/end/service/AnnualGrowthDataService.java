package com.capston.project.back.end.service;

import com.capston.project.back.end.request.AnnualGrowthDataRequest;
import com.capston.project.back.end.response.AnnualGrowthDataResponse;

import java.util.List;
import java.util.UUID;

public interface AnnualGrowthDataService {
	AnnualGrowthDataResponse createOrUpdateGrowthData(AnnualGrowthDataRequest request, UUID recorderId);
	List<AnnualGrowthDataResponse> getGrowthDataByProject(Integer projectId);
	List<AnnualGrowthDataResponse> getGrowthDataByProjectAndYear(Integer projectId, Integer year);
}
