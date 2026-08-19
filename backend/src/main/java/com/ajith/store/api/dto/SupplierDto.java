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
public class SupplierDto {

    private Long id;
    private String name;
    private String contactPerson;
    private String mobile;
    private String email;
    private String address;
    private String gstNumber;
    private String creditTerms;
    private BigDecimal openingBalance;
    private BigDecimal currentBalance;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
