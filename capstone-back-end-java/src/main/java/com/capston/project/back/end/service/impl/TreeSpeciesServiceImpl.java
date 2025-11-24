package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.dtos.TreeSpeciesDTO;
import com.capston.project.back.end.models.TreeSpecies;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import com.capston.project.back.end.service.TreeSpeciesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TreeSpeciesServiceImpl  implements TreeSpeciesService {
	private final TreeSpeciesRepository treeSpeciesRepository;

	@Override
	public TreeSpeciesDTO createTreeSpecies(TreeSpeciesDTO dto) {
		// Validate unique
		if(treeSpeciesRepository.existsByName(dto.getName())) {
			throw new IllegalStateException("Tree species with name '" + dto.getName() + "' already exists");
		}

		if(dto.getScientificName() != null && treeSpeciesRepository.existsByScientificName(dto.getScientificName())) {
			throw new IllegalStateException("Scientific name already exists");
		}

		TreeSpecies entity = TreeSpecies.builder()
		                                .name(dto.getName())
		                                .scientificName(dto.getScientificName())
		                                .carbonAbsorptionRate(dto.getCarbonAbsorptionRate())
		                                .description(dto.getDescription())
		                                .imageUrl(dto.getImageUrl())
		                                .typicalHeight(dto.getTypicalHeight())
		                                .typicalDiameter(dto.getTypicalDiameter())
		                                .typicalLifespan(dto.getTypicalLifespan())
		                                .growthRate(dto.getGrowthRate())
		                                .climateZones(dto.getClimateZones() != null ? dto.getClimateZones() : null)
		                                .soilTypes(dto.getSoilTypes() != null ? dto.getSoilTypes() : null)
		                                .waterRequirement(dto.getWaterRequirement())
		                                .sunlightRequirement(dto.getSunlightRequirement())
		                                .woodValue(dto.getWoodValue())
		                                .fruitValue(dto.getFruitValue())
		                                .hasCommercialValue(dto.getHasCommercialValue() != null ? dto.getHasCommercialValue() : false)
		                                .isActive(true)
		                                .createdAt(LocalDateTime.now())
		                                .updatedAt(LocalDateTime.now())
		                                .build();

		TreeSpecies saved = treeSpeciesRepository.save(entity);

		return entityToDTO(saved);
	}

	@Override
	public List<TreeSpeciesDTO> batchCreateTreeSpecies(List<TreeSpeciesDTO> dtoList) {
		List<TreeSpeciesDTO> results = new ArrayList<>();
		for (TreeSpeciesDTO dto : dtoList) {
			try {
				results.add(createTreeSpecies(dto));
			} catch (Exception e) {
				throw new RuntimeException("Error creating species: " + dto.getName(), e);
			}
		}

		return results;
	}

	@Override
	@Transactional(readOnly = true)
	public TreeSpeciesDTO getTreeSpeciesById(Integer id) {
		TreeSpecies entity = treeSpeciesRepository.findById(id).orElseThrow(
				() -> new EntityNotFoundException("Tree species not found with ID: " + id));

		return entityToDTO(entity);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TreeSpeciesDTO> getAllTreeSpecies() {
		return treeSpeciesRepository.findAll()
		                            .stream()
		                            .map(this::entityToDTO)
		                            .collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<TreeSpeciesDTO> getActiveTreeSpecies() {
		return treeSpeciesRepository.findByIsActiveTrue()
		                            .stream()
		                            .map(this::entityToDTO)
		                            .collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public Page<TreeSpeciesDTO> getTreeSpeciesPaginated(int page, int size, String sortBy) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
		return treeSpeciesRepository.findAll(pageable).map(this::entityToDTO);
	}

	@Override
	public TreeSpeciesDTO updateTreeSpecies(Integer id, TreeSpeciesDTO dto) {
		TreeSpecies entity = treeSpeciesRepository.findById(id)
		                                          .orElseThrow(() -> new EntityNotFoundException("Tree species not found with ID: " + id));

		// Update only non-null fields
		if (dto.getName() != null) {
			treeSpeciesRepository.findByName(dto.getName()).ifPresent(existing -> {
				if (!existing.getId().equals(id)) {
					throw new IllegalStateException("Name already exists");
				}
			});
			entity.setName(dto.getName());
		}

		// Rảnh thì viết mapstruct
		if (dto.getScientificName() != null) {
			entity.setScientificName(dto.getScientificName());
		}
		if (dto.getCarbonAbsorptionRate() != null) {
			entity.setCarbonAbsorptionRate(dto.getCarbonAbsorptionRate());
		}
		if (dto.getDescription() != null) {
			entity.setDescription(dto.getDescription());
		}
		if (dto.getImageUrl() != null) {
			entity.setImageUrl(dto.getImageUrl());
		}
		if (dto.getTypicalHeight() != null) {
			entity.setTypicalHeight(dto.getTypicalHeight());
		}
		if (dto.getTypicalDiameter() != null) {
			entity.setTypicalDiameter(dto.getTypicalDiameter());
		}
		if (dto.getTypicalLifespan() != null) {
			entity.setTypicalLifespan(dto.getTypicalLifespan());
		}
		if (dto.getGrowthRate() != null) {
			entity.setGrowthRate(dto.getGrowthRate());
		}
		if (dto.getClimateZones() != null) {
			entity.setClimateZones(dto.getClimateZones());
		}
		if (dto.getSoilTypes() != null) {
			entity.setSoilTypes(dto.getSoilTypes());
		}
		if (dto.getWaterRequirement() != null) {
			entity.setWaterRequirement(dto.getWaterRequirement());
		}
		if (dto.getSunlightRequirement() != null) {
			entity.setSunlightRequirement(dto.getSunlightRequirement());
		}
		if (dto.getWoodValue() != null) {
			entity.setWoodValue(dto.getWoodValue());
		}
		if (dto.getFruitValue() != null) {
			entity.setFruitValue(dto.getFruitValue());
		}
		if (dto.getHasCommercialValue() != null) {
			entity.setHasCommercialValue(dto.getHasCommercialValue());
		}
		if (dto.getIsActive() != null) {
			entity.setIsActive(dto.getIsActive());
		}

		entity.setUpdatedAt(LocalDateTime.now());
		TreeSpecies updated = treeSpeciesRepository.save(entity);

		return entityToDTO(updated);
	}

	/**
	 * Soft delete
	 */
	@Override
	public void deleteTreeSpecies(Integer id) {
		TreeSpecies entity = treeSpeciesRepository.findById(id)
		                                          .orElseThrow(() -> new EntityNotFoundException("Tree species not found"));

		entity.setIsActive(false);
		entity.setUpdatedAt(LocalDateTime.now());
		treeSpeciesRepository.save(entity);
	}

	/**
	 * Hard delete
	 */
	@Override
	public void permanentDeleteTreeSpecies(Integer id) {
		if (!treeSpeciesRepository.existsById(id)) {
			throw new EntityNotFoundException("Tree species not found");
		}

		treeSpeciesRepository.deleteById(id);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<TreeSpeciesDTO> searchTreeSpecies(TreeSpeciesDTO searchDTO) {
		Pageable pageable = PageRequest.of(
				searchDTO.getPage() != null ? searchDTO.getPage() : 0,
				searchDTO.getSize() != null ? searchDTO.getSize() : 20,
				Sort.Direction.fromString(searchDTO.getSortDirection() != null ?
				                          searchDTO.getSortDirection() : "ASC"),
				searchDTO.getSortBy() != null ? searchDTO.getSortBy() : "name"
		                                  );

		Page<TreeSpecies> result;

		if (searchDTO.getKeyword() != null && !searchDTO.getKeyword().isEmpty()) {
			result = treeSpeciesRepository.searchByNameOrScientificName(
					searchDTO.getKeyword(), pageable);
		} else {
			result = treeSpeciesRepository.findAll(pageable);
		}

		return result.map(this::entityToDTO);
	}

	@Override
	public List<TreeSpeciesDTO> searchByName(String keyword) {
		return treeSpeciesRepository.searchByNameOrScientificName(keyword)
		                            .stream()
		                            .map(this::entityToDTO)
		                            .collect(Collectors.toList());
	}

	@Override
	public TreeSpeciesDTO getStatistics() {
		long totalSpecies = treeSpeciesRepository.count();
		long activeSpecies = treeSpeciesRepository.countByIsActiveTrue();
		long inactiveSpecies = treeSpeciesRepository.countByIsActiveFalse();
		long commercialSpecies = treeSpeciesRepository.countByHasCommercialValueTrue();

		BigDecimal avgCarbon = treeSpeciesRepository.getAverageCarbonAbsorptionRate();
		BigDecimal maxCarbon = treeSpeciesRepository.getMaxCarbonAbsorptionRate();
		BigDecimal minCarbon = treeSpeciesRepository.getMinCarbonAbsorptionRate();

		// Growth rate distribution
		Map<String, Long> growthRateDistribution = new HashMap<>();
		growthRateDistribution.put("SLOW", treeSpeciesRepository.countByGrowthRate("SLOW"));
		growthRateDistribution.put("MEDIUM", treeSpeciesRepository.countByGrowthRate("MEDIUM"));
		growthRateDistribution.put("FAST", treeSpeciesRepository.countByGrowthRate("FAST"));

		BigDecimal totalWood = treeSpeciesRepository.getTotalWoodValue();
		BigDecimal totalFruit = treeSpeciesRepository.getTotalFruitValue();

		// Tạo DTO với statistics fields
		return TreeSpeciesDTO.builder()
		                     .totalSpecies(totalSpecies)
		                     .activeSpecies(activeSpecies)
		                     .inactiveSpecies(inactiveSpecies)
		                     .commercialSpecies(commercialSpecies)
		                     .avgCarbonAbsorptionRate(avgCarbon)
		                     .maxCarbonAbsorptionRate(maxCarbon)
		                     .minCarbonAbsorptionRate(minCarbon)
		                     .growthRateDistribution(growthRateDistribution)
		                     .totalWoodValue(totalWood != null ? totalWood : BigDecimal.ZERO)
		                     .avgWoodValue(activeSpecies > 0 && totalWood != null
		                                   ? totalWood.divide(BigDecimal.valueOf(activeSpecies), 2, RoundingMode.HALF_UP)
		                                   : BigDecimal.ZERO)
		                     .totalFruitValue(totalFruit != null ? totalFruit : BigDecimal.ZERO)
		                     .avgFruitValue(activeSpecies > 0 && totalFruit != null
		                                    ? totalFruit.divide(BigDecimal.valueOf(activeSpecies), 2, RoundingMode.HALF_UP)
		                                    : BigDecimal.ZERO)
		                     .build();
	}

	/**
	 * Entity to DTO
	 */
	private TreeSpeciesDTO entityToDTO(TreeSpecies entity) {
		return TreeSpeciesDTO.builder()
		                     .id(entity.getId())
		                     .name(entity.getName())
		                     .scientificName(entity.getScientificName())
		                     .carbonAbsorptionRate(entity.getCarbonAbsorptionRate())
		                     .description(entity.getDescription())
		                     .imageUrl(entity.getImageUrl())
		                     .typicalHeight(entity.getTypicalHeight())
		                     .typicalDiameter(entity.getTypicalDiameter())
		                     .typicalLifespan(entity.getTypicalLifespan())
		                     .growthRate(entity.getGrowthRate())
		                     .climateZones(entity.getClimateZones())
		                     .soilTypes(entity.getSoilTypes())
		                     .waterRequirement(entity.getWaterRequirement())
		                     .sunlightRequirement(entity.getSunlightRequirement())
		                     .woodValue(entity.getWoodValue())
		                     .fruitValue(entity.getFruitValue())
		                     .hasCommercialValue(entity.getHasCommercialValue())
		                     .isActive(entity.getIsActive())
		                     .createdAt(entity.getCreatedAt())
		                     .updatedAt(entity.getUpdatedAt())
		                     .build();
	}
}
