package com.capston.project.back.end.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponse {
	private Integer id;
	private String contractCode;
	private Integer projectId;
	private String projectName;
	private String enterpriseName;
	private String contractType;
	private Integer numTrees;
	private BigDecimal area;
	private BigDecimal unitPrice;
	private BigDecimal totalAmount;
	private Integer contractTermYears;
	private LocalDate startDate;
	private LocalDate endDate;
	private Boolean autoRenewal;
	private Integer renewalCount;
	private BigDecimal carbonCreditSharing;
	private Boolean harvestRights;
	private Boolean transferAllowed;
	private LocalDate paymentDate;
	private String contractStatus;
	private String contractFileUrl;
	private OffsetDateTime approvedAt;
	private String notes;
	private OffsetDateTime createdAt;
}
