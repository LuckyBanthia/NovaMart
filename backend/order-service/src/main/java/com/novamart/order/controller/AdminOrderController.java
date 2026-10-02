package com.novamart.order.controller;

import com.novamart.common.dto.ApiResponse;
import com.novamart.common.dto.OrderResponse;
import com.novamart.common.enums.OrderStatus;
import com.novamart.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Administrator order management and dashboard metrics.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * GET /api/admin/orders
     * Admin: Retrieves all platform orders for fulfillment tracking.
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    /**
     * PATCH /api/admin/orders/{id}/status
     * Admin: Updates order status (PLACED, SHIPPED, DELIVERED, CANCELLED).
     */
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
        try {
            String statusStr = body.get("status");
            OrderStatus newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
            OrderResponse updated = orderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(ApiResponse.ok("Order status updated to " + newStatus, updated));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to update status: " + ex.getMessage()));
        }
    }

    /**
     * POST /api/admin/orders/{id}/refund
     * Admin: Issues a full or partial refund, approves return, and restores inventory.
     */
    @PostMapping("/orders/{id}/refund")
    public ResponseEntity<ApiResponse<OrderResponse>> processRefund(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            java.math.BigDecimal amount = null;
            if (body != null && body.containsKey("refundAmount")) {
                amount = new java.math.BigDecimal(body.get("refundAmount").toString());
            }
            OrderResponse updated = orderService.processRefund(id, amount);
            return ResponseEntity.ok(ApiResponse.ok("Refund processed successfully! Payment marked as REFUNDED.", updated));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to process refund: " + ex.getMessage()));
        }
    }

    /**
     * GET /api/admin/dashboard
     * Admin: Returns KPI metrics (Total Gross Revenue, Total Orders, Recent Transactions).
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = orderService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
