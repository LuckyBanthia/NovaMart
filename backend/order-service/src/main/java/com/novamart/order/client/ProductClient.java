package com.novamart.order.client;

import com.novamart.common.dto.ApiResponse;
import com.novamart.common.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Spring Cloud OpenFeign Declarative REST Client.
 * 
 * What is OpenFeign?
 * Instead of writing boilerplate RestTemplate code:
 *   restTemplate.exchange("http://localhost:8082/api/products/" + id, HttpMethod.GET...)
 * OpenFeign lets us declare an interface with standard Spring MVC annotations.
 * Under the hood, Feign generates the HTTP implementation dynamically!
 * 
 * Points to: product-service (port 8082)
 */
@FeignClient(name = "product-service", url = "http://localhost:8082")
public interface ProductClient {

    /**
     * Queries product details and current price from product-service.
     */
    @GetMapping("/api/products/{id}")
    ApiResponse<ProductDTO> getProductById(@PathVariable("id") Long id);

    /**
     * Requests product-service to atomically deduct stock for purchased items.
     */
    @PostMapping("/api/internal/products/{id}/deduct-stock")
    ApiResponse<ProductDTO> deductStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);

    /**
     * Requests product-service to replenish stock if an order is cancelled.
     */
    @PostMapping("/api/internal/products/{id}/restore-stock")
    ApiResponse<ProductDTO> restoreStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);
}
