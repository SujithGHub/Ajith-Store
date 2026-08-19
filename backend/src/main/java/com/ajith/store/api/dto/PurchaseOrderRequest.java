package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    private LocalDate orderDate;
    private LocalDate expectedDelivery;

    @NotNull(message = "Discount amount is required")
    private BigDecimal discountAmount;

    private String notes;

    @NotEmpty(message = "At least one order item is required")
    private List<PurchaseOrderItemRequest> items;
}
