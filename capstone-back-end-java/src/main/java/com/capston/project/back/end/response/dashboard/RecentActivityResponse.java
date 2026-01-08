package com.capston.project.back.end.response.dashboard;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentActivityResponse {
	private String activityType;    // CONTRACT_CREATED, CREDIT_ISSUED, TRANSACTION, etc.
	private String description;
	private String referenceCode;
	private Integer referenceId;
	private OffsetDateTime timestamp;
}
