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
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String contactPerson;
    private String mobile;
    private String email;
    private String address;
    private String gstNumber;
    private String creditTerms;
    private BigDecimal openingBalance;
}
