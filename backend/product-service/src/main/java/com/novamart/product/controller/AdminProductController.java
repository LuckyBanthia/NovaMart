package com.novamart.product.controller;

import com.novamart.common.dto.ApiResponse;
import com.novamart.common.dto.ProductDTO;
import com.novamart.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * High-Privilege Administrator REST Controller for:
 * - Creating, editing, and deleting catalog products
 * - Real-time stock / inventory quantity management (stepper and quick adjust)
 * - Monitoring low-inventory alert thresholds
 */
@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * POST /api/admin/products
     * Admin: Creates a new catalog product.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@Valid @RequestBody ProductDTO dto) {
        try {
            ProductDTO created = productService.createProduct(dto);
            return ResponseEntity.ok(ApiResponse.ok("Product created successfully", created));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create product: " + ex.getMessage()));
        }
    }

    /**
     * PUT /api/admin/products/{id}
     * Admin: Updates all attributes of an existing product.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto) {
        try {
            ProductDTO updated = productService.updateProduct(id, dto);
            return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to update product: " + ex.getMessage()));
        }
    }

    /**
     * PATCH /api/admin/products/{id}/stock
     * Admin: Directly sets or modifies stock quantity for rapid inventory updates.
     * Supports both { "quantity": 50 } and { "delta": 10 } / { "delta": -1 }
     */
    @RequestMapping(value = "/{id}/stock", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<ProductDTO>> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            ProductDTO updated;
            if (body != null && body.containsKey("quantity")) {
                int quantity = Integer.parseInt(body.get("quantity").toString());
                updated = productService.updateStockQuantity(id, quantity);
            } else if (body != null && body.containsKey("delta")) {
                int delta = Integer.parseInt(body.get("delta").toString());
                updated = productService.adjustStockQuantity(id, delta);
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Stock payload must include 'quantity' or 'delta'"));
            }
            return ResponseEntity.ok(ApiResponse.ok("Stock quantity updated to " + updated.getStockQuantity(), updated));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to update stock: " + ex.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/products/{id}
     * Admin: Removes a product from the catalog.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.ok("Product removed from catalog", null));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete product: " + ex.getMessage()));
        }
    }

    /**
     * GET /api/admin/products/low-stock
     * Admin: Retrieves products with stock at or below specified threshold (default 10).
     */
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {
        List<ProductDTO> lowStock = productService.getLowStockProducts(threshold);
        return ResponseEntity.ok(ApiResponse.ok(lowStock));
    }
}
