package com.capston.project.back.end.response.generic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
	private Boolean success;
	private String message;
	private T data;
	private List<String> errors;
	private LocalDateTime timestamp;
	private PageInfo pageInfo;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class PageInfo {
		private int page;
		private int size;
		private long totalElements;
		private int totalPages;
		private boolean hasNext;
		private boolean hasPrevious;
	}

	public static <T> ApiResponse<T> success(T data) {
		return ApiResponse.<T>builder()
		                  .success(true)
		                  .message("Success")
		                  .data(data)
		                  .timestamp(LocalDateTime.now())
		                  .build();
	}

	public static <T> ApiResponse<T> success(String message, T data) {
		return ApiResponse.<T>builder()
		                  .success(true)
		                  .message(message)
		                  .data(data)
		                  .timestamp(LocalDateTime.now())
		                  .build();
	}

	public static <T> ApiResponse<T> success(String message, T data, PageInfo pageInfo) {
		return ApiResponse.<T>builder()
		                  .success(true)
		                  .message(message)
		                  .data(data)
		                  .pageInfo(pageInfo)
		                  .timestamp(LocalDateTime.now())
		                  .build();
	}

	public static <T> ApiResponse<T> error(String message) {
		return ApiResponse.<T>builder()
		                  .success(false)
		                  .message(message)
		                  .timestamp(LocalDateTime.now())
		                  .build();
	}

	public static <T> ApiResponse<T> error(String message, List<String> errors) {
		return ApiResponse.<T>builder()
		                  .success(false)
		                  .message(message)
		                  .errors(errors)
		                  .build();
	}
}
