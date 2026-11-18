package com.example.shopease.Controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.shopease.DTO.ProductRequestDTO;
import com.example.shopease.Entity.ProductEntity;
import com.example.shopease.Service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // =================================
    // GET ALL PRODUCTS
    // =================================

    @GetMapping
    public List<ProductEntity> getAllProduct() {
        return productService.getAll();
    }

    // =================================
    // GET PRODUCT BY ID
    // =================================

    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getProductById(@PathVariable Long id) {
        ProductEntity product = productService.getOneProduct(id);
        return ResponseEntity.ok(product);
    }

    // =================================
    // ADD NEW PRODUCT
    // =================================

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductEntity> addNewProduct(@Valid @ModelAttribute ProductRequestDTO product, @RequestParam("image") MultipartFile image, Authentication authentication) {

        String adminEmail = authentication.getName();
        return productService.addProduct(product, image, adminEmail);
    }

    // =================================
    // UPDATE PRODUCT
    // =================================

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductEntity> updateProductById(@PathVariable Long id, @Valid @ModelAttribute ProductRequestDTO product, @RequestParam(value = "image", required = false) MultipartFile image, Authentication authentication) {

        String adminEmail = authentication.getName();
        ProductEntity updatedProduct = productService.updateProduct(id, product, image, adminEmail);
        return ResponseEntity.ok(updatedProduct);
    }

    // =================================
    // DELETE PRODUCT
    // =================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id, Authentication authentication) {
        String adminEmail = authentication.getName();
        productService.deleteProduct(id, adminEmail);
        return ResponseEntity.noContent().build();
    }

}