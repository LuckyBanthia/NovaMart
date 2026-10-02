package com.novamart.order.service;

import com.novamart.common.dto.*;
import com.novamart.common.enums.OrderStatus;
import com.novamart.common.enums.PaymentStatus;
import com.novamart.common.security.JwtUtils;
import com.novamart.order.client.ProductClient;
import com.novamart.order.model.Order;
import com.novamart.order.model.OrderItem;
import com.novamart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service orchestrating order placement, inter-service inventory deduction,
 * discount code application, and tax receipt compilation.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final JwtUtils jwtUtils = new JwtUtils();

    public OrderService(OrderRepository orderRepository, ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
    }

    /**
     * Executes atomic order checkout.
     * 1. Calls product-service via OpenFeign to verify item details & deduct stock.
     * 2. Applies promo code discounts.
     * 3. Calculates 5% sales tax and shipping rules.
     * 4. Persists the order and returns the invoice/receipt.
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String token) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty when placing an order");
        }

        // Extract customer email from JWT token if present
        String userEmail = "customer@novamart.com";
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (jwtUtils.validateToken(jwt)) {
                userEmail = jwtUtils.getEmailFromToken(jwt);
            }
        }

        Order order = new Order();
        order.setUserEmail(userEmail);
        order.setUserName(request.getRecipientName());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaymentMethod(request.getPaymentMethod());

        // Human-friendly unique reference code: NM-YYYYMMDD-XXXX
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        order.setOrderNumber("NM-" + datePrefix + "-" + randomSuffix);
        order.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());

        // Shipping destination
        order.setRecipientName(request.getRecipientName());
        order.setPhone(request.getPhone());
        order.setAddressLine1(request.getAddressLine1());
        order.setAddressLine2(request.getAddressLine2());
        order.setCity(request.getCity());
        order.setState(request.getState());
        order.setPostalCode(request.getPostalCode());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            // Inter-service call via OpenFeign to verify product exists
            ApiResponse<ProductDTO> prodRes = productClient.getProductById(itemReq.getProductId());
            if (prodRes == null || !prodRes.isSuccess() || prodRes.getData() == null) {
                throw new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId());
            }

            ProductDTO product = prodRes.getData();

            // Inter-service call via OpenFeign to atomically deduct inventory
            ApiResponse<ProductDTO> deductRes = productClient.deductStock(product.getId(), itemReq.getQuantity());
            if (deductRes == null || !deductRes.isSuccess()) {
                throw new IllegalStateException("Failed to reserve stock for: " + product.getTitle());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getTitle());
            orderItem.setProductImageUrl(product.getImageUrl());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setSubtotal(itemTotal);

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);

        // 5% standard sales tax
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        order.setTax(tax);

        // Free express shipping above $50
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(50)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(9.99);
        order.setShippingFee(shipping);

        // Promo coupon calculation
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            String code = request.getCouponCode().trim().toUpperCase();
            if ("NOVASAVE10".equals(code)) {
                discount = subtotal.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);
            } else if ("WELCOME20".equals(code)) {
                discount = subtotal.multiply(BigDecimal.valueOf(0.20)).setScale(2, RoundingMode.HALF_UP);
            }
        }
        order.setDiscount(discount);

        BigDecimal total = subtotal.add(tax).add(shipping).subtract(discount);
        order.setTotalAmount(total.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : total);

        Order saved = orderRepository.save(order);
        return mapToDTO(saved);
    }

    /**
     * Retrieves previous orders belonging to the customer.
     */
    public List<OrderResponse> getOrdersForUser(String token) {
        String email = "user@novamart.com"; // default fallback
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            if (jwtUtils.validateToken(jwt)) {
                email = jwtUtils.getEmailFromToken(jwt);
            }
        }

        return orderRepository.findByUserEmailOrderByOrderDateDesc(email)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin: Retrieves all customer orders across the platform.
     */
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Looks up an individual order by its unique Order Reference (e.g. for printing receipt).
     */
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with reference: " + orderNumber));
        return mapToDTO(order);
    }

    /**
     * Admin: Updates order lifecycle status (PLACED, SHIPPED, DELIVERED, CANCELLED).
     * If cancelled, calls product-service to replenish inventory.
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setPaymentStatus(PaymentStatus.PAID);
        } else if (newStatus == OrderStatus.CANCELLED) {
            // Restore inventory across services via Feign
            for (OrderItem item : order.getItems()) {
                productClient.restoreStock(item.getProductId(), item.getQuantity());
            }
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        Order updated = orderRepository.save(order);
        return mapToDTO(updated);
    }

    /**
     * Admin Dashboard: Computes revenue, total orders count, and recent transactions.
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        BigDecimal revenue = orderRepository.calculateTotalRevenue();
        stats.put("totalRevenue", revenue != null ? revenue : BigDecimal.ZERO);
        stats.put("totalOrders", orderRepository.count());
        stats.put("pendingOrdersCount", orderRepository.countByStatus(OrderStatus.PLACED));
        
        List<OrderResponse> recent = orderRepository.findAllByOrderByOrderDateDesc()
                .stream()
                .limit(8)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        stats.put("recentOrders", recent);
        return stats;
    }

    public OrderResponse mapToDTO(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setUserEmail(order.getUserEmail());
        dto.setUserName(order.getUserName());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setTransactionId(order.getTransactionId());

        dto.setRecipientName(order.getRecipientName());
        dto.setPhone(order.getPhone());
        dto.setAddressLine1(order.getAddressLine1());
        dto.setAddressLine2(order.getAddressLine2());
        dto.setCity(order.getCity());
        dto.setState(order.getState());
        dto.setPostalCode(order.getPostalCode());

        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setShippingFee(order.getShippingFee());
        dto.setDiscount(order.getDiscount());
        dto.setTotalAmount(order.getTotalAmount());

        if (order.getItems() != null) {
            List<OrderItemResponse> itemDTOs = order.getItems().stream().map(item -> new OrderItemResponse(
                    item.getId(),
                    item.getProductId(),
                    item.getProductName(),
                    item.getProductImageUrl(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getSubtotal()
            )).collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        dto.setCancellationReason(order.getCancellationReason());
        dto.setReturnReason(order.getReturnReason());
        dto.setRefundAmount(order.getRefundAmount());
        dto.setRefundedAt(order.getRefundedAt());

        return dto;
    }

    /**
     * Customer: Cancels an order before it has been shipped.
     * Restores inventory via OpenFeign to product-service and marks payment as REFUNDED.
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String reason, String token) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        // Validation: Cannot cancel if already SHIPPED or DELIVERED
        if (order.getStatus() == OrderStatus.SHIPPED || 
            order.getStatus() == OrderStatus.DELIVERED || 
            order.getStatus() == OrderStatus.RETURN_REQUESTED || 
            order.getStatus() == OrderStatus.RETURNED) {
            throw new IllegalStateException("Order cannot be cancelled as it has already been dispatched/delivered. Please request a return after delivery.");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order has already been cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        order.setCancellationReason(reason != null && !reason.isBlank() ? reason : "Cancelled by customer before shipping");
        order.setRefundAmount(order.getTotalAmount());
        order.setCancelledAt(LocalDateTime.now());
        order.setRefundedAt(LocalDateTime.now());

        // Restore inventory units in product-service
        for (OrderItem item : order.getItems()) {
            try {
                productClient.restoreStock(item.getProductId(), item.getQuantity());
            } catch (Exception ex) {
                System.err.println("Warning: Failed to restore stock for product " + item.getProductId() + ": " + ex.getMessage());
            }
        }

        Order saved = orderRepository.save(order);
        return mapToDTO(saved);
    }

    /**
     * Customer: Requests Return & Refund after an item is DELIVERED.
     */
    @Transactional
    public OrderResponse requestReturn(Long orderId, String reason, String token) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (order.getStatus() == OrderStatus.RETURN_REQUESTED) {
            throw new IllegalStateException("Return request has already been submitted for this order. Status is RETURN_REQUESTED.");
        }
        if (order.getStatus() == OrderStatus.RETURNED) {
            throw new IllegalStateException("This order has already been returned and refunded.");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot return a cancelled order.");
        }
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Return can only be initiated after product is DELIVERED. Current status is " + order.getStatus() + ". If testing, mark it as DELIVERED in the Admin Portal first.");
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setPaymentStatus(PaymentStatus.REFUND_PENDING);
        order.setReturnReason(reason != null && !reason.isBlank() ? reason : "Customer requested return after delivery");
        order.setReturnedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);
        return mapToDTO(saved);
    }

    /**
     * Admin: Approves return and executes refund payout.
     * Restores inventory and marks status as RETURNED and paymentStatus as REFUNDED.
     */
    @Transactional
    public OrderResponse processRefund(Long orderId, BigDecimal customRefundAmount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        BigDecimal refundAmt = (customRefundAmount != null && customRefundAmount.compareTo(BigDecimal.ZERO) > 0)
                ? customRefundAmount
                : order.getTotalAmount();

        if (order.getStatus() == OrderStatus.RETURN_REQUESTED) {
            order.setStatus(OrderStatus.RETURNED);
        } else if (order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.RETURNED) {
            order.setStatus(OrderStatus.RETURNED);
        }

        order.setPaymentStatus(PaymentStatus.REFUNDED);
        order.setRefundAmount(refundAmt);
        order.setRefundedAt(LocalDateTime.now());

        // Restock returned items
        for (OrderItem item : order.getItems()) {
            try {
                productClient.restoreStock(item.getProductId(), item.getQuantity());
            } catch (Exception ex) {
                System.err.println("Warning: Failed to restore stock for returned item " + item.getProductId());
            }
        }

        Order saved = orderRepository.save(order);
        return mapToDTO(saved);
    }
}
