package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseReturnRequest {

    @NotNull(message = "Supplier is required")
    private Long supplierId;

    private Long purchaseInvoiceId;

    private LocalDate returnDate;
    private String reason;

    @NotEmpty(message = "At least one return item is required")
    private List<PurchaseReturnItemRequest> items;
}
