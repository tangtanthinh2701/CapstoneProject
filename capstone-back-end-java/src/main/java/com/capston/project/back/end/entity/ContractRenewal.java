package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.RenewalStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

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

	@Column(name = "original_contract_id", nullable = false)
	private Integer originalContractId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "original_contract_id", insertable = false, updatable = false)
	@JsonIgnore
	private Contract originalContract;

	@Column(name = "renewal_number", nullable = false)
	private Integer renewalNumber;

	// New terms
	@Column(name = "new_start_date", nullable = false)
	private LocalDate newStartDate;

	@Column(name = "new_end_date", nullable = false)
	private LocalDate newEndDate;

	@Column(name = "renewal_fee", precision = 15, scale = 2)
	private BigDecimal renewalFee;

	@Column(name = "updated_terms", columnDefinition = "TEXT")
	private String updatedTerms;

	// Status
	@Enumerated(EnumType.STRING)
	@Column(name = "renewal_status", length = 20)
	@Builder.Default
	private RenewalStatus renewalStatus = RenewalStatus.PENDING;

	// Approval
	@Column(name = "requested_by")
	private UUID requestedBy;

	@Column(name = "requested_at")
	@Builder.Default
	private OffsetDateTime requestedAt = OffsetDateTime.now();

	@Column(name = "approved_by")
	private UUID approvedBy;

	@Column(name = "approved_at")
	private OffsetDateTime approvedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;
}