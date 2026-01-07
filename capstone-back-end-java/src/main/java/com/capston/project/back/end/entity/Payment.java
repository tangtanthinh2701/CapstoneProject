package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "payment_code", unique = true, nullable = false, length = 50)
	private String paymentCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_id")
	private Contract contract;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "credit_transaction_id")
	private CreditTransaction creditTransaction;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "payer_id", nullable = false)
	private User payer;

	@Column(name = "amount", precision = 15, scale = 2, nullable = false)
	private BigDecimal amount;

	@Column(name = "payment_method", length = 50)
	private String paymentMethod;

	@Column(name = "payment_status", length = 50)
	@Builder.Default
	private String paymentStatus = "PENDING";

	@Column(name = "transaction_id")
	private String transactionId;

	@Column(name = "bank_name", length = 100)
	private String bankName;

	@Column(name = "account_number", length = 50)
	private String accountNumber;

	@Column(name = "paid_at")
	private LocalDateTime paidAt;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	public void markAsCompleted(String gatewayTransactionId) {
		this.paymentStatus = "COMPLETED";
		this.transactionId = gatewayTransactionId;
		this.paidAt = LocalDateTime.now();
	}

	public void markAsFailed(String reason) {
		this.paymentStatus = "FAILED";
		this.notes = (this.notes != null ? this.notes + "\n" : "") + "Failed: " + reason;
	}

	public void refund(String reason) {
		this.paymentStatus = "REFUNDED";
		this.notes = (this.notes != null ? this.notes + "\n" : "") + "Refunded: " + reason;
	}

	public boolean isPending() {
		return "PENDING".equals(paymentStatus);
	}

	public boolean isCompleted() {
		return "COMPLETED".equals(paymentStatus);
	}

	public boolean isFailed() {
		return "FAILED".equals(paymentStatus);
	}

	public boolean isRefunded() {
		return "REFUNDED".equals(paymentStatus);
	}

	@PrePersist
	protected void validateReference() {
		if (contract == null && creditTransaction == null) {
			throw new IllegalStateException("Payment must reference either a contract or a credit transaction");
		}
		if (contract != null && creditTransaction != null) {
			throw new IllegalStateException("Payment cannot reference both contract and credit transaction");
		}
	}
}

