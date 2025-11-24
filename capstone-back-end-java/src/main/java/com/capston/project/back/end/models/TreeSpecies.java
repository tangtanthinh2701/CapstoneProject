package com.capston.project.back.end.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

	@Column(name ="name", nullable = false)
	private String name;

	@Column(name = "scientific_name")
	private String scientificName;

	@Column(name = "carbon_absorption_rate", nullable = false, precision = 10, scale = 4)
	private BigDecimal carbonAbsorptionRate;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "image_url", length = 500)
	private String imageUrl;

	@Column(name = "typical_height", precision = 10, scale = 2)
	private BigDecimal typicalHeight;

	@Column(name = "typical_diameter", precision = 10, scale = 2)
	private BigDecimal typicalDiameter;

	@Column(name = "typical_lifespan")
	private Integer typicalLifespan;

	@Column(name = "growth_rate", length = 50)
	private String growthRate;

	@Column(name = "climate_zones", columnDefinition = "TEXT[]")
	@JdbcTypeCode(SqlTypes.ARRAY)
	private List<String> climateZones;

	@Column(name = "soil_types", columnDefinition = "TEXT[]")
	@JdbcTypeCode(SqlTypes.ARRAY)
	private List<String> soilTypes;

	@Column(name = "water_requirement", length = 50)
	private String waterRequirement;

	@Column(name = "sunlight_requirement", length = 50)
	private String sunlightRequirement;

	@Column(name = "wood_value", precision = 15, scale = 2)
	private BigDecimal woodValue;

	@Column(name = "fruit_value", precision = 15, scale = 2)
	private BigDecimal fruitValue;

	@Column(name = "has_commercial_value")
	private Boolean hasCommercialValue = false;

	@Column(name = "is_active")
	private Boolean isActive = true;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}
}
