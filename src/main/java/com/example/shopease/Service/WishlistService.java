package com.example.shopease.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.shopease.DTO.WishlistResponseDTO;
import com.example.shopease.Entity.ProductEntity;
import com.example.shopease.Entity.UserEntity;
import com.example.shopease.Entity.WishlistEntity;
import com.example.shopease.Exception.DuplicateResourceException;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.ProductRepository;
import com.example.shopease.Repository.UserRepository;
import com.example.shopease.Repository.WishlistRepository;

@Service 
public class WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository, ProductRepository productRepository){
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public ResponseEntity<?> addToWishlist(Long userId, Long productId){
        UserEntity user = userRepository.findById(userId).orElseThrow(()-> new ResourceNotFoundException("User not found with ID: " + userId));
        
        ProductEntity product = productRepository.findByIdAndDeletedFalse(productId).orElseThrow(()-> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        Optional<WishlistEntity> existingItem = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existingItem.isPresent()) {
            throw new DuplicateResourceException("Product already exists in wishlist");
        }
        WishlistEntity wishlist = new WishlistEntity();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        WishlistEntity savedWishlist = wishlistRepository.save(wishlist);
        WishlistResponseDTO response = new WishlistResponseDTO(
            savedWishlist.getId(),
            savedWishlist.getProduct().getId(),
            savedWishlist.getProduct().getName(),
            savedWishlist.getProduct().getPrice(),
            savedWishlist.getProduct().getImageUrl(),
            savedWishlist.getCreatedAt()
        );
        return ResponseEntity.ok(response);

    }

    public List<WishlistResponseDTO> getAllWishlist(Long userId){

        userRepository.findById(userId).orElseThrow(()-> new ResourceNotFoundException("User not found with ID: " + userId)); 

        List<WishlistEntity> wishlistItems = wishlistRepository.findAllByUserId(userId);
        return wishlistItems.stream()
        .filter(item -> !item.getProduct().isDeleted())
        .map(item -> new WishlistResponseDTO(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getPrice(),
                item.getProduct().getImageUrl(),
                item.getCreatedAt()
            )).toList();
    }

    public ResponseEntity<Void> removeFromWishlist(Long wishlistId, Long userId){
        userRepository.findById(userId).orElseThrow(()-> new ResourceNotFoundException("User not found with ID: " + userId));
        WishlistEntity wishlist = wishlistRepository.findByIdAndUserId(wishlistId, userId).orElseThrow(()-> new ResourceNotFoundException("Wishlist item not found with ID: " + wishlistId));
        wishlistRepository.delete(wishlist);
        return ResponseEntity.noContent().build();
    }

}