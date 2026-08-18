package com.ajith.store.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_groups")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaxGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "cgst_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal cgstPct = BigDecimal.ZERO;

    @Column(name = "sgst_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal sgstPct = BigDecimal.ZERO;

    @Column(name = "igst_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal igstPct = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
