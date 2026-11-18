package com.example.shopease.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WishlistResponseDTO {
    
    private Long wishlistId;

    private Long productId;

    private String productName;

    private BigDecimal price;

    private String imageUrl;

    private LocalDateTime createdAt;

    public WishlistResponseDTO(){
    }

    public WishlistResponseDTO(Long wishlistId, Long productId, String productName, BigDecimal price, String imageUrl,
            LocalDateTime createdAt) {
        this.wishlistId = wishlistId;
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    public Long getWishlistId() {
        return wishlistId;
    }

    public void setWishlistId(Long wishlistId) {
        this.wishlistId = wishlistId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createAt) {
        this.createdAt = createAt;
    }

}