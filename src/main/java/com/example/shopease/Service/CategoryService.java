package com.example.shopease.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.shopease.DTO.CategoryRequestDTO;
import com.example.shopease.Entity.CategoryEntity;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.CategoryRepository;
import com.example.shopease.Repository.ProductRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<CategoryEntity> getAllCategories() {
        return categoryRepository.findAll();
    }

    public CategoryEntity getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with ID: " + id));
    }

    public CategoryEntity saveCategory(CategoryRequestDTO request) {

        CategoryEntity category = new CategoryEntity();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    public CategoryEntity updateCategory(Long id, CategoryRequestDTO request){

        CategoryEntity category = getCategoryById(id);

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);

    }

    public void deleteCategoryById(Long id) {

        CategoryEntity category = getCategoryById(id);
        
        long productCount = productRepository.countByCategory_Id(id);

        if (productCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Cannot delete this category because products are assigned to it.");
        }

        categoryRepository.delete(category);
    }
}