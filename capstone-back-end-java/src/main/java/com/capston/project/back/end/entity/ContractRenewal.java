package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.RenewalStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
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
	@JsonIgnore
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

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 50)
	@Builder.Default
	private RenewalStatus status = RenewalStatus.PENDING;

	@Column(name = "requested_by")
	private UUID requestedBy;

	@CreationTimestamp
	@Column(name = "requested_at")
	private OffsetDateTime requestedAt;

	@Column(name = "approved_by")
	private UUID approvedBy;

	@Column(name = "approved_at")
	private OffsetDateTime approvedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	// Helper
	public Integer getOriginalContractId() {
		return originalContract != null ?  originalContract.getId() : null;
	}
}