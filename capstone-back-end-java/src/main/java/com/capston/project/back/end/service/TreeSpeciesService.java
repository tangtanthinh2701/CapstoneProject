package com.capston.project.back.end.service;

import com.capston.project.back.end.request.TreeSpeciesRequest;
import java.util.*;
import org.springframework.data.domain.*;

public interface TreeSpeciesService {
	TreeSpeciesRequest createTreeSpecies(TreeSpeciesRequest dto);

	List<TreeSpeciesRequest> batchCreateTreeSpecies(List<TreeSpeciesRequest> dtoList);

	TreeSpeciesRequest getTreeSpeciesById(Integer id);

	List<TreeSpeciesRequest> getAllTreeSpecies();

	List<TreeSpeciesRequest> getActiveTreeSpecies();

	Page<TreeSpeciesRequest> getTreeSpeciesPaginated(int page, int size, String sortBy);

	TreeSpeciesRequest updateTreeSpecies(Integer id, TreeSpeciesRequest dto);
	/**
	 * Soft delete
	 */
	void deleteTreeSpecies(Integer id);
	/**
	 * Hard delete
	 */
	void permanentDeleteTreeSpecies(Integer id);
	Page<TreeSpeciesRequest> searchTreeSpecies(TreeSpeciesRequest searchDTO);
	List<TreeSpeciesRequest> searchByName(String keyword);
	TreeSpeciesRequest getStatistics();
}
