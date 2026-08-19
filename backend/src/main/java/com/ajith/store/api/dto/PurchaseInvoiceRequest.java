package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseInvoiceRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    private Long purchaseOrderId;

    private LocalDate invoiceDate;
    private LocalDate dueDate;

    @NotNull(message = "Subtotal is required")
    private BigDecimal subtotal;

    @NotNull(message = "Discount amount is required")
    private BigDecimal discountAmount;

    @NotNull(message = "Tax amount is required")
    private BigDecimal taxAmount;

    private BigDecimal paidAmount;
    private String notes;
}
