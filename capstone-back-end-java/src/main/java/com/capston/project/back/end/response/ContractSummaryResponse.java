package com.capston.project.back.end.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractSummaryResponse {

	private Long totalContracts;
	private Long activeContracts;
	private Long pendingContracts;
	private Long expiringSoonContracts;
	private Long expiredContracts;

	private BigDecimal totalContractValue;
	private BigDecimal activeContractValue;

	private Long totalOwnerships;
}
