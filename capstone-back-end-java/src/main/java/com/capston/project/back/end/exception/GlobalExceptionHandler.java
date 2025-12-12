package com.capston.project.back.end.exception;

import com.capston.project.back.end.response.generic.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;
@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
		                     .body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
		                     .body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(IllegalStateException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
		                     .body(ApiResponse.error(ex.getMessage()));
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
		                     .body(ApiResponse.error("Username hoặc password không chính xác"));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<List<String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {

		List<String> errorMessages = ex.getBindingResult().getFieldErrors()
		                               .stream()
		                               .map(e -> e.getField() + ": " + e.getDefaultMessage())
		                               .toList();

		ApiResponse<List<String>> response = ApiResponse.<List<String>>builder()
		                                                .success(false)
		                                                .message("Validation failed")
		                                                .errors(errorMessages)
		                                                .timestamp(LocalDateTime.now())
		                                                .build();

		return ResponseEntity.badRequest().body(response);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<List<String>>> handleGlobalException(Exception ex) {

		ApiResponse<List<String>> response = ApiResponse.<List<String>>builder()
		                                                .success(false)
		                                                .message("Internal Server Error")
		                                                .errors(List.of(ex.getClass()
		                                                                  .getName(),
		                                                                ex.getMessage() != null
		                                                                ? ex.getMessage()
		                                                                : "(no message)"
		                                                               ))
		                                                .timestamp(LocalDateTime.now())
		                                                .build();

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	}

	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ApiResponse<Void>> handleDuplicateResourceException(DuplicateResourceException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
		                     .body(ApiResponse.error(ex.getMessage()));
	}
}
