package com.example.shopease.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.shopease.Entity.ActivityLogEntity;
import com.example.shopease.Repository.ActivityLogRepository;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    // Constructor Injection
    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    // Save a new activity
    public ActivityLogEntity saveActivity(String adminEmail, String actionType, String description, String targetType, Long targetId) {

        ActivityLogEntity activity = new ActivityLogEntity();

        activity.setAdminEmail(adminEmail);
        activity.setActionType(actionType);
        activity.setDescription(description);
        activity.setTargetType(targetType);
        activity.setTargetId(targetId);

        return activityLogRepository.save(activity);
    }

    // Get all activities (Newest first)
    public List<ActivityLogEntity> getAllActivities() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }

    // Get activities by admin email (Newest first)
    public List<ActivityLogEntity> getActivitiesByAdmin(String adminEmail) {
        return activityLogRepository.findByAdminEmailOrderByCreatedAtDesc(adminEmail);
    }
}