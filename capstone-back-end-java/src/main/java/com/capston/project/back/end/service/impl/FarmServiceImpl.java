package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.common.FarmStatus;
import com.capston.project.back.end.common.HealthStatus;
import com.capston.project.back.end.common.TreeStatus;
import com.capston.project.back.end.entity.Farm;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.entity.TreesFarm;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.FarmEnvironmentFactorRepository;
import com.capston.project.back.end.repository.FarmRepository;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.repository.TreesFarmRepository;
import com.capston.project.back.end.request.FarmRequest;
import com.capston.project.back.end.request.TreesFarmRequest;
import com.capston.project.back.end.response.AvailableTreesResponse;
import com.capston.project.back.end.response.FarmResponse;
import com.capston.project.back.end.response.TreesFarmResponse;
import com.capston.project.back.end.service.FarmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FarmServiceImpl implements FarmService {
	private final FarmRepository farmRepository;
	private final TreesFarmRepository treesFarmRepository;
	private final TreeSpeciesRepository treeSpeciesRepository;
	private final FarmEnvironmentFactorRepository environmentFactorRepository;

	@Override
	@Transactional
	public FarmResponse createFarm(FarmRequest request, UUID managerId) {
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
		                .farmStatus(request.getFarmStatus() != null ? request.getFarmStatus() : FarmStatus.ACTIVE)
		                .plantingDate(request.getPlantingDate())
		                .createdBy(managerId)
		                .totalTrees(0)
		                .aliveTrees(0)
		                .deadTrees(0)
		                .build();

		Farm saved = farmRepository.save(farm);
		log.info("Created farm with code: {}", saved.getCode());

		return mapToFarmResponse(saved);
	}

	@Override
	public FarmResponse getFarmById(Integer id) {
		Farm farm = farmRepository.findByIdWithTrees(id)
		                          .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));
		return mapToFarmResponseWithTrees(farm);
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

		if (request.getName() != null) {
			farm.setName(request.getName());
		}
		if (request.getDescription() != null) {
			farm.setDescription(request.getDescription());
		}
		if (request.getLocation() != null) {
			farm.setLocation(request.getLocation());
		}
		if (request.getLatitude() != null) {
			farm.setLatitude(request.getLatitude());
		}
		if (request.getLongitude() != null) {
			farm.setLongitude(request.getLongitude());
		}
		if (request.getArea() != null) {
			farm.setArea(request.getArea());
		}
		if (request.getUsableArea() != null) {
			farm.setUsableArea(request.getUsableArea());
		}
		if (request.getSoilType() != null) {
			farm.setSoilType(request.getSoilType());
		}
		if (request.getClimateZone() != null) {
			farm.setClimateZone(request.getClimateZone());
		}
		if (request.getAvgRainfall() != null) {
			farm.setAvgRainfall(request.getAvgRainfall());
		}
		if (request.getAvgTemperature() != null) {
			farm.setAvgTemperature(request.getAvgTemperature());
		}
		if (request.getFarmStatus() != null) {
			farm.setFarmStatus(request.getFarmStatus());
		}
		if (request.getPlantingDate() != null) {
			farm.setPlantingDate(request.getPlantingDate());
		}

		Farm saved = farmRepository.save(farm);
		return mapToFarmResponse(saved);
	}

	@Override
	@Transactional
	public void deleteFarm(Integer id) {
		log.info("Soft deleting farm: {}", id);

		Farm farm = farmRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Farm", "id", id));

		farm.setDeletedAt(OffsetDateTime.now());
		farm.setFarmStatus(FarmStatus.CLOSED);
		farmRepository.save(farm);
	}

	@Override
	public Page<FarmResponse> getAllFarms(Pageable pageable) {
		Page<Integer> idsPage = farmRepository.findAllActiveIds(pageable);

		if (idsPage.isEmpty()) {
			return Page.empty(pageable);
		}

		List<Farm> farms = farmRepository.findAllWithTreesByIds(idsPage.getContent());

		Map<Integer, Farm> farmMap = farms.stream().collect(Collectors.toMap(Farm::getId, f -> f));

		List<FarmResponse> responses = idsPage.getContent()
		                                      .stream()
		                                      .map(farmMap::get)
		                                      .filter(Objects::nonNull)
		                                      .map(this::mapToFarmResponseWithTrees)
		                                      .collect(Collectors.toList());

		return new PageImpl<>(responses, pageable, idsPage.getTotalElements());
	}

	@Override
	public Page<FarmResponse> getFarmsByStatus(FarmStatus status, Pageable pageable) {
		return farmRepository.findByStatus(status, pageable).map(this::mapToFarmResponse);
	}

	@Override
	public Page<FarmResponse> searchFarms(String keyword, Pageable pageable) {
		return farmRepository.searchByKeyword(keyword, pageable).map(this::mapToFarmResponse);
	}

	@Override
	@Transactional
	public TreesFarmResponse addTreesToFarm(TreesFarmRequest request, UUID managerId) {
		log.info("Adding trees to farm: {}", request.getFarmId());

		Farm farm = farmRepository.findById(request.getFarmId())
		                          .filter(f -> f.getDeletedAt() == null)
		                          .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", request.getFarmId()));

		TreeSpecies species = treeSpeciesRepository.findById(request.getTreeSpeciesId())
		                                           .filter(ts -> ts.getDeletedAt() == null)
		                                           .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies", "id", request.getTreeSpeciesId()));

		TreesFarm treesFarm = TreesFarm.builder()
		                               .farm(farm)
		                               .treeSpecies(species)
		                               .numberTrees(request.getNumberTrees())
		                               .availableTrees(request.getNumberTrees())
		                               .latitude(request.getLatitude())
		                               .longitude(request.getLongitude())
		                               .plantingDate(request.getPlantingDate())
		                               .currentAvgHeight(request.getCurrentAvgHeight() != null ? request.getCurrentAvgHeight() : BigDecimal.ZERO)
		                               .currentAvgTrunkDiameter(request.getCurrentAvgTrunkDiameter() != null ? request.getCurrentAvgTrunkDiameter() : BigDecimal.ZERO)
		                               .currentAvgCanopyDiameter(request.getCurrentAvgCanopyDiameter() != null ? request.getCurrentAvgCanopyDiameter() : BigDecimal.ZERO)
		                               .currentAvgHealthStatus(HealthStatus.HEALTHY).treeStatus(TreeStatus.ALIVE).totalCo2Absorbed(BigDecimal.ZERO)
		                               .createdBy(managerId)
		                               .build();

		TreesFarm saved = treesFarmRepository.save(treesFarm);

		// Recalculate farm stats
		recalculateFarmStats(farm.getId());

		log.info("Added {} trees (species: {}) to farm {}", request.getNumberTrees(), species.getName(),
		         farm.getCode());

		return mapToTreesFarmResponse(saved);
	}

	@Override
	@Transactional
	public TreesFarmResponse updateTreesFarm(Integer treesFarmId, TreesFarmRequest request) {
		log.info("Updating trees farm: {}", treesFarmId);

		TreesFarm treesFarm = treesFarmRepository.findByIdWithDetails(treesFarmId)
		                                         .orElseThrow(() -> new ResourceNotFoundException("TreesFarm", "id", treesFarmId));

		if (request.getNumberTrees() != null) {
			int diff = request.getNumberTrees() - treesFarm.getNumberTrees();
			treesFarm.setNumberTrees(request.getNumberTrees());
			treesFarm.setAvailableTrees(treesFarm.getAvailableTrees() + diff);
		}
		if (request.getLatitude() != null) {
			treesFarm.setLatitude(request.getLatitude());
		}
		if (request.getLongitude() != null) {
			treesFarm.setLongitude(request.getLongitude());
		}
		if (request.getPlantingDate() != null) {
			treesFarm.setPlantingDate(request.getPlantingDate());
		}
		if (request.getCurrentAvgHeight() != null) {
			treesFarm.setCurrentAvgHeight(request.getCurrentAvgHeight());
		}
		if (request.getCurrentAvgTrunkDiameter() != null) {
			treesFarm.setCurrentAvgTrunkDiameter(request.getCurrentAvgTrunkDiameter());
		}
		if (request.getCurrentAvgCanopyDiameter() != null) {
			treesFarm.setCurrentAvgCanopyDiameter(request.getCurrentAvgCanopyDiameter());
		}

		TreesFarm saved = treesFarmRepository.save(treesFarm);

		// Recalculate farm stats
		recalculateFarmStats(treesFarm.getFarmId());

		return mapToTreesFarmResponse(saved);
	}

	@Override
	@Transactional
	public void removeTreesFromFarm(Integer treesFarmId) {
		log.info("Removing trees from farm: {}", treesFarmId);

		TreesFarm treesFarm = treesFarmRepository.findById(treesFarmId)
		                                         .orElseThrow(() -> new ResourceNotFoundException("TreesFarm", "id", treesFarmId));

		Integer farmId = treesFarm.getFarmId();
		treesFarmRepository.delete(treesFarm);

		// Recalculate farm stats
		recalculateFarmStats(farmId);
	}

	@Override
	public List<TreesFarmResponse> getTreesByFarmId(Integer farmId) {
		if (!farmRepository.existsById(farmId)) {
			throw new ResourceNotFoundException("Farm", "id", farmId);
		}

		return treesFarmRepository.findByFarmIdWithSpecies(farmId)
		                          .stream()
		                          .map(this::mapToTreesFarmResponse)
		                          .collect(Collectors.toList());
	}

	// ==================== AVAILABLE TREES FOR SALE ====================

	@Override
	public List<AvailableTreesResponse> getAvailableTreesForSale() {
		return treesFarmRepository.findAvailableForSale()
		                          .stream()
		                          .map(this::mapToAvailableTreesResponse)
		                          .collect(Collectors.toList());
	}

	@Override
	public List<AvailableTreesResponse> getAvailableTreesBySpecies(Integer speciesId) {
		return treesFarmRepository.findAvailableBySpecies(speciesId)
		                          .stream()
		                          .map(this::mapToAvailableTreesResponse)
		                          .collect(Collectors.toList());
	}

	@Override
	public List<AvailableTreesResponse> getAvailableTreesByFarm(Integer farmId) {
		return treesFarmRepository.findAvailableByFarm(farmId)
		                          .stream()
		                          .map(this::mapToAvailableTreesResponse)
		                          .collect(Collectors.toList());
	}

	// ==================== RECALCULATE ====================

	@Override
	@Transactional
	public void recalculateFarmStats(Integer farmId) {
		log.info("Recalculating stats for farm: {}", farmId);

		Integer totalTrees = treesFarmRepository.sumTreesByFarmId(farmId);
		Integer aliveTrees = treesFarmRepository.sumAliveTreesByFarmId(farmId);
		Integer deadTrees = totalTrees - aliveTrees;

		farmRepository.updateTreeStats(farmId, totalTrees, aliveTrees, deadTrees);

		log.info("Farm {} stats:  total={}, alive={}, dead={}", farmId, totalTrees, aliveTrees, deadTrees);
	}

	@Override
	@Transactional
	public void recalculateAllFarmStats() {
		log.info("Recalculating all farm stats");

		List<Integer> farmIds = farmRepository.findAllActiveIdsForBatch();

		for (Integer farmId : farmIds) {
			try {
				recalculateFarmStats(farmId);
			} catch (Exception e) {
				log.error("Failed to recalculate farm {}: {}", farmId, e.getMessage());
			}
		}

		log.info("Completed recalculation of {} farms", farmIds.size());
	}

	// ==================== HELPER METHODS ====================

	private String generateFarmCode() {
		String prefix = "FARM-";
		String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
		String code = prefix + timestamp;

		while (farmRepository.existsByCode(code)) {
			try {
				Thread.sleep(1);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
			timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
			code = prefix + timestamp;
		}
		return code;
	}

	private FarmResponse mapToFarmResponse(Farm farm) {
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
		                   .totalTrees(farm.getTotalTrees())
		                   .aliveTrees(farm.getAliveTrees())
		                   .deadTrees(farm.getDeadTrees())
		                   .soilType(farm.getSoilType())
		                   .climateZone(farm.getClimateZone())
		                   .avgRainfall(farm.getAvgRainfall())
		                   .avgTemperature(farm.getAvgTemperature())
		                   .farmStatus(farm.getFarmStatus())
		                   .plantingDate(farm.getPlantingDate())
		                   .createdBy(farm.getCreatedBy())
		                   .createdAt(farm.getCreatedAt())
		                   .updatedAt(farm.getUpdatedAt())
		                   .build();
	}

	private FarmResponse mapToFarmResponseWithTrees(Farm farm) {
		List<TreesFarmResponse> treesFarmResponses = new ArrayList<>();
		BigDecimal totalEstimatedCarbon = BigDecimal.ZERO;
		BigDecimal totalAbsorbedCarbon = BigDecimal.ZERO;
		int availableForSale = 0;
		Set<Integer> speciesIds = new HashSet<>();

		if (farm.getTreesFarms() != null) {
			for (TreesFarm tf : farm.getTreesFarms()) {
				treesFarmResponses.add(mapToTreesFarmResponse(tf));
				totalEstimatedCarbon = totalEstimatedCarbon.add(tf.getTotalEstimatedCarbon());
				totalAbsorbedCarbon = totalAbsorbedCarbon.add(tf.getTotalCo2Absorbed() != null
				                                              ? tf.getTotalCo2Absorbed()
				                                              : BigDecimal.ZERO);
				availableForSale += tf.getAvailableTrees() != null ? tf.getAvailableTrees() : 0;
				if (tf.getTreeSpecies() != null) {
					speciesIds.add(tf.getTreeSpecies().getId());
				}
			}
		}

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
		                   .totalTrees(farm.getTotalTrees())
		                   .aliveTrees(farm.getAliveTrees())
		                   .deadTrees(farm.getDeadTrees())
		                   .availableTreesForSale(availableForSale)
		                   .soilType(farm.getSoilType())
		                   .climateZone(farm.getClimateZone())
		                   .avgRainfall(farm.getAvgRainfall())
		                   .avgTemperature(farm.getAvgTemperature())
		                   .farmStatus(farm.getFarmStatus())
		                   .plantingDate(farm.getPlantingDate())
		                   .totalEstimatedCarbon(totalEstimatedCarbon)
		                   .totalAbsorbedCarbon(totalAbsorbedCarbon)
		                   .createdBy(farm.getCreatedBy())
		                   .createdAt(farm.getCreatedAt())
		                   .updatedAt(farm.getUpdatedAt())
		                   .treesFarms(treesFarmResponses)
		                   .totalSpecies(speciesIds.size())
		                   .build();
	}

	private TreesFarmResponse mapToTreesFarmResponse(TreesFarm tf) {
		TreeSpecies species = tf.getTreeSpecies();

		return TreesFarmResponse.builder()
		                        .id(tf.getId())
		                        .farmId(tf.getFarmId())
		                        .farmName(tf.getFarm() != null ? tf.getFarm().getName() : null)
		                        .treeSpeciesId(species != null ? species.getId() : null)
		                        .treeSpeciesName(species != null ? species.getName() : null)
		                        .scientificName(species != null ? species.getScientificName() : null)
		                        .carbonAbsorptionRate(species != null ? species.getCarbonAbsorptionRate() : null)
		                        .numberTrees(tf.getNumberTrees())
		                        .availableTrees(tf.getAvailableTrees())
		                        .soldTrees(tf.getNumberTrees() - (tf.getAvailableTrees() != null ? tf.getAvailableTrees() : 0))
		                        .latitude(tf.getLatitude())
		                        .longitude(tf.getLongitude())
		                        .plantingDate(tf.getPlantingDate())
		                        .ageInYears(tf.getAgeInYears())
		                        .ageInMonths(tf.getAgeInMonths())
		                        .currentAvgHeight(tf.getCurrentAvgHeight())
		                        .currentAvgTrunkDiameter(tf.getCurrentAvgTrunkDiameter())
		                        .currentAvgCanopyDiameter(tf.getCurrentAvgCanopyDiameter())
		                        .currentAvgHealthStatus(tf.getCurrentAvgHealthStatus())
		                        .estimatedCarbonPerTree(tf.getEstimatedCarbonPerTree())
		                        .totalEstimatedCarbon(tf.getTotalEstimatedCarbon())
		                        .totalCo2Absorbed(tf.getTotalCo2Absorbed())
		                        .treeStatus(tf.getTreeStatus())
		                        .createdBy(tf.getCreatedBy())
		                        .createdAt(tf.getCreatedAt())
		                        .updatedAt(tf.getUpdatedAt())
		                        .build();
	}

	private AvailableTreesResponse mapToAvailableTreesResponse(TreesFarm tf) {
		TreeSpecies species = tf.getTreeSpecies();
		Farm farm = tf.getFarm();

		// Get environmental factor
		BigDecimal envFactor = BigDecimal.ONE;
		if (farm != null) {
			envFactor = environmentFactorRepository.getAverageFactorByFarmId(farm.getId());
		}

		BigDecimal carbonPerTree = tf.getEstimatedCarbonPerTree().multiply(envFactor);
		BigDecimal totalCarbon = carbonPerTree.multiply(BigDecimal.valueOf(tf.getAvailableTrees()));

		// Suggested price based on carbon value (example:  50,000 VND per kg CO2)
		BigDecimal suggestedPrice = carbonPerTree.multiply(BigDecimal.valueOf(50000)).setScale(0, RoundingMode.HALF_UP);

		return AvailableTreesResponse.builder()
		                             .farmId(farm != null ? farm.getId() : null)
		                             .farmName(farm != null ? farm.getName() : null)
		                             .farmLocation(farm != null ? farm.getLocation() : null)
		                             .treesFarmId(tf.getId())
		                             .treeSpeciesId(species != null ? species.getId() : null)
		                             .treeSpeciesName(species != null ? species.getName() : null)
		                             .scientificName(species != null ? species.getScientificName() : null)
		                             .availableTrees(tf.getAvailableTrees())
		                             .plantingDate(tf.getPlantingDate())
		                             .ageInMonths(tf.getAgeInMonths())
		                             .ageInYears(tf.getAgeInYears())
		                             .carbonAbsorptionRate(species != null ? species.getCarbonAbsorptionRate() : null)
		                             .estimatedCarbonPerTree(carbonPerTree)
		                             .totalAvailableCarbon(totalCarbon)
		                             .suggestedUnitPrice(suggestedPrice)
		                             .environmentalFactor(envFactor)
		                             .build();
	}
}
