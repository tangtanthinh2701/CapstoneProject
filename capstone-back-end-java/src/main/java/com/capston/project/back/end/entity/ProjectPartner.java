package com.capston.project.back.end.entity;

import com.capston.project.back.end.common.PartnerRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_partners", uniqueConstraints = @UniqueConstraint(columnNames = { "project_id", "partner_user_id",
		"partner_role" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPartner {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "project_id", nullable = false)
	private Integer projectId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", insertable = false, updatable = false)
	@JsonIgnore
	private Project project;

	@Column(name = "partner_user_id", nullable = false)
	private UUID partnerUserId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "partner_user_id", insertable = false, updatable = false)
	private User partnerUser;

	@Enumerated(EnumType.STRING)
	@Column(name = "partner_role", nullable = false, length = 100)
	private PartnerRole partnerRole; // INVESTOR, TECHNICAL_SUPPORT, VERIFIER, etc.

	@Column(name = "contribution_amount", precision = 15, scale = 2)
	private BigDecimal contributionAmount;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private OffsetDateTime createdAt;
}
