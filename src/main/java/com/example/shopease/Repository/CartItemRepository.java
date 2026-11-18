package com.example.shopease.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shopease.Entity.CartItemEntity;

public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {
    
    Optional<CartItemEntity> findByCartIdAndProductId(Long cartId, Long productId);

    Optional<CartItemEntity> findByIdAndCartId(Long itemId, Long cartId);

    List<CartItemEntity> findAllByCartId(Long cartId);

}