package com.novamart.product.controller;

import com.novamart.common.dto.ApiResponse;
import com.novamart.product.model.Category;
import com.novamart.product.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for exploring product categories.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * GET /api/categories
     * Returns all active shopping categories with their hero icons.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> list = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
