package com.example.shopease.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.shopease.DTO.AdminProfileResponseDTO;
import com.example.shopease.DTO.AdminProfileUpdateRequest;
import com.example.shopease.DTO.AdminUserResponseDTO;
import com.example.shopease.DTO.ChangePasswordRequest;
import com.example.shopease.Service.OrderService;
import com.example.shopease.Service.UserService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;




@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;

    public AdminController(UserService userService, OrderService orderService) {
        this.userService = userService;
        this.orderService = orderService;
    }

    @GetMapping("/users")
    public List<AdminUserResponseDTO> getAllUsers() {

        return userService.getAllUsers();
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestParam boolean enabled, Authentication authentication) {
        
        String adminEmail = authentication.getName();
        
        return userService.updateUserStatus(userId, enabled, adminEmail);
    }

    @GetMapping("/revenue-statistics")
    public ResponseEntity<?> getRevenueStatistics() {
        return ResponseEntity.ok(orderService.getRevenueStatistics());
    }
    
    @GetMapping("/profile")
    public AdminProfileResponseDTO getAdminProfile(Authentication authentication) {
        String email = authentication.getName();
        return userService.getAdminProfile(email);
    }

    @PutMapping("/profile")
    public ResponseEntity<AdminProfileResponseDTO> updateAdminProfile(@Valid @RequestBody AdminProfileUpdateRequest request, Authentication authentication) {
        
        String email = authentication.getName();

        AdminProfileResponseDTO updatedProfile = userService.updateAdminProfile(email, request);
        
        return ResponseEntity.ok(updatedProfile);
    }
    
    @PutMapping("/profile/change-password")
    public ResponseEntity<?> changeAdminPassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        String email = authentication.getName();
        return userService.changeAdminPassword(email, request);
    }

}