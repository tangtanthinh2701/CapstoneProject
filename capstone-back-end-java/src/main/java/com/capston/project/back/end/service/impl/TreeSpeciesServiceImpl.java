package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.request.TreeSpeciesRequest;
import com.capston.project.back.end.entity.TreeSpecies;
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
	public TreeSpeciesRequest createTreeSpecies(TreeSpeciesRequest dto) {
		return null;
	}

	@Override
	public List<TreeSpeciesRequest> batchCreateTreeSpecies(List<TreeSpeciesRequest> dtoList) {
		List<TreeSpeciesRequest> results = new ArrayList<>();
		for (TreeSpeciesRequest dto : dtoList) {
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
	public TreeSpeciesRequest getTreeSpeciesById(Integer id) {
		TreeSpecies entity = treeSpeciesRepository.findById(id).orElseThrow(
				() -> new EntityNotFoundException("Tree species not found with ID: " + id));

		return entityToDTO(entity);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TreeSpeciesRequest> getAllTreeSpecies() {
		return treeSpeciesRepository.findAll()
		                            .stream()
		                            .map(this::entityToDTO)
		                            .collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public List<TreeSpeciesRequest> getActiveTreeSpecies() {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public Page<TreeSpeciesRequest> getTreeSpeciesPaginated(int page, int size, String sortBy) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
		return treeSpeciesRepository.findAll(pageable).map(this::entityToDTO);
	}

	@Override
	public TreeSpeciesRequest updateTreeSpecies(Integer id, TreeSpeciesRequest dto) {
		return null;
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
	public Page<TreeSpeciesRequest> searchTreeSpecies(TreeSpeciesRequest searchDTO) {
		return null;
	}

	@Override
	public List<TreeSpeciesRequest> searchByName(String keyword) {
		return null;
	}

	@Override
	public TreeSpeciesRequest getStatistics() {
		return null;
	}

	/**
	 * Entity to DTO
	 */
	private TreeSpeciesRequest entityToDTO(TreeSpecies entity) {
		return TreeSpeciesRequest.builder()
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
