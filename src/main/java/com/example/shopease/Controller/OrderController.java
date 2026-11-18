package com.example.shopease.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.shopease.Service.OrderService;

import jakarta.validation.constraints.Positive;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/orders")
@Validated
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =================================
    // GET CUSTOMER ORDERS
    // =================================

    @GetMapping("/user")
    public ResponseEntity<?> getUserOrders(Authentication authentication) {

        String email = authentication.getName();

        return orderService.getUserOrders(email);
    }

    // =================================
    // GET ORDER DETAILS
    // =================================

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable @Positive Long orderId,
            Authentication authentication) {

        String email = authentication.getName();

        return orderService.getOrderById(orderId, email);
    }

    // =================================
    // CANCEL ORDER
    // =================================

    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable @Positive Long orderId,
            Authentication authentication) {

        String email = authentication.getName();

        return orderService.cancelOrder(orderId, email);
    }

    // =================================
    // PLACE ORDER
    // =================================

    @PostMapping("/place/{addressId}")
    public ResponseEntity<?> placeOrder(
            @PathVariable @Positive(message = "Address ID must be positive") Long addressId,
            Authentication authentication) {

        String email = authentication.getName();

        return orderService.placeOrder(addressId, email);
    }

    // ================================
    // ADMIN UPDATE ORDER STATUS
    // ================================

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable @Positive Long orderId, @RequestParam String status){
        return orderService.updateOrderStatus(orderId, status);
    }

}