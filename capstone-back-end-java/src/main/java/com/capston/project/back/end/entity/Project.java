package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.ProjectStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(unique = true, nullable = false, length = 50)
	private String code;

	@Column(nullable = false)
	private String name;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "location_text", columnDefinition = "TEXT")
	private String locationText;

	@Column(precision = 10, scale = 8)
	private BigDecimal latitude;

	@Column(precision = 11, scale = 8)
	private BigDecimal longitude;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal area;

	@Column(name = "area_unit", length = 10)
	private String areaUnit = "m2";

	@Column(name = "usable_area", precision = 12, scale = 2)
	private BigDecimal usableArea;

	@Column(name = "planting_date", nullable = false)
	private LocalDate plantingDate;

	@Column(name = "total_trees_planned", nullable = false)
	private Integer totalTreesPlanned;

	@Column(name = "total_trees_actual")
	private Integer totalTreesActual = 0;

	@Column(name = "planting_density", precision = 10, scale = 2)
	private BigDecimal plantingDensity;

	@Enumerated(EnumType.STRING)
	@Column(name = "project_status", length = 20)
	private ProjectStatus projectStatus;

	@Column(name = "manager_id")
	private UUID managerId;

	@Column(name = "partner_organizations", columnDefinition = "TEXT[]")
	private List<String> partnerOrganizations = new ArrayList<>();

	@Column(name = "is_public")
	private Boolean isPublic = true;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ProjectPhase> phases = new ArrayList<>();

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ProjectImage> images = new ArrayList<>();

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<AnnualGrowthData> annualGrowthData = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		if (code == null || code.isEmpty()) {
			code = generateProjectCode();
		}
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	private String generateProjectCode() {
		return "PRJ-" + System.currentTimeMillis();
	}

	public void addPhase(ProjectPhase phase) {
		if (phases == null) {
			phases = new ArrayList<>();
		}
		phases.add(phase);
		phase.setProject(this);
	}
}