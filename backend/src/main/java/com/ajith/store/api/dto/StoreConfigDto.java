package com.ajith.store.api.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreConfigDto {
    private Long id;
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
    private boolean taxEnabled;
    private boolean roundOffEnabled;
}
