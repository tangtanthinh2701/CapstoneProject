package com.capston.project.back.end.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contracts {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "contract_code", unique = true, nullable = false, length = 50)
	private String contractCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "enterprise_id", nullable = false)
	private User enterprise;

	@Column(name = "contract_type", nullable = false, length = 50)
	private String contractType = "OWNERSHIP";

	@Column(name = "num_trees")
	private Integer numTrees;

	@Column(precision = 12, scale = 2)
	private BigDecimal area;

	@Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
	private BigDecimal unitPrice;

	@Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalAmount;

	@Column(name = "contract_term_years")
	private Integer contractTermYears;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Column(name = "auto_renewal")
	private Boolean autoRenewal = false;

	@Column(name = "renewal_term_years")
	private Integer renewalTermYears;

	@Column(name = "renewal_notice_days")
	private Integer renewalNoticeDays = 30;

	@Column(name = "max_renewals")
	private Integer maxRenewals;

	@Column(name = "renewal_count")
	private Integer renewalCount = 0;

	@Column(name = "carbon_credit_sharing", precision = 5, scale = 2)
	private BigDecimal carbonCreditSharing = new BigDecimal("100.00");

	@Column(name = "harvest_rights")
	private Boolean harvestRights = false;

	@Column(name = "transfer_allowed")
	private Boolean transferAllowed = false;

	@Column(name = "early_termination_penalty", precision = 15, scale = 2)
	private BigDecimal earlyTerminationPenalty;

	@Column(name = "payment_date")
	private LocalDate paymentDate;

	@Column(name = "contract_status", length = 50)
	private String contractStatus = "PENDING";

	@Column(name = "termination_reason", columnDefinition = "TEXT")
	private String terminationReason;

	@Column(name = "terminated_at")
	private LocalDateTime terminatedAt;

	@Column(name = "contract_file_url", length = 500)
	private String contractFileUrl;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "approved_by")
	private User approvedBy;

	@Column(name = "approved_at")
	private LocalDateTime approvedAt;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@Column(name = "created_at", updatable = false)
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
