package com.ajith.store.domain.service;

import com.ajith.store.api.dto.PagedResponse;
import com.ajith.store.api.dto.StockLedgerDto;
import com.ajith.store.domain.model.ProductVariant;
import com.ajith.store.domain.model.StockLedger;
import com.ajith.store.domain.repository.ProductVariantRepository;
import com.ajith.store.domain.repository.StockLedgerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public StockLedgerDto addEntry(Long variantId, String transactionType, String referenceType,
                                    Long referenceId, BigDecimal qtyIn, BigDecimal qtyOut, Long createdBy) {
        ProductVariant variant = productVariantRepository.findById(variantId)
            .orElseThrow(() -> new EntityNotFoundException("Variant not found with id: " + variantId));

        StockLedger latest = stockLedgerRepository
            .findTopByVariantIdOrderByCreatedAtDesc(variantId).orElse(null);
        BigDecimal previousBalance = latest != null ? latest.getRunningBalance() : BigDecimal.ZERO;
        BigDecimal runningBalance = previousBalance.add(qtyIn).subtract(qtyOut);

        StockLedger entry = StockLedger.builder()
            .variant(variant)
            .transactionType(transactionType)
            .referenceType(referenceType)
            .referenceId(referenceId)
            .qtyIn(qtyIn)
            .qtyOut(qtyOut)
            .runningBalance(runningBalance)
            .createdBy(createdBy)
            .build();
        entry = stockLedgerRepository.save(entry);

        variant.setCurrentStock(runningBalance);
        productVariantRepository.save(variant);

        return toDto(entry);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StockLedgerDto> getLedgerByVariant(Long variantId, Pageable pageable) {
        Page<StockLedger> page = stockLedgerRepository.findByVariantId(variantId, pageable);
        return PagedResponse.<StockLedgerDto>builder()
            .content(page.getContent().stream().map(this::toDto).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public BigDecimal getCurrentStock(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
            .orElseThrow(() -> new EntityNotFoundException("Variant not found with id: " + variantId));
        return variant.getCurrentStock();
    }

    private StockLedgerDto toDto(StockLedger entry) {
        return StockLedgerDto.builder()
            .id(entry.getId())
            .variantId(entry.getVariant().getId())
            .variantName(entry.getVariant().getProduct().getName())
            .barcode(entry.getVariant().getBarcode())
            .transactionType(entry.getTransactionType())
            .referenceType(entry.getReferenceType())
            .referenceId(entry.getReferenceId())
            .qtyIn(entry.getQtyIn())
            .qtyOut(entry.getQtyOut())
            .runningBalance(entry.getRunningBalance())
            .createdBy(entry.getCreatedBy())
            .createdAt(entry.getCreatedAt())
            .build();
    }
}
