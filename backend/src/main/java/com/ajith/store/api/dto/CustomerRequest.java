package com.ajith.store.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "Customer name is required")
    private String name;

    private String mobile;
    private String email;
    private String address;
    private String gstNumber;
    private BigDecimal creditLimit;
    private BigDecimal openingBalance;
}
