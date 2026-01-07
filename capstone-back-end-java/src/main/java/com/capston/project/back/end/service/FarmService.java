package com.capston.project.back.end.service;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.request.FarmRequest;
import com.capston.project.back.end.request.TreesFarmRequest;
import com.capston.project.back.end.response.AvailableTreesResponse;
import com.capston.project.back.end.response.FarmResponse;
import com.capston.project.back.end.response.TreesFarmResponse;
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

	Page<FarmResponse> searchFarms(String keyword, Pageable pageable);

	// Trees in Farm
	TreesFarmResponse addTreesToFarm(TreesFarmRequest request, UUID managerId);

	TreesFarmResponse updateTreesFarm(Integer treesFarmId, TreesFarmRequest request);

	void removeTreesFromFarm(Integer treesFarmId);

	List<TreesFarmResponse> getTreesByFarmId(Integer farmId);

	// Available Trees for Sale
	List<AvailableTreesResponse> getAvailableTreesForSale();

	List<AvailableTreesResponse> getAvailableTreesBySpecies(Integer speciesId);

	List<AvailableTreesResponse> getAvailableTreesByFarm(Integer farmId);

	// Recalculate
	void recalculateFarmStats(Integer farmId);

	void recalculateAllFarmStats();
}
