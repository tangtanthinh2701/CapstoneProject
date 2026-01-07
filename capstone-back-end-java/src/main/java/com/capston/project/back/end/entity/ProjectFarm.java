package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_farms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectFarm {

	@Id
	@GeneratedValue(strategy = GenerationType. IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "farm_id", nullable = false)
	private Farm farm;

	@Column(name = "assigned_by")
	private UUID assignedBy;

	@Column(name = "assigned_at")
	private LocalDateTime assignedAt = LocalDateTime.now();

	@PrePersist
	protected void onCreate() {
		if (assignedAt == null) {
			assignedAt = LocalDateTime.now();
		}
	}
}
