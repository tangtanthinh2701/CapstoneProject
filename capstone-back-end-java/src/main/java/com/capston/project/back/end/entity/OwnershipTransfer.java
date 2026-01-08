package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.TransferStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math. BigDecimal;
import java. time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ownership_transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipTransfer {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_id")
	private Contract contract;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ownership_id")
	@JsonIgnore
	private OxiOwnership ownership;

	@Column(name = "from_user_id", nullable = false)
	private UUID fromUserId;

	@Column(name = "to_user_id", nullable = false)
	private UUID toUserId;

	@Column(name = "carbon_credit", precision = 5, scale = 2)
	@Builder.Default
	private BigDecimal carbonCredit = new BigDecimal("100.00");

	@Column(name = "transfer_price", precision = 15, scale = 2)
	private BigDecimal transferPrice;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 50)
	@Builder.Default
	private TransferStatus status = TransferStatus.PENDING;

	@Column(name = "transfer_date")
	private LocalDate transferDate;

	@Column(name = "approved_by")
	private UUID approvedBy;

	@Column(name = "approved_at")
	private OffsetDateTime approvedAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	// Helper methods
	public Integer getOwnershipId() {
		return ownership != null ? ownership.getId() : null;
	}

	public Integer getContractId() {
		return contract != null ? contract.getId() : null;
	}
}