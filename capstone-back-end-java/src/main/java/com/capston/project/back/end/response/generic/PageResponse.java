package com.capston.project.back.end.response.generic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {
	private List<T> content;
	private int pageNumber;
	private int pageSize;

	private Long totalElements;
	private Integer totalPages;
	private Boolean last;
}
