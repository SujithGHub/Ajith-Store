package com.ajith.store.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StoreConfigRequest {
    @NotBlank
    private String storeName;
    private String address;
    private String phone;
    private String email;
    private String gstNumber;
    private String logoPath;
    private String invoiceHeader;
    private String invoiceFooter;
    private String currency;
    private LocalDate financialYearStart;
    private LocalDate financialYearEnd;
    private Boolean taxEnabled;
    private Boolean roundOffEnabled;
}
