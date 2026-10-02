package com.novamart.product.repository;

import com.novamart.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Spring Data JPA Repository for querying products by keyword, category,
 * price boundaries, or low-stock thresholds.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategorySlug(String slug);

    List<Product> findByFeaturedTrue();

    @Query("SELECT p FROM Product p WHERE " +
           "(:categorySlug IS NULL OR p.category.slug = :categorySlug) AND " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           " OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           " OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> searchProducts(@Param("query") String query,
                                @Param("categorySlug") String categorySlug,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice);

    Long countByStockQuantityLessThanEqual(Integer threshold);

    List<Product> findByStockQuantityLessThanEqual(Integer threshold);
}
