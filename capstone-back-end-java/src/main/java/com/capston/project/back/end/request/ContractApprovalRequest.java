package com.capston.project.back.end.request;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractApprovalRequest {
	private UUID approvedBy;
	private String notes;
}
