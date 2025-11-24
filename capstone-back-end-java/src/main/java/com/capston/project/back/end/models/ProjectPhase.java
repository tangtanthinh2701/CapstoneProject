package com.capston.project.back.end.models;

import com.capston.project.back.end.common.PhaseStatus;
import lombok.*;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Table(name = "project_phases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class ProjectPhase {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(name = "phase_number", nullable = false)
	private Integer phaseNumber;

	@Column(name = "phase_name")
	private String phaseName;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "phase_status", nullable = false, length = 20)
	private PhaseStatus phaseStatus = PhaseStatus.PLANNING;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Column(name = "expected_duration_days")
	private Integer expectedDurationDays;

	@Column(name = "actual_duration_days")
	private Integer actualDurationDays;

	@Column(name = "budget", precision = 15, scale = 2)
	private BigDecimal budget;

	@Column(name = "actual_cost", precision = 15, scale = 2)
	private BigDecimal actualCost = BigDecimal.ZERO;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@Column(name = "created_by")
	private UUID createdBy;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "phase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<TreeSpeciesOnPhase> treeSpeciesOnPhases = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		if (treeSpeciesOnPhases == null) {
			treeSpeciesOnPhases = new ArrayList<>();
		}
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public void addTreeSpecies(TreeSpeciesOnPhase tsop) {
		if (treeSpeciesOnPhases == null) {
			treeSpeciesOnPhases = new ArrayList<>();
		}
		treeSpeciesOnPhases.add(tsop);
		tsop.setPhase(this);
	}
}
