package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "farm_environment_factors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmEnvironmentFactor {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "farm_id", nullable = false)
	private Farm farm;

	@Column(name = "from_date", nullable = false)
	private LocalDate fromDate;

	@Column(name = "to_date", nullable = false)
	private LocalDate toDate;

	@Column(name = "rainfall_factor", precision = 6, scale = 3)
	@Builder.Default
	private BigDecimal rainfallFactor = BigDecimal.ONE;

	@Column(name = "temp_factor", precision = 6, scale = 3)
	@Builder.Default
	private BigDecimal tempFactor = BigDecimal.ONE;

	@Column(name = "soil_factor", precision = 6, scale = 3)
	@Builder.Default
	private BigDecimal soilFactor = BigDecimal.ONE;

	@Column(name = "overall_factor", precision = 6, scale = 3)
	@Builder.Default
	private BigDecimal overallFactor = BigDecimal.ONE;

	@Column(name = "calculated_by")
	private UUID calculatedBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@PrePersist
	@PreUpdate
	public void calculateOverallFactor() {
		this.overallFactor = rainfallFactor
				.multiply(tempFactor)
				.multiply(soilFactor);
	}

	public boolean isActive() {
		LocalDate now = LocalDate.now();
		return !now.isBefore(fromDate) && !now.isAfter(toDate);
	}
}