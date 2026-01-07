package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.exception.DuplicateResourceException;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.request.TreeSpeciesRequest;
import com.capston.project.back.end.response.TreeSpeciesResponse;
import com.capston.project.back.end.service.TreeSpeciesService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TreeSpeciesServiceImpl implements TreeSpeciesService {

	private final TreeSpeciesRepository treeSpeciesRepository;

	@Override
	@Transactional
	public TreeSpeciesResponse create(TreeSpeciesRequest request) {
		log.info("Creating tree species: {}", request.getName());

		if (treeSpeciesRepository.existsByNameIgnoreCase(request.getName())) {
			throw new DuplicateResourceException("Tree species with name '" + request.getName() + "' already exists");
		}

		TreeSpecies treeSpecies = TreeSpecies.builder()
		                                     .name(request.getName())
		                                     .scientificName(request.getScientificName())
		                                     .carbonAbsorptionRate(request.getCarbonAbsorptionRate())
		                                     .description(request.getDescription())
		                                     .imageUrl(request.getImageUrl())
		                                     .build();

		TreeSpecies saved = treeSpeciesRepository.save(treeSpecies);
		log.info("Created tree species with id: {}", saved.getId());

		return mapToResponse(saved);
	}

	@Override
	public TreeSpeciesResponse getById(Integer id) {
		TreeSpecies treeSpecies = treeSpeciesRepository.findById(id)
		                                               .filter(ts -> ts.getDeletedAt() == null)
		                                               .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies", "id", id));
		return mapToResponse(treeSpecies);
	}

	@Override
	@Transactional
	public TreeSpeciesResponse update(Integer id, TreeSpeciesRequest request) {
		log.info("Updating tree species: {}", id);

		TreeSpecies treeSpecies = treeSpeciesRepository.findById(id)
		                                               .filter(ts -> ts.getDeletedAt() == null)
		                                               .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies", "id", id));

		// Check duplicate name
		if (request.getName() != null && !request.getName().equalsIgnoreCase(treeSpecies.getName())) {
			if (treeSpeciesRepository. existsByNameIgnoreCase(request.getName())) {
				throw new DuplicateResourceException("Tree species with name '" + request.getName() + "' already exists");
			}
			treeSpecies.setName(request.getName());
		}

		if (request.getScientificName() != null) {
			treeSpecies.setScientificName(request.getScientificName());
		}
		if (request.getCarbonAbsorptionRate() != null) {
			treeSpecies.setCarbonAbsorptionRate(request.getCarbonAbsorptionRate());
		}
		if (request.getDescription() != null) {
			treeSpecies.setDescription(request.getDescription());
		}
		if (request.getImageUrl() != null) {
			treeSpecies.setImageUrl(request.getImageUrl());
		}

		TreeSpecies saved = treeSpeciesRepository.save(treeSpecies);
		return mapToResponse(saved);
	}

	@Override
	@Transactional
	public void delete(Integer id) {
		log.info("Soft deleting tree species: {}", id);

		TreeSpecies treeSpecies = treeSpeciesRepository.findById(id)
		                                               .orElseThrow(() -> new ResourceNotFoundException("TreeSpecies", "id", id));

		treeSpecies.setDeletedAt(OffsetDateTime.now());
		treeSpeciesRepository.save(treeSpecies);
	}

	@Override
	public Page<TreeSpeciesResponse> getAll(Pageable pageable) {
		return treeSpeciesRepository.findAllActive(pageable)
		                            .map(this::mapToResponse);
	}

	@Override
	public Page<TreeSpeciesResponse> search(String keyword, Pageable pageable) {
		return treeSpeciesRepository.searchByKeyword(keyword, pageable)
		                            .map(this::mapToResponse);
	}

	@Override
	public List<TreeSpeciesResponse> getAllActive() {
		return treeSpeciesRepository.findAllActive().stream()
		                            .map(this::mapToResponse)
		                            .collect(Collectors.toList());
	}

	@Override
	public List<TreeSpeciesResponse> getTopByCarbonAbsorption(int limit) {
		return treeSpeciesRepository.findTopByCarbonAbsorption(PageRequest.of(0, limit)).stream()
		                            .map(this::mapToResponse)
		                            .collect(Collectors.toList());
	}

	private TreeSpeciesResponse mapToResponse(TreeSpecies entity) {
		BigDecimal rate = entity.getCarbonAbsorptionRate();

		return TreeSpeciesResponse.builder()
		                          .id(entity. getId())
		                          .name(entity.getName())
		                          .scientificName(entity.getScientificName())
		                          .carbonAbsorptionRate(rate)
		                          .description(entity.getDescription())
		                          .imageUrl(entity. getImageUrl())
		                          .createdAt(entity.getCreatedAt())
		                          .updatedAt(entity.getUpdatedAt())
		                          .estimatedCarbonPerYear(rate)
		                          .estimatedCarbon5Years(rate. multiply(BigDecimal.valueOf(5)))
		                          .estimatedCarbon10Years(rate.multiply(BigDecimal.valueOf(10)))
		                          .build();
	}
}
