package com.novamart.common.enums;

/**
 * Defines the user authorization roles in the NovaMart platform.
 * 
 * - ROLE_CUSTOMER : Standard buyer who can browse products, manage cart, place orders, and view invoices.
 * - ROLE_ADMIN    : Store manager who can manage inventory, view KPI dashboards, and update order statuses.
 * 
 * Using standard Spring Security "ROLE_" prefix naming convention.
 */
public enum Role {
    ROLE_CUSTOMER,
    ROLE_ADMIN
}
