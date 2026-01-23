package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.Role;
import com.capston.project.back.end.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
	Optional<User> findByUsername(String username);

	Optional<User> findByEmail(String email);

	boolean existsByUsername(String username);

	@Query(value = "SELECT id FROM users WHERE role = 'ADMIN' AND is_active = true", nativeQuery = true)
	List<UUID> findAllAdminIds();

	// Find by role
	Page<User> findByRole(Role role, Pageable pageable);

	// Find by active status
	Page<User> findByIsActive(Boolean isActive, Pageable pageable);

	// Find by role and active status
	Page<User> findByRoleAndIsActive(Role role, Boolean isActive, Pageable pageable);

	// Search by keyword (username, fullname, email, phone)
	@Query("SELECT u FROM User u WHERE " +
			"LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
			"LOWER(u.fullname) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
			"LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
			"u.phoneNumber LIKE CONCAT('%', :keyword, '%')")
	Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	// Find all users by role (not pageable - for notifications)
	List<User> findAllByRoleAndIsActiveTrue(Role role);

	// Count by role
	long countByRole(Role role);

	// Count active users
	long countByIsActiveTrue();
}
