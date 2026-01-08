package com.capston.project.back.end.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerResponse {

	private Integer id;
	private String partnerName;
	private String imgUrl;

	// Statistics
	private Integer totalProjects;
	private List<ProjectPartnerInfo> projects;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectPartnerInfo {
		private Integer projectId;
		private String projectName;
		private String projectCode;
		private String role;
	}
}