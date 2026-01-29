package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.FarmStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "farms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "code", unique = true, nullable = false, length = 50)
	private String code;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "location", length = 500)
	private String location;

	@Column(name = "latitude", precision = 10, scale = 8)
	private BigDecimal latitude;

	@Column(name = "longitude", precision = 11, scale = 8)
	private BigDecimal longitude;

	@Column(name = "area", precision = 12, scale = 2, nullable = false)
	private BigDecimal area;

	@Column(name = "usable_area", precision = 12, scale = 2)
	private BigDecimal usableArea;

	@Column(name = "soil_type", length = 100)
	private String soilType;

	@Column(name = "climate_zone", length = 100)
	private String climateZone;

	@Column(name = "avg_rainfall", precision = 10, scale = 2)
	private BigDecimal avgRainfall; // mm/năm

	@Column(name = "avg_temperature", precision = 5, scale = 2)
	private BigDecimal avgTemperature; // °C

	@Enumerated(EnumType.STRING)
	@Column(name = "farm_status", length = 20)
	@Builder.Default
	private FarmStatus farmStatus = FarmStatus.ACTIVE;

	@Column(name = "created_by")
	private UUID createdBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	@Column(name = "deleted_at")
	private OffsetDateTime deletedAt;

	// Relationships
	@OneToMany(mappedBy = "farm", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	@JsonIgnore
	private List<TreeBatch> treeBatches = new ArrayList<>();

	@OneToMany(mappedBy = "farm", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<FarmEnvironmentRecord> environmentRecords = new ArrayList<>();

	@OneToMany(mappedBy = "farm", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ProjectFarm> projectFarms = new ArrayList<>();

	public BigDecimal getUsableAreaPercentage() {
		if (area == null || area.compareTo(BigDecimal.ZERO) == 0) {
			return BigDecimal.ZERO;
		}
		if (usableArea == null) {
			return BigDecimal.ZERO;
		}
		return usableArea.divide(area, 4, java.math.RoundingMode.HALF_UP)
				.multiply(BigDecimal.valueOf(100));
	}

	public boolean isActive() {
		return "ACTIVE".equals(farmStatus);
	}
}
