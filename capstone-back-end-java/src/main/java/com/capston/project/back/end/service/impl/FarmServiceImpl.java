package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.entity.Farm;
import com.capston.project.back.end.entity.TreeBatch;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.TreeBatchRepository;
import com.capston.project.back.end.request.FarmRequest;
import com.capston.project.back.end.response.FarmResponse;
import com.capston.project.back.end.service.FarmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FarmServiceImpl implements FarmService {

	private final FarmRepository farmRepository;
	private final TreeBatchRepository treeBatchRepository;

	@Override
	@Transactional
	public FarmResponse createFarm(FarmRequest request, UUID createdBy) {
		log.info("Creating farm: {}", request.getName());

		String code = generateFarmCode();

		Farm farm = Farm.builder()
				.code(code)
				.name(request.getName())
				.description(request.getDescription())
				.location(request.getLocation())
				.latitude(request.getLatitude())
				.longitude(request.getLongitude())
				.area(request.getArea())
				.usableArea(request.getUsableArea())
				.soilType(request.getSoilType())
				.climateZone(request.getClimateZone())
				.avgRainfall(request.getAvgRainfall())
				.avgTemperature(request.getAvgTemperature())
				.farmStatus(FarmStatus.ACTIVE)
				.createdBy(createdBy)
				.build();

		// Auto-fetch coordinates if location is provided but lat/long are null
		if (farm.getLocation() != null && (farm.getLatitude() == null || farm.getLongitude() == null)) {
			fetchAndSetCoordinates(farm);
		}

		Farm saved = farmRepository.save(farm);
		log.info("Created farm with code: {}", saved.getCode());

		return mapToFarmResponse(saved);
	}

	@Override
	public FarmResponse getFarmById(Integer id) {
		Farm farm = farmRepository.findById(id)
				.filter(f -> f.getDeletedAt() == null)
				.orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));
		return mapToFarmResponse(farm);
	}

	@Override
	public FarmResponse getFarmByCode(String code) {
		Farm farm = farmRepository.findByCode(code)
				.filter(f -> f.getDeletedAt() == null)
				.orElseThrow(() -> new ResourceNotFoundException("Farm", "code", code));
		return mapToFarmResponse(farm);
	}

	@Override
	@Transactional
	public FarmResponse updateFarm(Integer id, FarmRequest request) {
		log.info("Updating farm: {}", id);

		Farm farm = farmRepository.findById(id)
				.filter(f -> f.getDeletedAt() == null)
				.orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));

		if (request.getName() != null)
			farm.setName(request.getName());
		if (request.getDescription() != null)
			farm.setDescription(request.getDescription());
		if (request.getLocation() != null)
			farm.setLocation(request.getLocation());
		if (request.getLatitude() != null)
			farm.setLatitude(request.getLatitude());
		if (request.getLongitude() != null)
			farm.setLongitude(request.getLongitude());
		if (request.getArea() != null)
			farm.setArea(request.getArea());
		if (request.getUsableArea() != null)
			farm.setUsableArea(request.getUsableArea());
		if (request.getSoilType() != null)
			farm.setSoilType(request.getSoilType());
		if (request.getClimateZone() != null)
			farm.setClimateZone(request.getClimateZone());
		if (request.getAvgRainfall() != null)
			farm.setAvgRainfall(request.getAvgRainfall());
		if (request.getAvgTemperature() != null)
			farm.setAvgTemperature(request.getAvgTemperature());
		if (request.getFarmStatus() != null)
			farm.setFarmStatus(request.getFarmStatus());

		// Re-fetch coordinates if location changed and lat/long are null
		if (request.getLocation() != null && (farm.getLatitude() == null || farm.getLongitude() == null)) {
			fetchAndSetCoordinates(farm);
		}

		Farm saved = farmRepository.save(farm);
		return mapToFarmResponse(saved);
	}

	@Override
	@Transactional
	public void deleteFarm(Integer id) {
		log.info("Soft deleting farm: {}", id);

		Farm farm = farmRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));

		farm.setDeletedAt(java.time.OffsetDateTime.now());
		farm.setFarmStatus(FarmStatus.CLOSED);
		farmRepository.save(farm);
	}

	@Override
	public Page<FarmResponse> getAllFarms(Pageable pageable) {
		return farmRepository.findByDeletedAtIsNull(pageable).map(this::mapToFarmResponse);
	}

	@Override
	public Page<FarmResponse> getFarmsByStatus(FarmStatus status, Pageable pageable) {
		return farmRepository.findByFarmStatusAndDeletedAtIsNull(status, pageable).map(this::mapToFarmResponse);
	}

	@Override
	public List<FarmResponse> searchFarms(String keyword) {
		return farmRepository.searchByKeyword(keyword).stream()
				.map(this::mapToFarmResponse)
				.collect(Collectors.toList());
	}

	// ==================== HELPER METHODS ====================

	private String generateFarmCode() {
		return "FARM-" + System.currentTimeMillis();
	}

	private void fetchAndSetCoordinates(Farm farm) {
		log.info("Fetching coordinates for location: {}", farm.getLocation());
		// Mock API call simulation
		// In production, this would call Google Maps API or similar
		if (farm.getLocation().toLowerCase().contains("ho chi minh")) {
			farm.setLatitude(new java.math.BigDecimal("10.762622"));
			farm.setLongitude(new java.math.BigDecimal("106.660172"));
		} else if (farm.getLocation().toLowerCase().contains("da lat")) {
			farm.setLatitude(new java.math.BigDecimal("11.940419"));
			farm.setLongitude(new java.math.BigDecimal("108.458313"));
		} else {
			// Random coordinates if unknown
			farm.setLatitude(new java.math.BigDecimal("10.0")
					.add(new java.math.BigDecimal(Math.random()).multiply(new java.math.BigDecimal("5.0"))));
			farm.setLongitude(new java.math.BigDecimal("105.0")
					.add(new java.math.BigDecimal(Math.random()).multiply(new java.math.BigDecimal("5.0"))));
		}
	}

	private FarmResponse mapToFarmResponse(Farm farm) {
		// Get tree batches count
		List<TreeBatch> batches = treeBatchRepository.findActiveByFarmId(farm.getId());
		int totalBatches = batches.size();
		int totalTrees = batches.stream().mapToInt(TreeBatch::getQuantityPlanted).sum();

		return FarmResponse.builder()
				.id(farm.getId())
				.code(farm.getCode())
				.name(farm.getName())
				.description(farm.getDescription())
				.location(farm.getLocation())
				.latitude(farm.getLatitude())
				.longitude(farm.getLongitude())
				.area(farm.getArea())
				.usableArea(farm.getUsableArea())
				.soilType(farm.getSoilType())
				.climateZone(farm.getClimateZone())
				.avgRainfall(farm.getAvgRainfall())
				.avgTemperature(farm.getAvgTemperature())
				.farmStatus(farm.getFarmStatus())
				.totalBatches(totalBatches)
				.totalTrees(totalTrees)
				.createdAt(farm.getCreatedAt())
				.updatedAt(farm.getUpdatedAt())
				.build();
	}
}
