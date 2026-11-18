package com.example.shopease.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shopease.DTO.OrderResponseDTO;
import com.example.shopease.DTO.RevenueStatisticsDTO;
import com.example.shopease.Entity.AddressEntity;
import com.example.shopease.Entity.CartEntity;
import com.example.shopease.Entity.CartItemEntity;
import com.example.shopease.Entity.OrderEntity;
import com.example.shopease.Entity.OrderItemEntity;
import com.example.shopease.Entity.ProductEntity;
import com.example.shopease.Entity.UserEntity;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.AddressRepository;
import com.example.shopease.Repository.CartItemRepository;
import com.example.shopease.Repository.CartRepository;
import com.example.shopease.Repository.OrderItemRepository;
import com.example.shopease.Repository.OrderRepository;
import com.example.shopease.Repository.ProductRepository;
import com.example.shopease.Repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            AddressRepository addressRepository,
            UserRepository userRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    // =================================
    // PLACE ORDER
    // =================================

    @Transactional
    public ResponseEntity<?> placeOrder(Long addressId, String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        Long userId = user.getId();

        AddressEntity address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with ID: " + addressId));

        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart not found for user ID: " + userId));

        List<CartItemEntity> cartItems =
                cartItemRepository.findAllByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Store locked products
        Map<Long, ProductEntity> lockedProducts = new HashMap<>();

        // =================================
        // VALIDATE PRODUCTS AND STOCK
        // =================================

        for (CartItemEntity item : cartItems) {

            ProductEntity product = productRepository
                    .findByIdAndDeletedFalseWithLock(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found or no longer available"));

            lockedProducts.put(product.getId(), product);

            if (item.getQuantity() <= 0) {
                return ResponseEntity.badRequest()
                        .body("Invalid product quantity");
            }

            if (product.getQuantity() < item.getQuantity()) {
                return ResponseEntity.badRequest()
                        .body("Insufficient stock for " + product.getName());
            }

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            totalAmount = totalAmount.add(subtotal);
        }

        // =================================
        // CREATE ORDER
        // =================================

        OrderEntity order = new OrderEntity();

        order.setUser(user);
        order.setAddress(address);
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");

        OrderEntity savedOrder = orderRepository.save(order);

        // =================================
        // CREATE ORDER ITEMS AND REDUCE STOCK
        // =================================

        for (CartItemEntity item : cartItems) {

            ProductEntity product =
                    lockedProducts.get(item.getProduct().getId());

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItemEntity orderItem = new OrderItemEntity();

            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSubtotal(subtotal);

            orderItemRepository.save(orderItem);

            product.setQuantity(
                    product.getQuantity() - item.getQuantity());
        }

        // =================================
        // CLEAR CART
        // =================================

        cartItemRepository.deleteAll(cartItems);

        return ResponseEntity.ok(savedOrder.getId());
    }

    // =================================
    // GET USER ORDERS
    // =================================

    @Transactional(readOnly = true)
    public ResponseEntity<?> getUserOrders(String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        List<OrderEntity> orders =
                orderRepository.findAllByUserId(user.getId());

        List<OrderResponseDTO> orderDTOs = orders.stream()
                .map(OrderResponseDTO::new)
                .toList();

        return ResponseEntity.ok(orderDTOs);
    }

    // =================================
    // GET ORDER BY ID
    // =================================

    @Transactional(readOnly = true)
    public ResponseEntity<?> getOrderById(Long orderId, String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {

            return ResponseEntity.status(403)
                    .body("You are not authorized to view this order.");
        }

        OrderResponseDTO orderDTO = new OrderResponseDTO(order);

        return ResponseEntity.ok(orderDTO);
    }

    // =================================
    // GET ALL ORDERS (ADMIN)
    // =================================

    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllOrders() {

        List<OrderEntity> orders = orderRepository.findAll();

        List<OrderResponseDTO> orderDTOs = orders.stream()
                .map(OrderResponseDTO::new)
                .toList();

        return ResponseEntity.ok(orderDTOs);
    }

    @Transactional 
    public ResponseEntity<?> updateOrderStatus(Long orderId, String newStatus){

        OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        String currentStatus = order.getStatus();

        newStatus = newStatus.toUpperCase().trim();

        boolean validTransition = ("PENDING".equals(currentStatus) && ("CONFIRMED".equals(newStatus) || "CANCELLED".equals(newStatus))) || ("CONFIRMED".equals(currentStatus) && "SHIPPED".equals(newStatus)) || ("SHIPPED".equals(currentStatus) && "DELIVERED".equals(newStatus));

        if (!validTransition) {
            return ResponseEntity.badRequest().body("Invalid order status transition: " + currentStatus + " to " + newStatus);
        }

        if ("CANCELLED".equals(newStatus)) {
            
            List<OrderItemEntity> orderItems = orderItemRepository.findAllByOrderId(orderId);

            for(OrderItemEntity item : orderItems){

                ProductEntity product = item.getProduct();

                product.setQuantity(product.getQuantity() + item.getQuantity());

            }

        }

        order.setStatus(newStatus);
        orderRepository.save(order);
        return ResponseEntity.ok("Order status updated to " + newStatus + " successfully.");

    }

    // =================================
    // CANCEL ORDER
    // =================================

    @Transactional
    public ResponseEntity<?> cancelOrder(Long orderId, String email) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {

            return ResponseEntity.status(403)
                    .body("You are not authorized to cancel this order.");
        }

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {

            return ResponseEntity.badRequest()
                    .body("Only pending orders can be cancelled.");
        }

        List<OrderItemEntity> orderItems =
                orderItemRepository.findAllByOrderId(orderId);

        // Restore product stock
        for (OrderItemEntity item : orderItems) {

            ProductEntity product = item.getProduct();

            int restoredQuantity =
                    product.getQuantity() + item.getQuantity();

            product.setQuantity(restoredQuantity);
        }

        order.setStatus("CANCELLED");

        orderRepository.save(order);

        return ResponseEntity.ok("Order cancelled successfully.");
    }


    @Transactional(readOnly = true)
    public RevenueStatisticsDTO getRevenueStatistics(){

        RevenueStatisticsDTO statistics = new RevenueStatisticsDTO();

        //Total Revenue (Delivered Orders Only)
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();

        //Total Sales (Delivered Orders Count)
        long totalSales = orderRepository.countDeliveredOrders();

        //Total's Revenue
        LocalDate today = LocalDate.now();

        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime tomorrowStart = today.plusDays(1).atStartOfDay();

        BigDecimal todayRevenue = orderRepository.getTodayRevenue(todayStart, tomorrowStart);

        YearMonth currentMonth = YearMonth.now();

        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();

        LocalDateTime nextMonthStart = currentMonth.plusMonths(1).atDay(1).atStartOfDay();

        BigDecimal monthlyRevenue = orderRepository.getMonthlyRevenue(monthStart, nextMonthStart);

        BigDecimal averageOrderValue = BigDecimal.ZERO;

        if(totalSales > 0){
                averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalSales),2,RoundingMode.HALF_UP);
        }

        statistics.setTotalRevenue(totalRevenue);
        statistics.setTotalSales(totalSales);
        statistics.setTodayRevenue(todayRevenue);
        statistics.setMonthlyRevenue(monthlyRevenue);
        statistics.setAverageOrderValue(averageOrderValue);

        return statistics;

    }

}