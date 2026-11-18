package com.example.shopease.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shopease.Entity.ActivityLogEntity;

public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {

    List<ActivityLogEntity> findByAdminEmailOrderByCreatedAtDesc(String adminEmail);

    List<ActivityLogEntity> findAllByOrderByCreatedAtDesc();
    
}