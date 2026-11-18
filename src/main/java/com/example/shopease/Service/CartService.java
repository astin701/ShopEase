package com.example.shopease.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.shopease.DTO.CartItemResponseDTO;
import com.example.shopease.Entity.CartEntity;
import com.example.shopease.Entity.CartItemEntity;
import com.example.shopease.Entity.ProductEntity;
import com.example.shopease.Entity.UserEntity;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.CartItemRepository;
import com.example.shopease.Repository.CartRepository;
import com.example.shopease.Repository.ProductRepository;
import com.example.shopease.Repository.UserRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Add product to cart
    public ResponseEntity<?> addToCart(Long userId, Long productId, int quantity) {

        if (quantity <= 0) {
            return ResponseEntity.badRequest()
                    .body("Quantity must be greater than zero");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        ProductEntity product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with ID: " + productId));

        if (quantity > product.getQuantity()) {
            return ResponseEntity.badRequest()
                    .body("Insufficient product stock");
        }

        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CartEntity newCart = new CartEntity();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        Optional<CartItemEntity> existingItem =
                cartItemRepository.findByCartIdAndProductId(
                        cart.getId(), productId);

        if (existingItem.isPresent()) {

            CartItemEntity cartItem = existingItem.get();

            int newQuantity = cartItem.getQuantity() + quantity;

            if (newQuantity > product.getQuantity()) {
                return ResponseEntity.badRequest()
                        .body("Insufficient product stock");
            }

            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);

            return ResponseEntity.ok(
                    "Cart quantity updated successfully");
        }

        CartItemEntity cartItem = new CartItemEntity();

        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);

        return ResponseEntity.ok(
                "Product added to cart successfully");
    }

    // Get cart
    public ResponseEntity<?> getCart(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart not found for user ID: " + userId));

        Long cartId = cart.getId();

        List<CartItemEntity> cartItems =
                cartItemRepository.findAllByCartId(cartId);

        List<CartItemResponseDTO> response = new ArrayList<>();

        for (CartItemEntity item : cartItems) {

            ProductEntity product = item.getProduct();

        //     if (product.isDeleted()) {
        //         continue;
        //     }

            BigDecimal price = product.getPrice();
            int quantity = item.getQuantity();

            BigDecimal subtotal =
                    price.multiply(BigDecimal.valueOf(quantity));

            CartItemResponseDTO dto = new CartItemResponseDTO(
                    item.getId(),
                    product.getId(),
                    product.getName(),
                    price,
                    product.getImageUrl(),
                    quantity,
                    subtotal,
                    !product.isDeleted()
            );

            response.add(dto);
        }

        return ResponseEntity.ok(response);
    }

    // Remove cart item
    public ResponseEntity<?> removeCartItem(
            Long userId, Long cartItemId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart not found for user ID: " + userId));

        CartItemEntity cartItem =
                cartItemRepository.findByIdAndCartId(
                        cartItemId, cart.getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Cart item not found with ID: " + cartItemId));

        cartItemRepository.delete(cartItem);

        return ResponseEntity.ok(
                "Cart item removed successfully");
    }

    // Update cart quantity
    public ResponseEntity<?> updateCartQuantity(
            Long userId, Long cartItemId, int quantity) {

        if (quantity <= 0) {
            return ResponseEntity.badRequest()
                    .body("Quantity must be greater than zero");
        }

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart not found for user ID: " + userId));

        CartItemEntity cartItem =
                cartItemRepository.findByIdAndCartId(
                        cartItemId, cart.getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Cart item not found with ID: " + cartItemId));

        ProductEntity product = cartItem.getProduct(); 

        if (product.isDeleted()) {
                return ResponseEntity.badRequest().body("This product is no longer available");
        }

        if (quantity > product.getQuantity()) {
            return ResponseEntity.badRequest()
                    .body("Only " + product.getQuantity() + " items are available in stock.");
        }

        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);

        return ResponseEntity.ok(
                "Cart quantity updated successfully");
    }
}