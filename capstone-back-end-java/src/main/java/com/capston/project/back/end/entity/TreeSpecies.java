package com.capston.project.back.end.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tree_species")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreeSpecies {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "scientific_name")
	private String scientificName;

	@Column(name = "base_carbon_rate", precision = 10, scale = 4, nullable = false)
	private BigDecimal baseCarbonRate; // Hệ số k_i (kg CO2/cây/năm)

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "image_url", length = 500)
	private String imageUrl;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	@Column(name = "deleted_at")
	private OffsetDateTime deletedAt;

	// Relationships
	@OneToMany(mappedBy = "treeSpecies", fetch = FetchType.LAZY)
	@Builder.Default
	@JsonIgnore
	private List<TreeBatch> treeBatches = new ArrayList<>();

	/**
	 * Tính CO2 hấp thụ ước tính theo tuổi cây (năm)
	 */
	public BigDecimal calculateEstimatedCarbon(int ageInYears) {
		return baseCarbonRate.multiply(BigDecimal.valueOf(ageInYears));
	}

	/**
	 * Tính CO2 hấp thụ với environmental factor
	 */
	public BigDecimal calculateEstimatedCarbon(int ageInYears, BigDecimal environmentalFactor) {
		return baseCarbonRate
				.multiply(BigDecimal.valueOf(ageInYears))
				.multiply(environmentalFactor);
	}
}
