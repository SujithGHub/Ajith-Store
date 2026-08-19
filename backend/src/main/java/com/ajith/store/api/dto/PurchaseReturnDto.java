package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnDto {

    private Long id;
    private String returnNumber;
    private Long supplierId;
    private String supplierName;
    private Long purchaseInvoiceId;
    private String purchaseInvoiceNumber;
    private LocalDate returnDate;
    private String reason;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private List<PurchaseReturnItemDto> items;
}
