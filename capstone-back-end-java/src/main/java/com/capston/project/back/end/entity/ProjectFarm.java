package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_farms", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "farm_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectFarm {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", insertable = false, updatable = false)
	private Project project;

	@Column(name = "farm_id", nullable = false)
	private Integer farmId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "farm_id", insertable = false, updatable = false)
	private Farm farm;

	@Column(name = "assigned_by")
	private UUID assignedBy;

	@Column(name = "assigned_at")
	@Builder.Default
	private OffsetDateTime assignedAt = OffsetDateTime.now();
}
