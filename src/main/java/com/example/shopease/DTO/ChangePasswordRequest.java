package com.example.shopease.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {
    
    @NotBlank(message = "Current password is required")
    @Size (min = 8, message = "Current password must contain at least 8 characters")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size (min = 8, message = "New password must contain at least 8 characters")
    private String newPassword;

    @NotBlank(message = "Please confirm your new password")
    @Size (min = 8, message = "Confirm password must contain at least 8 characters")
    private String confirmPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    


}
