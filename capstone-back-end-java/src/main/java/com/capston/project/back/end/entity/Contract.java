package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.ContractCategory;
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
	@GeneratedValue(strategy = GenerationType. IDENTITY)
	private Integer id;

	@Column(name = "contract_code", unique = true, nullable = false, length = 50)
	private String contractCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Enumerated(EnumType.STRING)
	@Column(name = "contract_category", nullable = false)
	@Builder.Default
	private ContractCategory contractCategory = ContractCategory.ENTERPRISE_PROJECT;

	@Enumerated(EnumType.STRING)
	@Column(name = "contract_type", nullable = false, length = 50)
	@Builder.Default
	private ContractType contractType = ContractType.OWNERSHIP;

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

	// Cơ chế gia hạn
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

	// Điều khoản carbon / quyền lợi
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "content", columnDefinition = "jsonb")
	private Map<String, Object> content;

	@Column(name = "harvest_rights")
	@Builder.Default
	private Boolean harvestRights = false;

	@Column(name = "transfer_allowed")
	@Builder.Default
	private Boolean transferAllowed = false;

	// Điều khoản chấm dứt
	@Column(name = "early_termination_penalty", precision = 15, scale = 2)
	private BigDecimal earlyTerminationPenalty;

	@Column(name = "termination_reason", columnDefinition = "TEXT")
	private String terminationReason;

	@Column(name = "terminated_at")
	private OffsetDateTime terminatedAt;

	@Enumerated(EnumType.STRING)
	@Column(name = "contract_status")
	@Builder.Default
	private ContractStatus contractStatus = ContractStatus.DRAFT;

	@Column(name = "payment_date")
	private LocalDate paymentDate;

	@Column(name = "contract_file_url", length = 500)
	private String contractFileUrl;

	@Column(name = "approved_by")
	private UUID approvedBy;

	@Column(name = "approved_at")
	private OffsetDateTime approvedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	// Dành cho contract dịch vụ
	@Column(name = "service_scope", columnDefinition = "TEXT")
	private String serviceScope;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "kpi_requirements", columnDefinition = "jsonb")
	private Map<String, Object> kpiRequirements;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;

	// Relationships
	@OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType. LAZY)
	@Builder.Default
	private List<OxiOwnership> ownerships = new ArrayList<>();

	@OneToMany(mappedBy = "originalContract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ContractRenewal> renewals = new ArrayList<>();

	// Helper methods
	public Integer getProjectId() {
		return project != null ? project.getId() : null;
	}

	public boolean isExpiringSoon() {
		if (endDate == null) return false;
		LocalDate warningDate = LocalDate.now().plusDays(renewalNoticeDays != null ? renewalNoticeDays : 30);
		return endDate.isBefore(warningDate) && endDate.isAfter(LocalDate.now());
	}

	public boolean isExpired() {
		if (endDate == null) return false;
		return endDate.isBefore(LocalDate.now());
	}

	public boolean canRenew() {
		if (maxRenewals == null) return true;
		return renewalCount < maxRenewals;
	}
}