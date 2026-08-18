package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.ProductVariant;
import com.ajith.store.domain.model.StockAdjustment;
import com.ajith.store.domain.model.StockAdjustmentItem;
import com.ajith.store.domain.repository.ProductVariantRepository;
import com.ajith.store.domain.repository.StockAdjustmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StockAdjustmentService {

    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockLedgerService stockLedgerService;

    @Transactional
    public StockAdjustmentDto createAdjustment(StockAdjustmentRequest request, Long userId) {
        String adjustmentNumber = "ADJ-" + System.currentTimeMillis();

        StockAdjustment adjustment = StockAdjustment.builder()
            .adjustmentNumber(adjustmentNumber)
            .adjustmentType(request.getAdjustmentType())
            .reason(request.getReason())
            .notes(request.getNotes())
            .createdBy(userId)
            .build();

        for (StockAdjustmentItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                .orElseThrow(() -> new EntityNotFoundException("Variant not found with id: " + itemReq.getVariantId()));

            StockAdjustmentItem item = StockAdjustmentItem.builder()
                .stockAdjustment(adjustment)
                .variant(variant)
                .quantity(itemReq.getQuantity())
                .unitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO)
                .reason(itemReq.getReason())
                .build();
            adjustment.getItems().add(item);
        }

        adjustment = stockAdjustmentRepository.save(adjustment);

        for (StockAdjustmentItem item : adjustment.getItems()) {
            ProductVariant variant = item.getVariant();
            BigDecimal qtyIn = BigDecimal.ZERO;
            BigDecimal qtyOut = BigDecimal.ZERO;
            if (item.getQuantity().compareTo(BigDecimal.ZERO) >= 0) {
                qtyIn = item.getQuantity();
            } else {
                qtyOut = item.getQuantity().abs();
            }

            stockLedgerService.addEntry(
                variant.getId(),
                "STOCK_ADJUSTMENT",
                "STOCK_ADJUSTMENT",
                adjustment.getId(),
                qtyIn,
                qtyOut,
                userId
            );
        }

        return toDto(adjustment);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StockAdjustmentDto> getAdjustments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<StockAdjustment> adjustmentPage = stockAdjustmentRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PagedResponse.<StockAdjustmentDto>builder()
            .content(adjustmentPage.getContent().stream().map(this::toDto).toList())
            .page(adjustmentPage.getNumber())
            .size(adjustmentPage.getSize())
            .totalElements(adjustmentPage.getTotalElements())
            .totalPages(adjustmentPage.getTotalPages())
            .first(adjustmentPage.isFirst())
            .last(adjustmentPage.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public StockAdjustmentDto getAdjustment(Long id) {
        StockAdjustment adjustment = stockAdjustmentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Stock adjustment not found with id: " + id));
        return toDto(adjustment);
    }

    private StockAdjustmentDto toDto(StockAdjustment adjustment) {
        return StockAdjustmentDto.builder()
            .id(adjustment.getId())
            .adjustmentNumber(adjustment.getAdjustmentNumber())
            .adjustmentType(adjustment.getAdjustmentType())
            .reason(adjustment.getReason())
            .notes(adjustment.getNotes())
            .createdBy(adjustment.getCreatedBy())
            .createdAt(adjustment.getCreatedAt())
            .items(adjustment.getItems().stream().map(this::toItemDto).toList())
            .build();
    }

    private StockAdjustmentItemDto toItemDto(StockAdjustmentItem item) {
        return StockAdjustmentItemDto.builder()
            .id(item.getId())
            .variantId(item.getVariant().getId())
            .variantName(item.getVariant().getProduct().getName())
            .barcode(item.getVariant().getBarcode())
            .colorName(item.getVariant().getColor() != null ? item.getVariant().getColor().getName() : null)
            .sizeName(item.getVariant().getSize() != null ? item.getVariant().getSize().getName() : null)
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .reason(item.getReason())
            .build();
    }
}
