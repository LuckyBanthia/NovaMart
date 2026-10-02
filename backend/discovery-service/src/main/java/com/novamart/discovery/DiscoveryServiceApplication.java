package com.novamart.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * ============================================================================
 * Eureka Discovery Server Application
 * ============================================================================
 * 
 * Why do we need Service Discovery in Microservices?
 * In monolithic apps, all components run in the same memory space.
 * In microservices, services run as separate processes on different ports/hosts.
 * 
 * Instead of hardcoding URLs (e.g. http://localhost:8082) in every service,
 * each microservice registers with this Eureka Server using a logical name:
 *   - "USER-SERVICE"
 *   - "PRODUCT-SERVICE"
 *   - "ORDER-SERVICE"
 * 
 * Eureka keeps track of which instances are alive and healthy through heartbeats.
 * 
 * Access the Eureka Dashboard UI at: http://localhost:8761
 */
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServiceApplication.class, args);
    }
}
