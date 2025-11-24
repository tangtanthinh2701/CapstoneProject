package com.capston.project.back.end.service;

import com.capston.project.back.end.dtos.TreeSpeciesDTO;
import java.util.*;
import org.springframework.data.domain.*;

public interface TreeSpeciesService {
	TreeSpeciesDTO createTreeSpecies(TreeSpeciesDTO dto);
	List<TreeSpeciesDTO> batchCreateTreeSpecies(List<TreeSpeciesDTO> dtoList);
	TreeSpeciesDTO getTreeSpeciesById(Integer id);
	List<TreeSpeciesDTO> getAllTreeSpecies();
	List<TreeSpeciesDTO> getActiveTreeSpecies();
	Page<TreeSpeciesDTO> getTreeSpeciesPaginated(int page, int size, String sortBy);
	TreeSpeciesDTO updateTreeSpecies(Integer id, TreeSpeciesDTO dto);
	/**
	 * Soft delete
	 */
	void deleteTreeSpecies(Integer id);
	/**
	 * Hard delete
	 */
	void permanentDeleteTreeSpecies(Integer id);
	Page<TreeSpeciesDTO> searchTreeSpecies(TreeSpeciesDTO searchDTO);
	List<TreeSpeciesDTO> searchByName(String keyword);
	TreeSpeciesDTO getStatistics();
}
