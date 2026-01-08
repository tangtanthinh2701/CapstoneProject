package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.TransactionStatus;
import com.capston.project.back.end.entity.CreditTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Integer> {

	boolean existsByTransactionCode(String transactionCode);

	Optional<CreditTransaction> findByTransactionCode(String transactionCode);

	@Query("SELECT t FROM CreditTransaction t " +
	       "LEFT JOIN FETCH t.carbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE t.id = :id")
	Optional<CreditTransaction> findByIdWithDetails(@Param("id") Integer id);

	// Find by credit
	List<CreditTransaction> findByCarbonCreditId(Integer creditId);

	@Query("SELECT t FROM CreditTransaction t " +
	       "LEFT JOIN FETCH t.carbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE t.carbonCredit.id = :creditId " +
	       "ORDER BY t. purchasedAt DESC")
	List<CreditTransaction> findByCreditIdWithDetails(@Param("creditId") Integer creditId);

	// Find by enterprise
	List<CreditTransaction> findByEnterpriseId(UUID enterpriseId);

	@Query("SELECT t FROM CreditTransaction t " +
	       "LEFT JOIN FETCH t.carbonCredit c " +
	       "LEFT JOIN FETCH c.project " +
	       "WHERE t.enterpriseId = :enterpriseId " +
	       "ORDER BY t. purchasedAt DESC")
	List<CreditTransaction> findByEnterpriseIdWithDetails(@Param("enterpriseId") UUID enterpriseId);

	Page<CreditTransaction> findByEnterpriseId(UUID enterpriseId, Pageable pageable);

	// Find by status
	Page<CreditTransaction> findByTransactionStatus(TransactionStatus status, Pageable pageable);

	List<CreditTransaction> findByTransactionStatus(TransactionStatus status);

	// Statistics
	Long countByTransactionStatus(TransactionStatus status);

	@Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM CreditTransaction t WHERE t.transactionStatus = 'PURCHASED'")
	BigDecimal sumTotalRevenue();

	@Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM CreditTransaction t " +
	       "WHERE t.carbonCredit.id = :creditId AND t.transactionStatus = 'PURCHASED'")
	BigDecimal sumRevenueByCreditId(@Param("creditId") Integer creditId);

	@Query("SELECT COALESCE(SUM(t. quantity), 0) FROM CreditTransaction t " +
	       "WHERE t.enterpriseId = :enterpriseId AND t.transactionStatus = 'PURCHASED'")
	Integer sumPurchasedCreditsByEnterpriseId(@Param("enterpriseId") UUID enterpriseId);

	@Query("SELECT COALESCE(SUM(t.quantity), 0) FROM CreditTransaction t " +
	       "WHERE t.enterpriseId = :enterpriseId AND t.transactionStatus = 'RETIRED'")
	Integer sumRetiredCreditsByEnterpriseId(@Param("enterpriseId") UUID enterpriseId);

	@Query("SELECT COALESCE(AVG(t.unitPrice), 0) FROM CreditTransaction t WHERE t.transactionStatus = 'PURCHASED'")
	BigDecimal avgPricePerCredit();

	@Query("SELECT t FROM CreditTransaction t ORDER BY t.createdAt DESC LIMIT :limit")
	List<CreditTransaction> findRecentTransactions(@Param("limit") int limit);

	@Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM CreditTransaction t " +
	       "WHERE EXTRACT(YEAR FROM t.purchasedAt) = :year AND EXTRACT(MONTH FROM t.purchasedAt) = :month " +
	       "AND t.transactionStatus = 'PURCHASED'")
	BigDecimal sumRevenueByMonth(@Param("year") Integer year, @Param("month") Integer month);

	@Query("SELECT COUNT(t) FROM CreditTransaction t " +
	       "WHERE EXTRACT(YEAR FROM t.purchasedAt) = :year AND EXTRACT(MONTH FROM t.purchasedAt) = :month")
	Long countByMonth(@Param("year") Integer year, @Param("month") Integer month);

	@Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM CreditTransaction t " +
	       "WHERE t.carbonCredit.project.id = :projectId AND t.transactionStatus = 'PURCHASED'")
	BigDecimal sumRevenueByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COUNT(t) FROM CreditTransaction t WHERE t.carbonCredit.project. id = :projectId")
	Long countByProjectId(@Param("projectId") Integer projectId);

	@Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM CreditTransaction t " +
	       "WHERE EXTRACT(YEAR FROM t.purchasedAt) = :year AND t.transactionStatus = 'PURCHASED'")
	BigDecimal sumRevenueByYear(@Param("year") Integer year);

	@Query("SELECT t. enterpriseId, SUM(t.totalAmount), SUM(t.quantity), " +
	       "SUM(CASE WHEN t.transactionStatus = 'RETIRED' THEN t.quantity ELSE 0 END), COUNT(t) " +
	       "FROM CreditTransaction t GROUP BY t.enterpriseId ORDER BY SUM(t.totalAmount) DESC LIMIT :limit")
	List<Object[]> findTopBuyers(@Param("limit") int limit);
}