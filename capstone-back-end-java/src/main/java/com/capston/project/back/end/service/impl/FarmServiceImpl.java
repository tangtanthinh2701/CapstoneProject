package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.entity.Farm;
import com.capston.project.back.end.entity.TreeBatch;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.exception.UnauthorizedException;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.TreeBatchRepository;
import com.capston.project.back.end.request.FarmRequest;
import com.capston.project.back.end.response.FarmResponse;
import com.capston.project.back.end.service.FarmService;
import com.capston.project.back.end.service.GeocodingService;
import com.capston.project.back.end.service.WeatherApiService;
import com.capston.project.back.end.service.SoilApiService;
import com.capston.project.back.end.util.SecurityUtils;
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
	private final GeocodingService geocodingService;
	private final WeatherApiService weatherApiService;
	private final SoilApiService soilApiService;
	private final SecurityUtils securityUtils;

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
				.area(request.getArea())
				.usableArea(request.getUsableArea())
				.farmStatus(request.getFarmStatus())
				.createdBy(createdBy)
				.build();

		// Auto-fetch coordinates if location is provided
		if (farm.getLocation() != null) {
			fetchAndSetCoordinates(farm);
		}

		// Auto-fetch environment data from APIs
		if (farm.getLatitude() != null && farm.getLongitude() != null) {
			fetchAndSetEnvironmentData(farm);
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

		Farm farm = farmRepository.findById(id).filter(f -> f.getDeletedAt() == null)
				.orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));

		// Role Check: Only owner or ADMIN can update
		if (!securityUtils.isAdmin() && !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
			throw new UnauthorizedException("You do not have permission to update this farm");
		}

		boolean addressChanged = updateBasicFields(farm, request);

		// Re-fetch coordinates and environment data if address changed
		if (addressChanged) {
			fetchAndSetCoordinates(farm);
			fetchAndSetEnvironmentData(farm);
		}

		Farm saved = farmRepository.save(farm);
		return mapToFarmResponse(saved);
	}

	private boolean updateBasicFields(Farm farm, FarmRequest request) {
		if (request.getName() != null)
			farm.setName(request.getName());
		if (request.getDescription() != null)
			farm.setDescription(request.getDescription());
		if (request.getArea() != null)
			farm.setArea(request.getArea());
		if (request.getUsableArea() != null)
			farm.setUsableArea(request.getUsableArea());
		if (request.getFarmStatus() != null)
			farm.setFarmStatus(request.getFarmStatus());

		if (request.getLocation() != null && !request.getLocation().equals(farm.getLocation())) {
			farm.setLocation(request.getLocation());
			return true;
		}

		return false;
	}

	@Override
	@Transactional
	public void deleteFarm(Integer id) {
		log.info("Soft deleting farm: {}", id);

		Farm farm = farmRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));

		// Role Check: Only owner or ADMIN can delete
		if (!securityUtils.isAdmin() && !farm.getCreatedBy().equals(securityUtils.getCurrentUserId())) {
			throw new UnauthorizedException("You do not have permission to delete this farm");
		}

		farm.setDeletedAt(java.time.OffsetDateTime.now());
		farm.setFarmStatus(FarmStatus.CLOSED);
		farmRepository.save(farm);
	}

	@Override
	public Page<FarmResponse> getAllFarms(Pageable pageable) {
		return farmRepository.findByDeletedAtIsNull(pageable)
				.map(this::mapToFarmResponse);
	}

	@Override
	public Page<FarmResponse> getFarmsByStatus(FarmStatus status, Pageable pageable) {
		if (securityUtils.isAdmin()) {
			return farmRepository.findByFarmStatusAndDeletedAtIsNull(status, pageable)
					.map(this::mapToFarmResponse);
		} else {
			return farmRepository
					.findByFarmStatusAndCreatedByAndDeletedAtIsNull(status, securityUtils.getCurrentUserId(), pageable)
					.map(this::mapToFarmResponse);
		}
	}

	@Override
	public List<FarmResponse> searchFarms(String keyword) {
		if (securityUtils.isAdmin()) {
			return farmRepository.searchByKeyword(keyword)
					.stream()
					.map(this::mapToFarmResponse)
					.collect(Collectors.toList());
		} else {
			return farmRepository.searchByKeywordAndCreatedBy(keyword, securityUtils.getCurrentUserId())
					.stream()
					.map(this::mapToFarmResponse)
					.collect(Collectors.toList());
		}
	}

	@Override
	public Page<FarmResponse> getMyFarms(UUID userId, Pageable pageable) {
		return farmRepository.findByCreatedByAndDeletedAtIsNull(userId, pageable)
				.map(this::mapToFarmResponse);
	}

	// ==================== HELPER METHODS ====================

	private String generateFarmCode() {
		return "FARM-" + System.currentTimeMillis();
	}

	/**
	 * Fetch coordinates from address using Geocoding API
	 */
	private void fetchAndSetCoordinates(Farm farm) {
		log.info("Fetching coordinates for location: {}", farm.getLocation());

		try {
			GeocodingService.Coordinates coordinates = geocodingService.getCoordinates(farm.getLocation());
			farm.setLatitude(coordinates.latitude());
			farm.setLongitude(coordinates.longitude());
			// Update location with formatted address if available
			if (coordinates.formattedAddress() != null) {
				farm.setLocation(coordinates.formattedAddress());
			}
			log.info("Successfully geocoded: {} -> {}, {}", farm.getLocation(), coordinates.latitude(),
					coordinates.longitude());
		} catch (Exception e) {
			log.error("Failed to geocode address: {}", farm.getLocation(), e);
			// Don't throw exception, let admin input coordinates manually
		}
	}

	/**
	 * Fetch environment data (soil, climate) from external APIs
	 */
	private void fetchAndSetEnvironmentData(Farm farm) {
		log.info("Fetching environment data for coordinates: {}, {}", farm.getLatitude(), farm.getLongitude());

		try {
			// Get soil data
			SoilApiService.SoilData soilData = soilApiService.getSoilProperties(farm.getLatitude(),
					farm.getLongitude());
			farm.setSoilType(soilData.soilType());

			// Get climate data
			WeatherApiService.ClimateData climateData = weatherApiService.getClimateData(farm.getLatitude(),
					farm.getLongitude());
			farm.setClimateZone(climateData.climateZone());
			farm.setAvgRainfall(climateData.avgRainfall());
			farm.setAvgTemperature(climateData.avgTemperature());

			log.info("Successfully fetched environment data: soil={}, climate={}", soilData.soilType(),
					climateData.climateZone());
		} catch (Exception e) {
			log.error("Failed to fetch environment data for coordinates: {}, {}", farm.getLatitude(),
					farm.getLongitude(), e);
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
				.createdBy(farm.getCreatedBy())
				.createdAt(farm.getCreatedAt())
				.updatedAt(farm.getUpdatedAt())
				.build();
	}
}
