package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math. BigDecimal;
import java. time.LocalDate;
import java.time.LocalDateTime;
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
	@GeneratedValue(strategy = GenerationType. IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_id")
	private Contract contract;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ownership_id")
	private OxiOwnership ownership;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "from_user_id", nullable = false)
	private User fromUser;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "to_user_id", nullable = false)
	private User toUser;

	@Column(name = "carbon_credit", precision = 5, scale = 2)
	private BigDecimal carbonCredit = BigDecimal.valueOf(100.00);

	@Column(name = "transfer_price", precision = 15, scale = 2)
	private BigDecimal transferPrice;

	@Column(name = "status", length = 50)
	private String status = "PENDING"; // PENDING, COMPLETED, REJECTED

	@Column(name = "transfer_date")
	private LocalDate transferDate;

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
	}

	public void approve(UUID approver) {
		this.status = "COMPLETED";
		this.approvedBy = approver;
		this. approvedAt = LocalDateTime.now();
		this.transferDate = LocalDate.now();
	}

	public void reject() {
		this.status = "REJECTED";
	}

	public boolean isPending() {
		return "PENDING".equals(status);
	}
}