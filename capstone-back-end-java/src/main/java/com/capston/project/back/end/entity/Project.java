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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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

	@Column(name = "code", unique = true, nullable = false, length = 50)
	private String code;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "project_status", length = 20)
	@Builder.Default
	private ProjectStatus projectStatus = ProjectStatus.PLANNING;

	@Column(name = "manager_id")
	private UUID managerId;

	@Column(name = "is_public")
	@Builder.Default
	private Boolean isPublic = true;

	// Các trường được tính toán tự động
	@Column(name = "total_budget", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal totalBudget = BigDecimal.ZERO;

	@Column(name = "actual_cost", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal actualCost = BigDecimal.ZERO;

	@Column(name = "target_co2_kg", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal targetCo2Kg = BigDecimal.ZERO;

	@Column(name = "actual_co2_kg", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal actualCo2Kg = BigDecimal.ZERO;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Relationship với Phases - sử dụng LAZY để tránh N+1
	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ProjectPhase> phases = new ArrayList<>();

	// Helper methods để quản lý relationship
	public void addPhase(ProjectPhase phase) {
		phases.add(phase);
		phase.setProject(this);
	}

	public void removePhase(ProjectPhase phase) {
		phases.remove(phase);
		phase.setProject(null);
	}

	// Tính toán lại các trường từ phases
	public void recalculateFromPhases() {
		if (phases == null || phases.isEmpty()) {
			this.totalBudget = BigDecimal.ZERO;
			this.targetCo2Kg = BigDecimal.ZERO;
			this.actualCo2Kg = BigDecimal.ZERO;
			return;
		}

		this.totalBudget = phases.stream()
				.map(p -> p.getBudget() != null ? p.getBudget() : BigDecimal.ZERO)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		this.targetCo2Kg = phases.stream()
				.map(p -> p.getTargetCo2Kg() != null
						? p.getTargetCo2Kg()
						: BigDecimal.ZERO)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		this.actualCo2Kg = phases.stream()
				.map(p -> p.getActualCo2Kg() != null
						? p.getActualCo2Kg()
						: BigDecimal.ZERO)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		// Tự động cập nhật trạng thái dự án dựa trên phase
		updateStatusFromPhases();
	}

	private void updateStatusFromPhases() {
		if (phases == null || phases.isEmpty() || projectStatus == ProjectStatus.CANCELLED) {
			return;
		}

		boolean allCompleted = phases.stream()
				.allMatch(p -> p.getPhaseStatus() == com.capston.project.back.end.common.PhaseStatus.COMPLETED);

		if (allCompleted) {
			this.projectStatus = ProjectStatus.COMPLETED;
		} else {
			boolean anyStarted = phases.stream()
					.anyMatch(p -> p.getPhaseStatus() != com.capston.project.back.end.common.PhaseStatus.PLANNING);
			if (anyStarted && this.projectStatus == ProjectStatus.PLANNING) {
				this.projectStatus = ProjectStatus.ACTIVE;
			}
		}
	}
}