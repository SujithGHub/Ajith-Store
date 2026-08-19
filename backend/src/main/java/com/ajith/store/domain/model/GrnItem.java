package com.ajith.store.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "grn_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GrnItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id", nullable = false)
    private GoodsReceiptNote grn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "ordered_qty", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal orderedQty = BigDecimal.ZERO;

    @Column(name = "received_qty", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal receivedQty = BigDecimal.ZERO;

    @Column(name = "accepted_qty", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal acceptedQty = BigDecimal.ZERO;

    @Column(name = "rejected_qty", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal rejectedQty = BigDecimal.ZERO;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
