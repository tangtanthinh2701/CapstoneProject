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
import java.time.LocalDateTime;
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
	@GeneratedValue(strategy = GenerationType. IDENTITY)
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
	@Column(name = "budget", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal budget = BigDecimal. ZERO;

	@Column(name = "target_consumed_carbon", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal targetConsumedCarbon = BigDecimal.ZERO;

	@Column(name = "current_consumed_carbon", precision = 15, scale = 2)
	@Builder.Default
	private BigDecimal currentConsumedCarbon = BigDecimal. ZERO;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

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
			this.budget = BigDecimal.ZERO;
			this.targetConsumedCarbon = BigDecimal.ZERO;
			this. currentConsumedCarbon = BigDecimal.ZERO;
			return;
		}

		this.budget = phases.stream()
		                    .map(p -> p.getBudget() != null ? p.getBudget() : BigDecimal.ZERO)
		                    .reduce(BigDecimal. ZERO, BigDecimal::add);

		this.targetConsumedCarbon = phases.stream()
		                                  .map(p -> p.getTargetConsumedCarbon() != null ? p.getTargetConsumedCarbon() : BigDecimal.ZERO)
		                                  .reduce(BigDecimal.ZERO, BigDecimal:: add);

		this.currentConsumedCarbon = phases.stream()
		                                   .map(p -> p.getCurrentConsumedCarbon() != null ? p.getCurrentConsumedCarbon() : BigDecimal.ZERO)
		                                   .reduce(BigDecimal.ZERO, BigDecimal::add);
	}
}