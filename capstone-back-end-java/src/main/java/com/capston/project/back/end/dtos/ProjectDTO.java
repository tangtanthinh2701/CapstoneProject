package com.capston.project.back.end.dtos;

import com.capston.project.back.end.common.ProjectStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDTO {
	private Integer id;

	private String code;

	@NotBlank(message = "Tên dự án không được để trống")
	@Size(max = 255, message = "Tên dự án tối đa 255 ký tự")
	private String name;

	private String description;

	@NotBlank(message = "Vị trí không được để trống")
	private String locationText;

	private BigDecimal latitude;

	private BigDecimal longitude;

	@NotNull(message = "Diện tích không được để trống")
	@DecimalMin(value = "0.01", message = "Diện tích phải lớn hơn 0")
	private BigDecimal area;

	@Pattern(regexp = "^(m2|ha)$", message = "Đơn vị diện tích phải là m2 hoặc ha")
	private String areaUnit = "m2";

	private BigDecimal usableArea;

	@NotNull(message = "Ngày trồng không được để trống")
	@PastOrPresent(message = "Ngày trồng không được là ngày tương lai")
	private LocalDate plantingDate;

	@NotNull(message = "Số lượng cây dự kiến không được để trống")
	@Min(value = 1, message = "Số lượng cây phải lớn hơn 0")
	private Integer totalTreesPlanned;

	private Integer totalTreesActual;

	private BigDecimal plantingDensity;

	private ProjectStatus status;

	private UUID managerId;

	private List<String> partnerOrganizations;

	private Boolean isPublic;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	private String phaseName = "Giai đoạn 1";

	private Integer expectedDurationDays;

	private BigDecimal budget;

	@NotNull(message = "Danh sách loại cây không được để trống")
	@Size(min = 1, message = "Phải có ít nhất 1 loại cây")
	@Valid
	private List<TreeSpeciesDTO> treeSpecies;

	private List<ProjectPhaseDTO> phases;

	// Thông tin tóm tắt (cho list)
	private Integer numberOfPhases;
	private Integer numberOfTreeSpecies;
}
