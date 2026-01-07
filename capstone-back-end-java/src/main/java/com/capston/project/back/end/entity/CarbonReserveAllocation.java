package com.capston.project.back.end.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time. OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "carbon_reserve_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonReserveAllocation {
	@Id
	@GeneratedValue(strategy = GenerationType. IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reserve_id", nullable = false)
	@JsonIgnore
	private CarbonReserve reserve;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "target_phase_id", nullable = false)
	private ProjectPhase targetPhase;

	@Column(name = "allocated_amount", nullable = false, precision = 15, scale = 4)
	private BigDecimal allocatedAmount;

	@Column(name = "allocation_date", nullable = false)
	private LocalDate allocationDate;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@Column(name = "allocated_by")
	private UUID allocatedBy;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;
}
