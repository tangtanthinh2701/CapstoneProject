package com.capston.project.back.end.exception;

import com.capston.project.back.end.response.generic.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
		log.error("Resource not found: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ApiResponse<Void>> handleDuplicateResourceException(DuplicateResourceException ex) {
		log.error("Duplicate resource: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.CONFLICT)
				.body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
		log.error("JSON parse error: {}", ex.getMessage());

		String userMessage = "Invalid request format";

		// Check for date parsing errors
		Throwable cause = ex.getCause();
		if (cause != null) {
			Throwable rootCause = cause.getCause();
			if (rootCause instanceof DateTimeParseException) {
				DateTimeParseException dtpe = (DateTimeParseException) rootCause;
				userMessage = String.format("Invalid date value: '%s'. Please use a valid date (e.g., 2025-04-30 instead of 2025-04-31)",
						dtpe.getParsedString());
			} else if (cause.getMessage() != null && cause.getMessage().contains("LocalDate")) {
				// Extract the invalid date from error message
				String errorMsg = cause.getMessage();
				if (errorMsg.contains("Invalid date")) {
					userMessage = "Invalid date: " + extractDateError(errorMsg);
				} else {
					userMessage = "Invalid date format. Please use format: YYYY-MM-DD (e.g., 2025-04-30)";
				}
			}
		}

		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error(userMessage));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
			MethodArgumentNotValidException ex) {
		Map<String, String> errors = new HashMap<>();
		ex.getBindingResult().getAllErrors().forEach((error) -> {
			String fieldName = ((FieldError) error).getField();
			String errorMessage = error.getDefaultMessage();
			errors.put(fieldName, errorMessage);
		});

		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.<Map<String, String>>builder()
				                 .success(false)
				                 .message("Validation failed")
				                 .data(errors)
				                 .build());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
		log.error("Illegal argument: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(IllegalStateException ex) {
		log.error("Illegal state: {}", ex.getMessage());
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
		log.error("Unexpected error: ", ex);
		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponse.error("An unexpected error occurred"));
	}

	private String extractDateError(String errorMsg) {
		// Extract meaningful message from "Invalid date 'APRIL 31'"
		if (errorMsg.contains("APRIL 31")) {
			return "April only has 30 days, not 31";
		} else if (errorMsg.contains("FEBRUARY 30") || errorMsg.contains("FEBRUARY 31")) {
			return "February does not have 30 or 31 days";
		} else if (errorMsg.contains("FEBRUARY 29")) {
			return "February 29 is only valid in leap years";
		}
		return errorMsg;
	}
}
