package com.capston.project.back.end.repository;

import com.capston.project.back.end.models.ProjectPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProjectPhaseRepository extends JpaRepository<ProjectPhase, Integer> {
}
