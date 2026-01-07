package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(name = "contract_category", length = 50, nullable = false)
	@Builder.Default
	private String contractCategory = "ENTERPRISE_PROJECT";

	@Column(name = "contract_type", length = 50, nullable = false)
	@Builder.Default
	private String contractType = "OWNERSHIP";

	@Column(name = "unit_price", precision = 15, scale = 2, nullable = false)
	private BigDecimal unitPrice;

	@Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
	private BigDecimal totalAmount;

	@Column(name = "contract_term_years")
	private Integer contractTermYears;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@Column(name = "auto_renewal")
	@Builder.Default
	private Boolean autoRenewal = false;

	@Column(name = "renewal_term_years")
	private Integer renewalTermYears;

	@Column(name = "renewal_notice_days")
	@Builder.Default
	private Integer renewalNoticeDays = 30;

	@Column(name = "max_renewals")
	private Integer maxRenewals;

	@Column(name = "renewal_count")
	@Builder.Default
	private Integer renewalCount = 0;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "content", columnDefinition = "jsonb")
	private Map<String, Object> content;

	@Column(name = "harvest_rights")
	@Builder.Default
	private Boolean harvestRights = false;

	@Column(name = "transfer_allowed")
	@Builder.Default
	private Boolean transferAllowed = false;

	@Column(name = "early_termination_penalty", precision = 15, scale = 2)
	private BigDecimal earlyTerminationPenalty;

	@Column(name = "termination_reason", columnDefinition = "TEXT")
	private String terminationReason;

	@Column(name = "terminated_at")
	private LocalDateTime terminatedAt;

	@Column(name = "contract_status", length = 50)
	@Builder.Default
	private String contractStatus = "PENDING";

	@Column(name = "payment_date")
	private LocalDate paymentDate;

	@Column(name = "contract_file_url", length = 500)
	private String contractFileUrl;

	@Column(name = "approved_by")
	private UUID approvedBy;

	@Column(name = "approved_at")
	private LocalDateTime approvedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@Column(name = "service_scope", columnDefinition = "TEXT")
	private String serviceScope;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "kpi_requirements", columnDefinition = "jsonb")
	private Map<String, Object> kpiRequirements;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<OxiOwnership> ownerships = new ArrayList<>();

	@OneToMany(mappedBy = "originalContract", fetch = FetchType.LAZY)
	@Builder.Default
	private List<ContractRenewal> renewals = new ArrayList<>();

	@OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
	@Builder.Default
	private List<OwnershipTransfer> transfers = new ArrayList<>();

	@OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
	@Builder.Default
	private List<Payment> payments = new ArrayList<>();

	public boolean isActive() {
		return "ACTIVE".equals(contractStatus);
	}

	public boolean isExpiringSoon() {
		if (endDate == null) return false;
		LocalDate noticeDate = endDate.minusDays(renewalNoticeDays != null ? renewalNoticeDays : 30);
		return LocalDate.now().isAfter(noticeDate) && LocalDate.now().isBefore(endDate);
	}

	public boolean canRenew() {
		return autoRenewal && (maxRenewals == null || renewalCount < maxRenewals);
	}

	public void incrementRenewalCount() {
		this.renewalCount = (this.renewalCount != null ? this.renewalCount : 0) + 1;
	}

	public void terminate(String reason) {
		this.contractStatus = "TERMINATED";
		this.terminationReason = reason;
		this.terminatedAt = LocalDateTime.now();
	}

	public void approve(UUID approver) {
		this.contractStatus = "ACTIVE";
		this.approvedBy = approver;
		this.approvedAt = LocalDateTime.now();
	}

	public long getRemainingDays() {
		if (endDate == null) return 0;
		return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), endDate);
	}
}