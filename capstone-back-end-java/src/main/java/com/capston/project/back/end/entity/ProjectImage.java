package com.capston.project.back.end.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Table(name = "project_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class ProjectImage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "phase_id")
	private ProjectPhase phase;

	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	@Column(name = "thumbnail_url", length = 500)
	private String thumbnailUrl;

	@Column(columnDefinition = "TEXT")
	private String caption;

	@Column(name = "taken_date")
	private LocalDate takenDate;

	@Column(name = "image_type", length = 50)
	private String imageType;

	@Column(name = "is_featured")
	private Boolean isFeatured = false;

	@Column(name = "uploaded_by")
	private UUID uploadedBy;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}
}
