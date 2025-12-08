package com.capston.project.back.end.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectFilterRequest {
	private String name; // Search by name

	private List<Integer> treeSpeciesIds; // Filter by tree species

	private String locationText; // Filter by location

	private LocalDate plantingDateFrom;

	private LocalDate plantingDateTo;

	private String projectStatus;

	private Boolean isPublic;

	@Min(value = 0)
	private Integer page = 0;

	@Min(value = 1)
	@Max(value = 100)
	private Integer size = 20;

	private String sortBy = "createdAt"; // name, plantingDate, area, createdAt

	private String sortDirection = "DESC"; // ASC, DESC
}
