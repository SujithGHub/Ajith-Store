package com.ajith.store.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "store_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "gst_number", length = 50)
    private String gstNumber;

    @Column(name = "logo_path", length = 255)
    private String logoPath;

    @Column(name = "invoice_header", columnDefinition = "TEXT")
    private String invoiceHeader;

    @Column(name = "invoice_footer", columnDefinition = "TEXT")
    private String invoiceFooter;

    @Column(length = 10)
    private String currency;

    @Column(name = "financial_year_start")
    private LocalDate financialYearStart;

    @Column(name = "financial_year_end")
    private LocalDate financialYearEnd;

    @Column(name = "tax_enabled", nullable = false)
    @Builder.Default
    private Boolean taxEnabled = true;

    @Column(name = "round_off_enabled", nullable = false)
    @Builder.Default
    private Boolean roundOffEnabled = true;
}
