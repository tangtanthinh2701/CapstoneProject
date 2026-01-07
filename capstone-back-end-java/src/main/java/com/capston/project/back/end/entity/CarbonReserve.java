package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.ReserveStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org. hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time. OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carbon_reserve")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonReserve {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "source_phase_id")
	private ProjectPhase sourcePhase;

	@Column(name = "carbon_amount", nullable = false, precision = 15, scale = 4)
	private BigDecimal carbonAmount; // kg CO2

	@Column(name = "remaining_amount", nullable = false, precision = 15, scale = 4)
	private BigDecimal remainingAmount;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20)
	@Builder.Default
	private ReserveStatus status = ReserveStatus. AVAILABLE;

	@Column(name = "source_description", columnDefinition = "TEXT")
	private String sourceDescription;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	@Column(name = "expires_at")
	private OffsetDateTime expiresAt;

	@OneToMany(mappedBy = "reserve", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<CarbonReserveAllocation> allocations = new ArrayList<>();

	/**
	 * Phân bổ carbon từ quỹ
	 */
	public BigDecimal allocate(BigDecimal amount) {
		if (amount.compareTo(remainingAmount) > 0) {
			BigDecimal allocated = remainingAmount;
			remainingAmount = BigDecimal.ZERO;
			updateStatus();
			return allocated;
		}
		remainingAmount = remainingAmount.subtract(amount);
		updateStatus();
		return amount;
	}

	private void updateStatus() {
		if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
			this.status = ReserveStatus.ALLOCATED;
		}
	}
}
