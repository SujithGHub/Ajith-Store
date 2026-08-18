package com.ajith.store.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_ledger")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType;

    @Column(name = "reference_type", length = 100)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "qty_in", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal qtyIn = BigDecimal.ZERO;

    @Column(name = "qty_out", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal qtyOut = BigDecimal.ZERO;

    @Column(name = "running_balance", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal runningBalance = BigDecimal.ZERO;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
