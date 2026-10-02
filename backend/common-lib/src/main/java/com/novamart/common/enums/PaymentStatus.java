package com.novamart.common.enums;

/**
 * Tracks the financial settlement status of an order payment.
 */
public enum PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUND_PENDING,
    REFUNDED
}
