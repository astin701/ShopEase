package com.example.shopease.Service;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.shopease.DTO.ProductRequestDTO;
import com.example.shopease.Entity.CategoryEntity;
import com.example.shopease.Entity.ProductEntity;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.CategoryRepository;
import com.example.shopease.Repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final ActivityLogService activityLogService;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            FileStorageService fileStorageService,
            ActivityLogService activityLogService) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
        this.activityLogService = activityLogService;
    }

    // =================================
    // GET ALL ACTIVE PRODUCTS
    // =================================

    public List<ProductEntity> getAll() {

        return productRepository.findByDeletedFalse();
    }

    // =================================
    // GET ONE ACTIVE PRODUCT
    // =================================

    public ProductEntity getOneProduct(Long id) {

        return productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with ID: " + id));
    }

    // =================================
    // ADD NEW PRODUCT
    // =================================

    public ResponseEntity<ProductEntity> addProduct(
            ProductRequestDTO request,
            MultipartFile image,
            String adminEmail) {

        CategoryEntity category = categoryRepository.findById(
                request.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found."));

        String imageUrl = storeImage(image);

        ProductEntity product = new ProductEntity();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setCategory(category);
        product.setImageUrl(imageUrl);
        product.setDeleted(false);

        ProductEntity savedProduct = productRepository.save(product);

        // Record product creation activity
        activityLogService.saveActivity(
                adminEmail,
                "PRODUCT_CREATED",
                "Created product: " + savedProduct.getName(),
                "PRODUCT",
                savedProduct.getId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    // =================================
    // UPDATE PRODUCT
    // =================================

    public ProductEntity updateProduct(
            Long id,
            ProductRequestDTO updatedProduct,
            MultipartFile image,
            String adminEmail) {

        ProductEntity existingProduct = getOneProduct(id);

        CategoryEntity category = categoryRepository.findById(
                updatedProduct.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found."));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setQuantity(updatedProduct.getQuantity());
        existingProduct.setCategory(category);

        // Replace image only when a new image is selected
        if (image != null && !image.isEmpty()) {

            String imageUrl = storeImage(image);

            existingProduct.setImageUrl(imageUrl);
        }

        ProductEntity savedProduct = productRepository.save(existingProduct);

        // Record product update activity
        activityLogService.saveActivity(
                adminEmail,
                "PRODUCT_UPDATED",
                "Updated product: " + savedProduct.getName(),
                "PRODUCT",
                savedProduct.getId()
        );

        return savedProduct;
    }

    // =================================
    // SOFT DELETE PRODUCT
    // =================================

    public void deleteProduct(Long id, String adminEmail) {

        ProductEntity product = getOneProduct(id);

        product.setDeleted(true);

        productRepository.save(product);

        // Record product deletion activity
        activityLogService.saveActivity(
                adminEmail,
                "PRODUCT_DELETED",
                "Deleted product: " + product.getName(),
                "PRODUCT",
                product.getId()
        );
    }

    // =================================
    // STORE PRODUCT IMAGE
    // =================================

    private String storeImage(MultipartFile image) {

        try {

            return fileStorageService.storeFile(image);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to store product image.", e);
        }
    }

}