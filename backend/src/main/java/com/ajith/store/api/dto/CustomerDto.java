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
public class CustomerDto {

    private Long id;
    private String customerCode;
    private String name;
    private String mobile;
    private String email;
    private String address;
    private String gstNumber;
    private BigDecimal creditLimit;
    private BigDecimal openingBalance;
    private BigDecimal currentBalance;
    private BigDecimal loyaltyPoints;
    private String membershipLevel;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
