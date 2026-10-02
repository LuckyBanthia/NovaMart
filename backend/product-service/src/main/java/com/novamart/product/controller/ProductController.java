package com.novamart.product.controller;

import com.novamart.common.dto.ApiResponse;
import com.novamart.common.dto.ProductDTO;
import com.novamart.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public REST Controller for browsing and searching catalog products.
 * Also handles admin product creation and modification.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/products
     * Queries products matching optional search term, category slug, and price bounds.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> searchProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        List<ProductDTO> results = productService.searchProducts(query, category, minPrice, maxPrice);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    /**
     * GET /api/products/featured
     * Retrieves spotlight items showcased on the homepage.
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getFeaturedProducts() {
        List<ProductDTO> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    /**
     * GET /api/products/{id}
     * Retrieves detailed specifications for a single product.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        try {
            ProductDTO product = productService.getProductById(id);
            return ResponseEntity.ok(ApiResponse.ok(product));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * POST /api/admin/products
     * Admin: Creates a new product.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@Valid @RequestBody ProductDTO dto) {
        ProductDTO created = productService.createProduct(dto);
        return ResponseEntity.ok(ApiResponse.ok("Product created successfully", created));
    }

    /**
     * PUT /api/products/{id}
     * Admin: Updates an existing product.
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
        }
    }

    /**
     * PATCH /api/products/{id}/stock
     * Directly updates stock quantity for quick adjustments.
     */
    @RequestMapping(value = "/{id}/stock", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<ProductDTO>> updateStock(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> body) {
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
     * DELETE /api/products/{id}
     * Admin: Removes a product from the catalog.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.ok("Product removed from catalog", null));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
        }
    }
}
