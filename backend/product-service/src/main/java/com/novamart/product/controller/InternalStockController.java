package com.novamart.product.controller;

import com.novamart.common.dto.ApiResponse;
import com.novamart.common.dto.ProductDTO;
import com.novamart.product.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal Microservice-to-Microservice RPC Controller.
 * 
 * In a monolithic application, OrderService directly queries the Product entity
 * and updates stock in the same local database transaction.
 * 
 * In a Microservices Architecture, Order Service and Product Service have separate
 * databases. Therefore, Order Service uses Spring Cloud OpenFeign to make a fast
 * HTTP call to this internal endpoint to verify inventory and decrement stock units!
 */
@RestController
@RequestMapping("/api/internal/products")
public class InternalStockController {

    private final ProductService productService;

    public InternalStockController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Deducts stock quantity atomically when an order is placed.
     */
    @PostMapping("/{id}/deduct-stock")
    public ResponseEntity<ApiResponse<ProductDTO>> deductStock(
            @PathVariable Long id, 
            @RequestParam Integer quantity) {
        try {
            ProductDTO updated = productService.deductStock(id, quantity);
            return ResponseEntity.ok(ApiResponse.ok("Stock deducted successfully", updated));
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * Restores stock quantity if an order is cancelled or refunded.
     */
    @PostMapping("/{id}/restore-stock")
    public ResponseEntity<ApiResponse<ProductDTO>> restoreStock(
            @PathVariable Long id, 
            @RequestParam Integer quantity) {
        try {
            ProductDTO updated = productService.restoreStock(id, quantity);
            return ResponseEntity.ok(ApiResponse.ok("Stock restored successfully", updated));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }
}
