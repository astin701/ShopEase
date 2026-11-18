package com.example.shopease.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shopease.Entity.AddressEntity;

public interface AddressRepository extends JpaRepository<AddressEntity, Long> {
    
    List<AddressEntity> findByUserId(Long userId);

    Optional<AddressEntity> findByIdAndUserId(Long id, Long userId);

    List<AddressEntity> findByUserIdAndDeletedFalse(Long userId);

    Optional<AddressEntity> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

}