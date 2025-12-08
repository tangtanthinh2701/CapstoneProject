package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;


@Entity
@Table(name = "carbon_credits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCredits {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "credit_code", unique = true, nullable = false, length = 50)
	private String creditCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(name = "report_year", nullable = false)
	private Integer reportYear;

	@Column(name = "total_co2_tons", nullable = false, precision = 15, scale = 2)
	private BigDecimal totalCo2Tons;

	@Column(name = "credits_issued", nullable = false)
	private Integer creditsIssued;

	@Column(name = "credits_sold")
	private Integer creditsSold = 0;

	@Column(name = "credits_retired")
	private Integer creditsRetired = 0;

	@Column(name = "credits_available", nullable = false)
	private Integer creditsAvailable;

	@Column(name = "price_per_credit", precision = 15, scale = 2)
	private BigDecimal pricePerCredit;

	@Column(name = "credits_status", length = 50)
	private String creditsStatus = "AVAILABLE";

	@Column(name = "verification_standard", length = 100)
	private String verificationStandard;

	@Column(name = "certificate_url", length = 500)
	private String certificateUrl;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "issued_by")
	private User issuedBy;

	@Column(name = "issued_at")
	private OffsetDateTime issuedAt;

	@Column(name = "expires_at")
	private OffsetDateTime expiresAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private OffsetDateTime updatedAt;
}
