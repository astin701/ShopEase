package com.example.shopease.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shopease.Entity.CategoryEntity;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    
}