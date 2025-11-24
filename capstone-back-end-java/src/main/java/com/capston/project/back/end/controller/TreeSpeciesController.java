package com.capston.project.back.end.controller;

import com.capston.project.back.end.dtos.TreeSpeciesDTO;
import com.capston.project.back.end.service.TreeSpeciesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tree-species")
@RequiredArgsConstructor
public class TreeSpeciesController {
	private final TreeSpeciesService treeSpeciesService;

	@PostMapping("/create-treeSpecies")
	public ResponseEntity<TreeSpeciesDTO> createTreeSpecies(@Valid @RequestBody TreeSpeciesDTO dto) {
		TreeSpeciesDTO result = treeSpeciesService.createTreeSpecies(dto);
		return ResponseEntity.ok(result);
	}

	@PostMapping("/batch")
	public ResponseEntity<List<TreeSpeciesDTO>> batchCreateTreeSpecies(@Valid @RequestBody List<TreeSpeciesDTO> dtoList) {
		List<TreeSpeciesDTO> results = treeSpeciesService.batchCreateTreeSpecies(dtoList);
		return ResponseEntity.ok(results);
	}

	@GetMapping("/all-treeSpecies")
	public ResponseEntity<List<TreeSpeciesDTO>> getAllTreeSpecies() {
		List<TreeSpeciesDTO> results = treeSpeciesService.getAllTreeSpecies();
		return ResponseEntity.ok(results);
	}

	@GetMapping("/active")
	public ResponseEntity<List<TreeSpeciesDTO>> getActiveTreeSpecies() {
		List<TreeSpeciesDTO> results = treeSpeciesService.getActiveTreeSpecies();
		return ResponseEntity.ok(results);
	}

	@GetMapping("/{id}")
	public ResponseEntity<TreeSpeciesDTO> getTreeSpeciesById(@PathVariable Integer id) {
		TreeSpeciesDTO result = treeSpeciesService.getTreeSpeciesById(id);
		return ResponseEntity.ok(result);
	}

	@GetMapping("/paginated")
	public ResponseEntity<Page<TreeSpeciesDTO>> getTreeSpeciesPaginated(@RequestParam(defaultValue = "0") int page,
	                                                                    @RequestParam(defaultValue = "20") int size,
	                                                                    @RequestParam(defaultValue = "name") String sortBy) {
		Page<TreeSpeciesDTO> results = treeSpeciesService.getTreeSpeciesPaginated(page, size, sortBy);
		return ResponseEntity.ok(results);
	}

	@PutMapping("/{id}")
	public ResponseEntity<TreeSpeciesDTO> updateTreeSpecies(@PathVariable Integer id, @Valid @RequestBody TreeSpeciesDTO dto) {
		TreeSpeciesDTO result = treeSpeciesService.updateTreeSpecies(id, dto);
		return ResponseEntity.ok(result);
	}

	/**
	 * Soft delete
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteTreeSpecies(@PathVariable Integer id) {
		treeSpeciesService.deleteTreeSpecies(id);
//		return ResponseEntity.noContent().build();
		return ResponseEntity.ok("Tree species deactivated successfully");
	}

	/**
	 * Permanent delete
	 */
	@DeleteMapping("/{id}/permanent")
	public ResponseEntity<?> permanentDeleteTreeSpecies(@PathVariable Integer id) {
		treeSpeciesService.permanentDeleteTreeSpecies(id);
		return ResponseEntity.ok("Tree species permanently deleted");
	}

	// Search với ScientificName
	// /search-scientificName/search?keyword=''
	@GetMapping("/search-scientificName")
	public ResponseEntity<List<TreeSpeciesDTO>> searchByName(@RequestParam String keyword) {
		List<TreeSpeciesDTO> results = treeSpeciesService.searchByName(keyword);
		return ResponseEntity.ok(results);
	}

	@PostMapping("/search")
	public ResponseEntity<Page<TreeSpeciesDTO>> searchTreeSpecies(@RequestBody TreeSpeciesDTO searchDTO){
		Page<TreeSpeciesDTO> results = treeSpeciesService.searchTreeSpecies(searchDTO);
		return ResponseEntity.ok(results);
	}

	@GetMapping("/statistics")
	public ResponseEntity<TreeSpeciesDTO> getStatistics() {
		TreeSpeciesDTO result = treeSpeciesService.getStatistics();
		return ResponseEntity.ok(result);
	}
}
