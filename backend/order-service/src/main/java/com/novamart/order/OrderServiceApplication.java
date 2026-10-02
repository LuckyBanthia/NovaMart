package com.novamart.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * ============================================================================
 * Order & Billing Microservice
 * ============================================================================
 * Runs on: http://localhost:8083
 * Handles checkout transactions, communicates with Product Service via OpenFeign,
 * and generates official downloadable/printable payment receipts.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
