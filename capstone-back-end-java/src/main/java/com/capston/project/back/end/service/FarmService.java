package com.capston.project.back.end.service;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.request.FarmRequest;
import com.capston.project.back.end.response.FarmResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface FarmService {
	FarmResponse createFarm(FarmRequest request, UUID managerId);

	FarmResponse getFarmById(Integer id);

	FarmResponse getFarmByCode(String code);

	FarmResponse updateFarm(Integer id, FarmRequest request);

	void deleteFarm(Integer id);

	// Farm List
	Page<FarmResponse> getAllFarms(Pageable pageable);

	Page<FarmResponse> getFarmsByStatus(FarmStatus status, Pageable pageable);

	List<FarmResponse> searchFarms(String keyword);
}
