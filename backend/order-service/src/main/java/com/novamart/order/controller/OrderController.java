package com.novamart.order.controller;

import com.novamart.common.dto.ApiResponse;
import com.novamart.common.dto.OrderRequest;
import com.novamart.common.dto.OrderResponse;
import com.novamart.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for customer order operations:
 * - Placing an order with immediate receipt generation
 * - Viewing customer purchase history
 * - Downloading / viewing specific payment receipts
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/orders
     * Places an order, validates stock via OpenFeign with product-service,
     * processes payment simulation, and issues a verified digital invoice.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            OrderResponse response = orderService.createOrder(request, authHeader);
            return ResponseEntity.ok(ApiResponse.ok("Order confirmed! Payment settled.", response));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * GET /api/orders/my-orders
     * Returns all past orders belonging to the customer.
     */
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        List<OrderResponse> list = orderService.getOrdersForUser(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * GET /api/orders/{orderNumber}
     * Retrieves full order details.
     */
    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(@PathVariable String orderNumber) {
        try {
            OrderResponse order = orderService.getOrderByNumber(orderNumber);
            return ResponseEntity.ok(ApiResponse.ok(order));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * GET /api/orders/{orderNumber}/receipt
     * Dedicated endpoint returning formatted tax invoice and receipt data.
     */
    @GetMapping("/{orderNumber}/receipt")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderReceipt(@PathVariable String orderNumber) {
        try {
            OrderResponse receipt = orderService.getOrderByNumber(orderNumber);
            return ResponseEntity.ok(ApiResponse.ok("Official Tax Receipt Retrieved", receipt));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * POST /api/orders/{id}/cancel
     * Customer: Cancels an order before shipping, restores product inventory and refunds payment.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String reason = body != null ? body.get("reason") : null;
            OrderResponse response = orderService.cancelOrder(id, reason, authHeader);
            return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully. Full refund initiated.", response));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * POST /api/orders/{id}/return
     * Customer: Requests Return & Refund for delivered product.
     */
    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String reason = body != null ? body.get("reason") : null;
            OrderResponse response = orderService.requestReturn(id, reason, authHeader);
            return ResponseEntity.ok(ApiResponse.ok("Return request submitted! Refund is pending approval.", response));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }
}
