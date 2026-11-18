package com.example.shopease.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shopease.Entity.CartEntity;

public interface  CartRepository extends JpaRepository<CartEntity, Long> {
    
    Optional<CartEntity>findByUserId(Long userId);

}
