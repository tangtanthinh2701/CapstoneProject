package com.capston.project.back.end.repository;

import com.capston.project.back.end.models.TreeSpeciesOnPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TreeSpeciesOnPhaseRepository extends JpaRepository<TreeSpeciesOnPhase, Integer> {
	List<TreeSpeciesOnPhase> findByPhaseId(Integer phaseId);
}
