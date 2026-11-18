package com.example.shopease.DTO;

import java.math.BigDecimal;

import com.example.shopease.Entity.OrderItemEntity;

public class OrderItemResponseDTO {

    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private BigDecimal price;
    private int quantity;
    private BigDecimal subtotal;

    // Constructor
    public OrderItemResponseDTO(OrderItemEntity item) {

        this.id = item.getId();
        this.productId = item.getProduct().getId();
        this.productName = item.getProductName();
        this.imageUrl = item.getProduct().getImageUrl();
        this.price = item.getPrice();
        this.quantity = item.getQuantity();
        this.subtotal = item.getSubtotal();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }
}