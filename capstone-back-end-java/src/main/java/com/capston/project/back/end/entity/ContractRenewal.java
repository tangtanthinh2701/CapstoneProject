package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java. util.UUID;

@Entity
@Table(name = "contract_renewals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRenewal {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "original_contract_id", nullable = false)
	private Contract originalContract;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "new_contract_id")
	private Contract newContract;

	@Column(name = "renewal_number", nullable = false)
	private Integer renewalNumber;

	@Column(name = "renewal_term_years", nullable = false)
	private Integer renewalTermYears;

	@Column(name = "old_end_date", nullable = false)
	private LocalDate oldEndDate;

	@Column(name = "new_start_date", nullable = false)
	private LocalDate newStartDate;

	@Column(name = "new_end_date", nullable = false)
	private LocalDate newEndDate;

	@Column(name = "renewal_amount", precision = 15, scale = 2)
	private BigDecimal renewalAmount;

	@Column(name = "status", length = 50)
	private String status = "PENDING"; // PENDING, APPROVED, REJECTED

	@Column(name = "requested_by")
	private UUID requestedBy;

	@Column(name = "requested_at")
	private LocalDateTime requestedAt = LocalDateTime.now();

	@Column(name = "approved_by")
	private UUID approvedBy;

	@Column(name = "approved_at")
	private LocalDateTime approvedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@Column(name = "created_at")
	private LocalDateTime createdAt = LocalDateTime.now();

	@PrePersist
	protected void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
		if (requestedAt == null) {
			requestedAt = LocalDateTime.now();
		}
	}

	public void approve(UUID approver) {
		this.status = "APPROVED";
		this.approvedBy = approver;
		this.approvedAt = LocalDateTime.now();
	}

	public void reject() {
		this.status = "REJECTED";
	}

	public boolean isPending() {
		return "PENDING".equals(status);
	}
}