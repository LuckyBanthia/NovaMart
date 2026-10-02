package com.novamart.order.repository;

import com.novamart.common.enums.OrderStatus;
import com.novamart.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for orders and revenue calculations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    List<Order> findByUserEmailOrderByOrderDateDesc(String userEmail);

    List<Order> findAllByOrderByOrderDateDesc();

    Long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != com.novamart.common.enums.OrderStatus.CANCELLED")
    BigDecimal calculateTotalRevenue();
}
