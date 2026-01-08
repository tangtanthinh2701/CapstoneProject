package com.capston.project.back.end.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "project_partners",
       uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "partner_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPartner {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	@JsonIgnore
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "partner_id", nullable = false)
	private Partner partner;

	@Column(name = "role", length = 100)
	private String role;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	// Helper methods
	public Integer getProjectId() {
		return project != null ? project.getId() : null;
	}

	public Integer getPartnerId() {
		return partner != null ? partner.getId() : null;
	}
}
