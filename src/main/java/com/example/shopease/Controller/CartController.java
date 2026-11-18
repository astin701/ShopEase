package com.example.shopease.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shopease.Service.CartService;

import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/cart")
@Validated
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add/{userId}/{productId}/{quantity}")
    public ResponseEntity<?> addToCart(
            @PathVariable @Positive(message = "User ID must be positive") Long userId,
            @PathVariable @Positive(message = "Product ID must be positive") Long productId,
            @PathVariable @Positive(message = "Quantity must be greater than zero") int quantity) {

        return cartService.addToCart(userId, productId, quantity);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(
            @PathVariable @Positive(message = "User ID must be positive") Long userId) {

        return cartService.getCart(userId);
    }

    @PutMapping("/update/{userId}/{cartItemId}/{quantity}")
    public ResponseEntity<?> updateCartQuantity(
            @PathVariable @Positive(message = "User ID must be positive") Long userId,
            @PathVariable @Positive(message = "Cart item ID must be positive") Long cartItemId,
            @PathVariable @Positive(message = "Quantity must be greater than zero") int quantity) {

        return cartService.updateCartQuantity(userId, cartItemId, quantity);
    }

    @DeleteMapping("/remove/{userId}/{cartItemId}")
    public ResponseEntity<?> removeCartItem(
            @PathVariable @Positive(message = "User ID must be positive") Long userId,
            @PathVariable @Positive(message = "Cart item ID must be positive") Long cartItemId) {

        return cartService.removeCartItem(userId, cartItemId);
    }
}