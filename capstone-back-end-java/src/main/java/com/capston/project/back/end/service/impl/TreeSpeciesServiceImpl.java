package com.capston.project.back.end.service.impl;

import com.capston.project.back.end.exception.DuplicateResourceException;
import com.capston.project.back.end.exception.ResourceNotFoundException;
import com.capston.project.back.end.request.TreeSpeciesRequest;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.repository.TreeSpeciesRepository;
import com.capston.project.back.end.response.TreeSpeciesListResponse;
import com.capston.project.back.end.response.TreeSpeciesResponse;
import com.capston.project.back.end.response.generic.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
	private final ModelMapper modelMapper;

	@Override
	public TreeSpeciesResponse createTreeSpecies(TreeSpeciesRequest request) {
		if (treeSpeciesRepository.existsByNameIgnoreCase(request.getName())) {
			throw new DuplicateResourceException(String.format("Loại cây với tên '%s' đã tồn tại trong hệ thống", request.getName()));
		}

		if (request.getScientificName() != null && !request.getScientificName().trim().isEmpty()) {
			if (treeSpeciesRepository.existsByScientificNameIgnoreCase(request.getScientificName())) {
				throw new DuplicateResourceException(String.format("Loại cây với tên khoa học '%s' đã tồn tại trong hệ thống", request.getScientificName()));
			}
		}

		TreeSpecies treeSpecies = modelMapper.map(request, TreeSpecies.class);
		TreeSpecies saved = treeSpeciesRepository.save(treeSpecies);

		return modelMapper.map(saved, TreeSpeciesResponse.class);
	}

	@Override
	public TreeSpeciesResponse updateTreeSpecies(Integer id, TreeSpeciesRequest request) {
		TreeSpecies treeSpecies = treeSpeciesRepository.findById(id)
		                                               .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại cây với id: " + id));

		// Check duplicate name (exclude current id)
		if (treeSpeciesRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
			throw new DuplicateResourceException(String.format("Loại cây với tên '%s' đã tồn tại trong hệ thống", request.getName())
			);
		}

		// Check duplicate scientific name (exclude current id)
		if (request.getScientificName() != null && !request.getScientificName().trim().isEmpty()) {
			if (treeSpeciesRepository.existsByScientificNameIgnoreCaseAndIdNot(request.getScientificName(), id)) {
				throw new DuplicateResourceException(String.format("Loại cây với tên khoa học '%s' đã tồn tại trong hệ thống", request.getScientificName()));
			}
		}

		modelMapper.map(request, treeSpecies);
		TreeSpecies updated = treeSpeciesRepository.save(treeSpecies);

		return modelMapper.map(updated, TreeSpeciesResponse.class);
	}

	@Override
	public TreeSpeciesResponse getTreeSpeciesById(Integer id) {
		TreeSpecies treeSpecies = treeSpeciesRepository.findById(id)
		                                               .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại cây với id: " + id));

		return modelMapper.map(treeSpecies, TreeSpeciesResponse.class);
	}

	@Override
	public PageResponse<TreeSpeciesListResponse> getAllTreeSpecies(String name, String growthRate, Boolean isActive, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

		Specification<TreeSpecies> spec = buildTreeSpeciesSpec(name, growthRate, isActive);

		Page<TreeSpecies> pageTree = treeSpeciesRepository.findAll(spec, pageable);

		return PageResponse.<TreeSpeciesListResponse>builder()
		                   .content(pageTree.getContent()
		                                 .stream()
		                                 .map(t -> modelMapper.map(t, TreeSpeciesListResponse.class))
		                                 .collect(Collectors.toList()))
		                   .pageNumber(pageTree.getNumber())
		                   .pageSize(pageTree.getSize())
		                   .totalElements(pageTree.getTotalElements())
		                   .totalPages(pageTree.getTotalPages())
		                   .last(pageTree.isLast())
		                   .build();
	}

	private Specification<TreeSpecies> buildTreeSpeciesSpec(String name, String growthRate, Boolean isActive) {
		Specification<TreeSpecies> spec = (root, query, cb) -> cb.conjunction();

		if (name != null && !name.isEmpty()) {
			spec = spec.and((root, query, cb) ->
					                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
		}

		if (growthRate != null && !growthRate.isEmpty()) {
			spec = spec.and((root, query, cb) ->
					                cb.equal(root.get("growthRate"), growthRate));
		}

		if (isActive != null) {
			spec = spec.and((root, query, cb) ->
					                cb.equal(root.get("isActive"), isActive));
		}

		return spec;
	}

	@Override
	public PageResponse<TreeSpeciesListResponse> getActiveTreeSpecies(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
		Page<TreeSpecies> pageTree = treeSpeciesRepository.findAllActive(pageable);

		return PageResponse.<TreeSpeciesListResponse>builder()
		                   .content(pageTree.getContent().stream()
		                                 .map(t -> modelMapper.map(t, TreeSpeciesListResponse.class))
		                                 .collect(Collectors.toList()))
		                   .pageNumber(pageTree.getNumber())
		                   .pageSize(pageTree.getSize())
		                   .totalElements(pageTree.getTotalElements())
		                   .totalPages(pageTree.getTotalPages())
		                   .last(pageTree.isLast())
		                   .build();
	}

	// Soft delete - chỉ set isActive = false
	@Override
	public void deleteTreeSpecies(Integer id) {
		TreeSpecies treeSpecies = treeSpeciesRepository.findById(id)
		                                               .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại cây với id: " + id));
		treeSpecies.setIsActive(false);
		treeSpeciesRepository.save(treeSpecies);
	}

	@Override
	public void hardDeleteTreeSpecies(Integer id) {
		if (!treeSpeciesRepository.existsById(id)) {
			throw new ResourceNotFoundException("Không tìm thấy loại cây với id: " + id);
		}

		try {
			treeSpeciesRepository.deleteById(id);
		} catch (Exception e) {
			throw new IllegalStateException("Không thể xóa loại cây này vì đã được sử dụng trong các dự án");
		}
	}
}
