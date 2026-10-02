package com.novamart.product.service;

import com.novamart.common.dto.ProductDTO;
import com.novamart.product.model.Category;
import com.novamart.product.model.Product;
import com.novamart.product.repository.CategoryRepository;
import com.novamart.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing product catalog search, inventory queries,
 * and admin modifications.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    /**
     * Searches products by text query, category slug, and price range.
     */
    public List<ProductDTO> searchProducts(String query, String categorySlug, BigDecimal minPrice, BigDecimal maxPrice) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cleanCategory = (categorySlug != null && !categorySlug.trim().isEmpty() && !categorySlug.equalsIgnoreCase("all")) ? categorySlug.trim() : null;

        return productRepository.searchProducts(cleanQuery, cleanCategory, minPrice, maxPrice)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves featured items for the homepage hero & spotlight.
     */
    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Looks up an individual product by ID.
     */
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        return mapToDTO(product);
    }

    /**
     * Admin: Creates a new product in the store catalog.
     */
    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = new Product();
        updateProductFields(product, dto);
        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    /**
     * Admin: Updates an existing product's pricing, details, or stock.
     */
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        updateProductFields(product, dto);
        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    /**
     * Admin: Deletes a product from the catalog.
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        productRepository.delete(product);
    }

    /**
     * Internal RPC method: Validates and deducts stock quantity during checkout.
     * Called by order-service via Feign client.
     */
    @Transactional
    public synchronized ProductDTO deductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new IllegalStateException("Insufficient inventory for product '" + product.getTitle() + 
                    "'. In stock: " + product.getStockQuantity() + ", Requested: " + quantity);
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        Product updated = productRepository.save(product);
        return mapToDTO(updated);
    }

    /**
     * Internal RPC method: Restores stock in case of order cancellation.
     */
    @Transactional
    public synchronized ProductDTO restoreStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        product.setStockQuantity(product.getStockQuantity() + quantity);
        Product updated = productRepository.save(product);
        return mapToDTO(updated);
    }

    /**
     * Admin/Inventory: Directly sets product stock quantity to a new count.
     */
    @Transactional
    public synchronized ProductDTO updateStockQuantity(Long productId, Integer newStockQuantity) {
        if (newStockQuantity == null || newStockQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be null or negative");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        product.setStockQuantity(newStockQuantity);
        Product updated = productRepository.save(product);
        return mapToDTO(updated);
    }

    /**
     * Admin/Inventory: Adjusts product stock quantity by a positive or negative delta.
     */
    @Transactional
    public synchronized ProductDTO adjustStockQuantity(Long productId, Integer delta) {
        if (delta == null) {
            throw new IllegalArgumentException("Stock delta cannot be null");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        int newStock = product.getStockQuantity() + delta;
        if (newStock < 0) {
            throw new IllegalArgumentException("Adjusted stock cannot be negative. Current stock: " + product.getStockQuantity());
        }

        product.setStockQuantity(newStock);
        Product updated = productRepository.save(product);
        return mapToDTO(updated);
    }

    /**
     * Admin: Retrieves all products where stock quantity is at or below the given threshold.
     */
    public List<ProductDTO> getLowStockProducts(int threshold) {
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= threshold)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void updateProductFields(Product product, ProductDTO dto) {
        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice() != null ? dto.getOriginalPrice() : dto.getPrice());
        product.setDiscountPercent(dto.getDiscountPercent() != null ? dto.getDiscountPercent() : 0);
        product.setStockQuantity(dto.getStockQuantity());
        product.setSku(dto.getSku());
        product.setImageUrl(dto.getImageUrl());
        product.setAdditionalImages(dto.getAdditionalImages());
        product.setBrand(dto.getBrand());
        product.setFeatured(dto.getFeatured() != null ? dto.getFeatured() : false);
        if (dto.getRating() != null) product.setRating(dto.getRating());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + dto.getCategoryId()));
            product.setCategory(category);
        }
    }

    public ProductDTO mapToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setTitle(product.getTitle());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setDiscountPercent(product.getDiscountPercent());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setSku(product.getSku());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
            dto.setCategorySlug(product.getCategory().getSlug());
        }
        dto.setImageUrl(product.getImageUrl());
        dto.setAdditionalImages(product.getAdditionalImages());
        dto.setBrand(product.getBrand());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setFeatured(product.getFeatured());
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }
}
