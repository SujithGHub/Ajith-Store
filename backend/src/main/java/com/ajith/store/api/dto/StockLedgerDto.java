package com.ajith.store.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
public class StockLedgerDto {

    private Long id;
    private Long variantId;
    private String variantName;
    private String barcode;
    private String transactionType;
    private String referenceType;
    private Long referenceId;
    private BigDecimal qtyIn;
    private BigDecimal qtyOut;
    private BigDecimal runningBalance;
    private Long createdBy;
    private LocalDateTime createdAt;
}
