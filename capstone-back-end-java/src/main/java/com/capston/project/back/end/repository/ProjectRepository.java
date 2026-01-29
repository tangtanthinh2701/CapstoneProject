package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.ProjectStatus;
import com.capston.project.back.end.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {

	boolean existsByCode(String code);

	Optional<Project> findByCode(String code);

	// Tìm project với phases (dùng JOIN FETCH để tránh N+1)
	@Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.phases WHERE p.id = :id")
	Optional<Project> findByIdWithPhases(@Param("id") Integer id);

	@Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.phases WHERE p.code = :code")
	Optional<Project> findByCodeWithPhases(@Param("code") String code);

	// Tìm theo status
	Page<Project> findByProjectStatus(ProjectStatus status, Pageable pageable);

	Page<Project> findByProjectStatusAndManagerId(ProjectStatus status, UUID managerId, Pageable pageable);

	// Tìm theo manager
	Page<Project> findByManagerId(UUID managerId, Pageable pageable);

	// Pagination helpers
	@Query("SELECT p.id FROM Project p")
	Page<Integer> findAllProjectIds(Pageable pageable);

	@Query("SELECT p.id FROM Project p WHERE p.managerId = :managerId")
	Page<Integer> findProjectIdsByManager(@Param("managerId") UUID managerId, Pageable pageable);

	@Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.phases WHERE p.id IN :ids")
	List<Project> findAllWithPhasesByIds(@Param("ids") List<Integer> ids);

	@Query("SELECT p FROM Project p WHERE " +
			"LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
			"LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	Page<Project> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	@Query("SELECT p FROM Project p WHERE " +
			"(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
			"LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
			"p.managerId = :managerId")
	Page<Project> searchByKeywordAndManager(@Param("keyword") String keyword, @Param("managerId") UUID managerId,
			Pageable pageable);

	// Cập nhật computed fields
	@Modifying
	@Query("UPDATE Project p SET " +
			"p.totalBudget = :budget, " +
			"p.targetCo2Kg = :targetCarbon, " +
			"p.actualCo2Kg = :currentCarbon, " +
			"p.updatedAt = CURRENT_TIMESTAMP " +
			"WHERE p.id = :projectId")
	void updateComputedFields(@Param("projectId") Integer projectId,
			@Param("budget") BigDecimal budget,
			@Param("targetCarbon") BigDecimal targetCarbon,
			@Param("currentCarbon") BigDecimal currentCarbon);

	// Lấy tất cả project IDs để batch update
	@Query("SELECT p.id FROM Project p")
	List<Integer> findAllProjectIds();

	@Query("SELECT COUNT(p) FROM Project p WHERE p.projectStatus = :status")
	Long countByProjectStatus(@Param("status") ProjectStatus status);

	@Query("SELECT COALESCE(SUM(p.targetCo2Kg), 0) FROM Project p")
	BigDecimal sumTargetCo2Kg();

	@Query("SELECT p FROM Project p ORDER BY p.actualCo2Kg DESC LIMIT :limit")
	List<Project> findTopProjectsByCo2(@Param("limit") int limit);

	// @Query("SELECT p FROM Project p ORDER BY p.totalCo2Absorbed DESC")
	// List<Project> findTopProjectsByCo2Ordered();

	@Query("SELECT COUNT(p) FROM Project p WHERE p.projectStatus IN :statuses")
	Long countByProjectStatusIn(@Param("statuses") List<ProjectStatus> statuses);

	// ✅ Count active projects (not PLANNING, not COMPLETED)
	@Query("SELECT COUNT(p) FROM Project p " +
			"WHERE p.projectStatus NOT IN ('PLANNING', 'COMPLETED')")
	Long countActiveInProgressProjects();
}
