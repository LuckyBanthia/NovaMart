package com.novamart.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * ============================================================================
 * Spring Cloud API Gateway
 * ============================================================================
 * 
 * What does this do?
 * 1. Single Entry Point: All frontend HTTP requests hit port 8080.
 * 2. Cross-Origin Resource Sharing (CORS): Centralized pre-flight & headers.
 * 3. Route Forwarding: Proxies requests to downstream microservices.
 * 
 * Running on: http://localhost:8080
 */
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
