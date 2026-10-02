package com.novamart.common.enums;

/**
 * Represents the lifecycle stages of a customer order.
 * 
 * Order Lifecycle Flow:
 * PLACED -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
 *                            \
 *                             -> CANCELLED (triggers inventory restocking)
 */
public enum OrderStatus {
    PLACED,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    RETURN_REQUESTED,
    RETURNED,
    CANCELLED
}
