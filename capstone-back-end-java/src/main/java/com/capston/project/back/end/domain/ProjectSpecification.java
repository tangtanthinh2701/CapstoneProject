package com.capston.project.back.end.domain;

import com.capston.project.back.end.entity.Project;
import com.capston.project.back.end.entity.ProjectPhase;
import com.capston.project.back.end.entity.TreeSpecies;
import com.capston.project.back.end.entity.TreeSpeciesOnPhase;
import com.capston.project.back.end.request.ProjectFilterRequest;
import jakarta.persistence.criteria.*;
import lombok.experimental.UtilityClass;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification cho dynamic query filtering
 * Giúp build query WHERE clause linh hoạt dựa trên filter request
 */
@UtilityClass
public class ProjectSpecification {
	/**
	 * Tạo Specification từ ProjectFilterRequest
	 */
	public static Specification<Project> buildSpecification(ProjectFilterRequest filter) {
		return (root, query, criteriaBuilder) -> {
			List<Predicate> predicates = new ArrayList<>();

			// Filter by name (LIKE %name%)
			if (filter.getName() != null && !filter.getName().isBlank()) {
				predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")),
				                                    "%" + filter.getName().toLowerCase() + "%"));
			}

			// Filter by location
			if (filter.getLocationText() != null && !filter.getLocationText().isBlank()) {
				predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("locationText")),
				                                    "%" + filter.getLocationText().toLowerCase() + "%"));
			}

			// Filter by planting date range
			if (filter.getPlantingDateFrom() != null) {
				predicates.add(
						criteriaBuilder.greaterThanOrEqualTo(root.get("plantingDate"), filter.getPlantingDateFrom()));
			}

			if (filter.getPlantingDateTo() != null) {
				predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("plantingDate"), filter.getPlantingDateTo()));
			}

			// Filter by project status
			if (filter.getProjectStatus() != null && !filter.getProjectStatus().isBlank()) {
				predicates.add(
						criteriaBuilder.equal(root.get("projectStatus").as(String.class), filter.getProjectStatus()));
			}

			// Filter by isPublic
			if (filter.getIsPublic() != null) {
				predicates.add(criteriaBuilder.equal(root.get("isPublic"), filter.getIsPublic()));
			}

			// Filter by tree species IDs
			// Cần join với phases và treeSpecies
			if (filter.getTreeSpeciesIds() != null && !filter.getTreeSpeciesIds().isEmpty()) {
				// Join với phases
				Join<Project, ProjectPhase> phaseJoin = root.join("phases", JoinType.INNER);
				// Join với treeSpecies trong phase
				Join<ProjectPhase, TreeSpeciesOnPhase> tsJoin = phaseJoin.join("treeSpecies", JoinType.INNER);
				// Join với TreeSpecies entity
				Join<TreeSpeciesOnPhase, TreeSpecies> treeSpeciesJoin = tsJoin.join("treeSpecies", JoinType.INNER);

				predicates.add(treeSpeciesJoin.get("id").in(filter.getTreeSpeciesIds()));

				// DISTINCT để tránh duplicate khi có nhiều tree species
				query.distinct(true);
			}

			return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
		};
	}

	/**
	 * Filter projects có thể mua (public và đang active)
	 */
	public static Specification<Project> isPurchasable() {
		return (root, query, criteriaBuilder) -> criteriaBuilder.and(criteriaBuilder.equal(root.get("isPublic"), true),
		                                                             criteriaBuilder.in(root.get("projectStatus"))
		                                                                            .value("GROWING").value("MATURE"));
	}

	/**
	 * Filter projects theo manager
	 */
	public static Specification<Project> byManagerId(java.util.UUID managerId) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("managerId"), managerId);
	}
}
