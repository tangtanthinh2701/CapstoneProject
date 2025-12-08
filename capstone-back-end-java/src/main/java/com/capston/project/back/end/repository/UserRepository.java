package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
	Optional<User> findByUsername(String username);
	boolean existsByUsername(String username);
}

