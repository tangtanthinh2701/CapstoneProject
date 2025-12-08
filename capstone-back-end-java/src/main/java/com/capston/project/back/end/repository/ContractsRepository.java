package com.capston.project.back.end.repository;

import com.capston.project.back.end.entity.Contracts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContractsRepository extends JpaRepository<Contracts, Integer> {
	Boolean existsByContractCode(String contractCode);

	@Query("SELECT c FROM Contracts c WHERE c.enterprise.id = :enterpriseId")
	Page<Contracts> findByEnterpriseId(@Param("enterpriseId") UUID enterpriseId, Pageable pageable);

	@Query("SELECT c FROM Contracts c WHERE c.project.id = :projectId")
	Page<Contracts> findByProjectId(@Param("projectId") Integer projectId, Pageable pageable);
}
