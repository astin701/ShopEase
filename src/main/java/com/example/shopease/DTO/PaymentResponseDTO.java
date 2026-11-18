package com.example.shopease.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.shopease.Entity.PaymentEntity;

public class PaymentResponseDTO {

    private Long paymentId;

    private Long orderId;

    private String paymentMethod;

    private String paymentStatus;

    private BigDecimal amount;
    
    private LocalDateTime createdAt;

    public PaymentResponseDTO(PaymentEntity payment) {

        this.paymentId = payment.getId();
        this.orderId = payment.getOrder().getId();
        this.paymentMethod = payment.getPaymentMethod();
        this.paymentStatus = payment.getPaymentStatus();
        this.amount = payment.getAmount();
        this.createdAt = payment.getCreatedAt();
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}