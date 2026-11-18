package com.example.shopease.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.shopease.Entity.OrderEntity;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    
    List<OrderEntity>findAllByUserId(Long userId);

    boolean existsByAddress_IdAndStatusNot(Long addressId, String status);

    // Total revenue form delivered orders
    @Query("""
                SELECT COALESCE(SUM(o.totalAmount), 0)
                FROM OrderEntity o
                WHERE UPPER(o.status) = 'DELIVERED'
                """ )
    BigDecimal getTotalRevenue();

    // Total delivered orders
    @Query("""
        SELECT COUNT(o)
        FROM OrderEntity o
        WHERE UPPER(o.status) = 'DELIVERED'
    """)
    long countDeliveredOrders();

    // Today's revenue
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM OrderEntity o
        WHERE UPPER(o.status) = 'DELIVERED'
        AND o.createdAt >= :start
        AND o.createdAt < :end
        """)
    BigDecimal getTodayRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Monthly revenue
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM OrderEntity o
        WHERE UPPER(o.status) = 'DELIVERED'
        AND o.createdAt >= :start
        AND o.createdAt < :end
        """)
    BigDecimal getMonthlyRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

}