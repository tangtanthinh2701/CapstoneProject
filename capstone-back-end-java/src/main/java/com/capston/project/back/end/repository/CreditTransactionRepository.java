package com.capston.project.back.end.repository;

import com.capston.project.back.end.common.TransactionType;
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

	// Find by credit
	List<CreditTransaction> findByCreditId(Integer creditId);

	List<CreditTransaction> findByCreditIdOrderByTransactionDateDesc(Integer creditId);

	// Find by buyer
	List<CreditTransaction> findByBuyerId(UUID buyerId);

	List<CreditTransaction> findByBuyerIdOrderByTransactionDateDesc(UUID buyerId);

	// Find by seller
	List<CreditTransaction> findBySellerId(UUID sellerId);

	// Find by type
	List<CreditTransaction> findByTransactionType(TransactionType transactionType);

	// Statistics - using native queries to avoid enum comparison issues
	@Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM credit_transactions WHERE transaction_type = 'PURCHASE' AND transaction_status = 'COMPLETED'", nativeQuery = true)
	BigDecimal sumTotalRevenue();

	@Query(value = "SELECT COALESCE(SUM(quantity), 0) FROM credit_transactions WHERE transaction_type = 'PURCHASE' AND transaction_status = 'COMPLETED'", nativeQuery = true)
	Long sumTotalCreditsSold();

	@Query(value = "SELECT COALESCE(SUM(quantity), 0) FROM credit_transactions WHERE transaction_type = 'RETIREMENT' AND transaction_status = 'COMPLETED'", nativeQuery = true)
	Long sumTotalCreditsRetired();

	@Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM credit_transactions WHERE credit_id = :creditId AND transaction_type = 'PURCHASE'", nativeQuery = true)
	BigDecimal sumRevenueByCreditId(@Param("creditId") Integer creditId);

	@Query(value = "SELECT COALESCE(SUM(quantity), 0) FROM credit_transactions WHERE buyer_id = :buyerId AND transaction_type = 'PURCHASE'", nativeQuery = true)
	Long sumCreditsPurchasedByBuyerId(@Param("buyerId") UUID buyerId);

	// Find by buyer or seller with pagination (for UserService)
	@Query("SELECT ct FROM CreditTransaction ct WHERE ct.buyerId = :userId1 OR ct.sellerId = :userId2")
	Page<CreditTransaction> findByBuyerIdOrSellerId(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2,
			Pageable pageable);

	// Count by buyer or seller (for UserService)
	@Query("SELECT COUNT(ct) FROM CreditTransaction ct WHERE ct.buyerId = :userId1 OR ct.sellerId = :userId2")
	long countByBuyerIdOrSellerId(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

	@Query(value = "SELECT COALESCE(SUM(quantity), 0) FROM credit_transactions " +
			"WHERE buyer_id = :userId AND credit_id = :creditId AND transaction_type = 'PURCHASE'", nativeQuery = true)
	Integer sumPurchasedByUserIdAndCreditId(@Param("userId") UUID userId, @Param("creditId") Integer creditId);

	@Query(value = "SELECT COALESCE(SUM(quantity), 0) FROM credit_transactions " +
			"WHERE buyer_id = :userId AND transaction_type = 'RETIREMENT'", nativeQuery = true)
	Integer sumRetiredByUserIdAndCreditId(@Param("userId") UUID userId, @Param("creditId") Integer creditId);

	@Query(value = "SELECT COALESCE(SUM(quantity), 0) FROM credit_transactions " +
			"WHERE buyer_id = :userId AND transaction_type = 'PURCHASE'", nativeQuery = true)
	Integer sumPurchasedByUserId(@Param("userId") UUID userId);

	@Query(value = "SELECT COALESCE(SUM(quantity), 0) FROM credit_transactions " +
			"WHERE buyer_id = :userId AND transaction_type = 'RETIREMENT'", nativeQuery = true)
	Integer sumRetiredByUserId(@Param("userId") UUID userId);
}
