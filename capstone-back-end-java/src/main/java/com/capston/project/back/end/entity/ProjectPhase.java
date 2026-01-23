package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.PhaseStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_phases", uniqueConstraints = @UniqueConstraint(columnNames = { "project_id", "phase_number" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPhase {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	@JsonIgnore
	private Project project;

	@Column(name = "phase_number", nullable = false)
	private Integer phaseNumber;

	@Column(name = "phase_name")
	private String phaseName;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "phase_status", nullable = false, length = 20)
	@Builder.Default
	private PhaseStatus phaseStatus = PhaseStatus.PLANNING;

	@Column(name = "planned_start_date")
	private LocalDate plannedStartDate;

	@Column(name = "planned_end_date")
	private LocalDate plannedEndDate;

	@Column(name = "actual_start_date", nullable = false)
	private LocalDate actualStartDate;

	@Column(name = "actual_end_date")
	private LocalDate actualEndDate;

	@Column(name = "budget", precision = 15, scale = 2)
	private BigDecimal budget;

	// Trường được tính toán từ cây trong farm
	@Column(name = "actual_cost", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal actualCost = BigDecimal.ZERO;

	@Column(name = "target_co2_kg", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal targetCo2Kg = BigDecimal.ZERO;

	// Trường được tính toán từ cây trong farm
	@Column(name = "actual_co2_kg", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal actualCo2Kg = BigDecimal.ZERO;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@Column(name = "created_by")
	private UUID createdBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Helper method để lấy project ID mà không load toàn bộ project
	public Integer getProjectId() {
		return project != null ? project.getId() : null;
	}
}
