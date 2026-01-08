package com.capston.project.back.end.response;

import lombok.*;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPartnerResponse {

	private Integer id;

	// Project info
	private Integer projectId;
	private String projectName;
	private String projectCode;

	// Partner info
	private Integer partnerId;
	private String partnerName;
	private String partnerImgUrl;

	private String role;
	private String notes;
	private OffsetDateTime createdAt;
}