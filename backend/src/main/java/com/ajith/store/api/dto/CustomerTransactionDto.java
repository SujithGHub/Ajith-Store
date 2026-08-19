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
public class CustomerTransactionDto {

    private Long id;
    private Long customerId;
    private String customerName;
    private String transactionType;
    private BigDecimal amount;
    private String referenceType;
    private Long referenceId;
    private String notes;
    private LocalDateTime transactionDate;
}
