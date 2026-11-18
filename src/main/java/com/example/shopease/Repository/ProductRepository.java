package com.example.shopease.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.shopease.Entity.ProductEntity;

import jakarta.persistence.LockModeType;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    List<ProductEntity> findByDeletedFalse();

    Optional<ProductEntity> findByIdAndDeletedFalse(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductEntity p WHERE p.id = :id AND p.deleted = false")
    Optional<ProductEntity> findByIdAndDeletedFalseWithLock(@Param("id") Long id);

    long countByCategory_Id(Long categoryId);

}