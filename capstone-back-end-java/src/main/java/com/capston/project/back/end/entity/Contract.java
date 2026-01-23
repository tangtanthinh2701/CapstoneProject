package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.ContractStatus;
import com.capston.project.back.end.common.ContractType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "contract_code", unique = true, nullable = false, length = 50)
	private String contractCode;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", insertable = false, updatable = false)
	private Project project;

	// Contract type
	@Column(name = "contract_type", nullable = false, length = 50)
	private ContractType contractType; // OWNERSHIP, INVESTMENT, SERVICE, CREDIT_PURCHASE

	// Parties
	@Column(name = "party_a_id")
	private UUID partyAId; // Company/Organization

	@Column(name = "party_b_id")
	private UUID partyBId; // Project owner

	// Financial terms
	@Column(name = "total_value", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalValue;

	@Column(name = "payment_terms", columnDefinition = "TEXT")
	private String paymentTerms;

	// Timeline
	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Column(name = "duration_years")
	private Integer durationYears;

	// Renewal terms
	@Column(name = "is_renewable")
	@Builder.Default
	private Boolean isRenewable = false;

	@Column(name = "renewal_terms", columnDefinition = "TEXT")
	private String renewalTerms;

	@Column(name = "max_renewals")
	private Integer maxRenewals;

	@Column(name = "current_renewal_count")
	@Builder.Default
	private Integer currentRenewalCount = 0;

	// Terms & Conditions
	@Column(name = "terms_and_conditions", columnDefinition = "TEXT")
	private String termsAndConditions;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "special_clauses", columnDefinition = "jsonb")
	private Map<String, Object> specialClauses;

	// Rights (for OWNERSHIP type)
	@Column(name = "carbon_credit_percentage", precision = 5, scale = 2)
	private BigDecimal carbonCreditPercentage;

	@Column(name = "harvest_rights")
	@Builder.Default
	private Boolean harvestRights = false;

	@Column(name = "transfer_allowed")
	@Builder.Default
	private Boolean transferAllowed = false;

	// Status
	@Enumerated(EnumType.STRING)
	@Column(name = "contract_status", length = 20)
	@Builder.Default
	private ContractStatus contractStatus = ContractStatus.DRAFT;

	// Approval
	@Column(name = "approved_by")
	private UUID approvedBy;

	@Column(name = "approved_at")
	private OffsetDateTime approvedAt;

	// Termination
	@Column(name = "terminated_at")
	private OffsetDateTime terminatedAt;

	@Column(name = "termination_reason", columnDefinition = "TEXT")
	private String terminationReason;

	@Column(name = "early_termination_fee", precision = 15, scale = 2)
	private BigDecimal earlyTerminationFee;

	// Documents
	@Column(name = "contract_file_url", length = 500)
	private String contractFileUrl;

	// Tracking
	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Relationships
	@OneToMany(mappedBy = "originalContract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ContractRenewal> renewals = new ArrayList<>();

	// Helper methods
	public boolean isExpiringSoon() {
		if (endDate == null)
			return false;
		LocalDate warningDate = LocalDate.now().plusDays(30);
		return endDate.isBefore(warningDate) && endDate.isAfter(LocalDate.now());
	}

	public boolean isExpired() {
		if (endDate == null)
			return false;
		return endDate.isBefore(LocalDate.now());
	}

	public boolean canRenew() {
		if (!Boolean.TRUE.equals(isRenewable))
			return false;
		if (maxRenewals == null)
			return true;
		return currentRenewalCount < maxRenewals;
	}

	@PrePersist
	@PreUpdate
	protected void calculateDuration() {
		if (startDate != null && endDate != null) {
			this.durationYears = java.time.Period.between(startDate, endDate).getYears();
		}
	}
}