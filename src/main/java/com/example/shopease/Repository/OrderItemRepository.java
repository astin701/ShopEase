package com.example.shopease.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shopease.Entity.OrderItemEntity;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long>  {

    List<OrderItemEntity> findAllByOrderId(Long orderId);
    
}
