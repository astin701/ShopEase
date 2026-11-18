package com.example.shopease.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.shopease.Entity.OrderEntity;

public class OrderResponseDTO {

    private Long orderId;
    private Long userId;
    private Long addressId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;

    // Constructor
    public OrderResponseDTO(OrderEntity order) {

        this.orderId = order.getId();
        this.userId = order.getUser().getId();
        this.addressId = order.getAddress().getId();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.createdAt = order.getCreatedAt();

        this.items = order.getOrderItems()
                .stream()
                .map(OrderItemResponseDTO::new)
                .toList();
    }

    // Getters
    public Long getOrderId() {
        return orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getAddressId() {
        return addressId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<OrderItemResponseDTO> getItems() {
        return items;
    }
}