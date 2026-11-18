package com.example.shopease.Service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.shopease.DTO.PaymentResponseDTO;
import com.example.shopease.Entity.OrderEntity;
import com.example.shopease.Entity.PaymentEntity;
import com.example.shopease.Exception.DuplicateResourceException;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.OrderRepository;
import com.example.shopease.Repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    // =================================
    // CREATE COD PAYMENT
    // =================================

    public ResponseEntity<?> createCODPayment(Long orderId) {

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with ID: " + orderId));

        if (paymentRepository.existsByOrder_Id(orderId)) {
            throw new DuplicateResourceException(
                    "Payment already exists for this order.");
        }

        PaymentEntity payment = new PaymentEntity();

        payment.setOrder(order);
        payment.setPaymentMethod("COD");
        payment.setPaymentStatus("PENDING");
        payment.setAmount(order.getTotalAmount());

        PaymentEntity savedPayment = paymentRepository.save(payment);

        PaymentResponseDTO response = new PaymentResponseDTO(savedPayment);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =================================
    // GET PAYMENT BY ORDER ID
    // =================================

    public ResponseEntity<?> getPaymentByOrderId(Long orderId) {

        PaymentEntity payment = paymentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order ID: " + orderId));

        PaymentResponseDTO response = new PaymentResponseDTO(payment);

        return ResponseEntity.ok(response);
    }

    // =================================
    // COMPLETE PAYMENT
    // =================================

    public ResponseEntity<?> completePayment(Long paymentId) {

        PaymentEntity payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with ID: " + paymentId));

        payment.setPaymentStatus("PAID");

        PaymentEntity updatedPayment = paymentRepository.save(payment);

        PaymentResponseDTO response = new PaymentResponseDTO(updatedPayment);

        return ResponseEntity.ok(response);
    }
}