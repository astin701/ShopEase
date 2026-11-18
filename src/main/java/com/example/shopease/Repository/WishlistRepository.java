package com.example.shopease.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shopease.Entity.WishlistEntity;

public interface WishlistRepository extends JpaRepository<WishlistEntity, Long> {
    
    List<WishlistEntity> findAllByUserId(Long userId);

    Optional<WishlistEntity> findByUserIdAndProductId(Long userId, Long productId);

    Optional<WishlistEntity> findByIdAndUserId(Long id, Long userId);

}
