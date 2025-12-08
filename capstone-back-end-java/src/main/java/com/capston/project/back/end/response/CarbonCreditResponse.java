package com.capston.project.back.end.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCreditResponse {
	private Integer id;
	private String creditCode;
	private Integer projectId;
	private String projectName;
	private Integer reportYear;
	private BigDecimal totalCo2Tons;
	private Integer creditsIssued;
	private Integer creditsSold;
	private Integer creditsRetired;
	private Integer creditsAvailable;
	private BigDecimal pricePerCredit;
	private String creditsStatus;
	private String verificationStandard;
	private String certificateUrl;
	private OffsetDateTime issuedAt;
	private OffsetDateTime expiresAt;
}
