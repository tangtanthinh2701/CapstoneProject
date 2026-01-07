package com.capston.project.back.end.entity;

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

	@Column(name = "carbon_absorption_rate", precision = 10, scale = 4, nullable = false)
	private BigDecimal carbonAbsorptionRate;

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

	@OneToMany(mappedBy = "treeSpecies", fetch = FetchType.LAZY)
	@Builder.Default
	private List<TreesFarm> treesFarms = new ArrayList<>();

	@OneToMany(mappedBy = "treeSpecies", fetch = FetchType.LAZY)
	@Builder.Default
	private List<OxiOwnership> ownerships = new ArrayList<>();

//	public BigDecimal calculateCO2Absorption(int numberOfTrees, int years) {
//		if (carbonAbsorptionRate == null) {
//			return BigDecimal.ZERO;
//		}
//		return carbonAbsorptionRate.multiply(BigDecimal.valueOf(numberOfTrees))
//		                           .multiply(BigDecimal.valueOf(years));
//	}
//
	/**
	 * Tính CO2 hấp thụ ước tính theo tuổi cây (năm)
	 */
	public BigDecimal calculateEstimatedCarbon(int ageInYears) {
		return carbonAbsorptionRate.multiply(BigDecimal.valueOf(ageInYears));
	}

	/**
	 * Tính CO2 hấp thụ với environmental factor
	 */
	public BigDecimal calculateEstimatedCarbon(int ageInYears, BigDecimal environmentalFactor) {
		return carbonAbsorptionRate
				.multiply(BigDecimal. valueOf(ageInYears))
				.multiply(environmentalFactor);
	}
}
