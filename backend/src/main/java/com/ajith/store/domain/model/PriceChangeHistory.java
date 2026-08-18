package com.ajith.store.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_change_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceChangeHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "old_purchase_price", precision = 12, scale = 2)
    private BigDecimal oldPurchasePrice;

    @Column(name = "new_purchase_price", precision = 12, scale = 2)
    private BigDecimal newPurchasePrice;

    @Column(name = "old_selling_price", precision = 12, scale = 2)
    private BigDecimal oldSellingPrice;

    @Column(name = "new_selling_price", precision = 12, scale = 2)
    private BigDecimal newSellingPrice;

    @Column(name = "old_mrp", precision = 12, scale = 2)
    private BigDecimal oldMrp;

    @Column(name = "new_mrp", precision = 12, scale = 2)
    private BigDecimal newMrp;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
