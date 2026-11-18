package com.example.shopease.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.shopease.Service.PaymentService;

import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/payments")
@Validated
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/cod/{orderId}")
    public ResponseEntity<?> createCODPayment(
            @PathVariable @Positive(message = "Order ID must be positive") Long orderId) {

        return paymentService.createCODPayment(orderId);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(
            @PathVariable @Positive(message = "Order ID must be positive") Long orderId) {

        return paymentService.getPaymentByOrderId(orderId);
    }

    @PutMapping("/complete/{paymentId}")
    public ResponseEntity<?> completePayment(
            @PathVariable @Positive(message = "Payment ID must be positive") Long paymentId) {

        return paymentService.completePayment(paymentId);
    }
}