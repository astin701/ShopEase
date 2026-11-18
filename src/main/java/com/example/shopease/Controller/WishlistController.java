package com.example.shopease.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shopease.DTO.WishlistResponseDTO;
import com.example.shopease.Service.WishlistService;

import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/wishlist")
@Validated
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/add/{userId}/{productId}")
    public ResponseEntity<?> addToWishlist(
            @PathVariable @Positive(message = "User ID must be positive") Long userId,
            @PathVariable @Positive(message = "Product ID must be positive") Long productId) {

        return wishlistService.addToWishlist(userId, productId);
    }

    @GetMapping("/{userId}")
    public List<WishlistResponseDTO> getAllWishlist(
            @PathVariable @Positive(message = "User ID must be positive") Long userId) {

        return wishlistService.getAllWishlist(userId);
    }

    @DeleteMapping("/remove/{userId}/{wishlistId}")
    public ResponseEntity<Void> removeWishlist(
            @PathVariable @Positive(message = "User ID must be positive") Long userId,
            @PathVariable @Positive(message = "Wishlist ID must be positive") Long wishlistId) {

        return wishlistService.removeFromWishlist(wishlistId, userId);
    }
}