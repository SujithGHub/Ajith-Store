package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.*;
import com.ajith.store.domain.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoodsReceiptNoteService {

    private final GoodsReceiptNoteRepository grnRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockLedgerService stockLedgerService;
    private final PurchaseOrderService purchaseOrderService;

    @Transactional(readOnly = true)
    public PagedResponse<GrnDto> getGrns(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<GoodsReceiptNote> grnPage = grnRepository.findAllByOrderByCreatedAtDesc(pageable);
        return toPage(grnPage);
    }

    @Transactional(readOnly = true)
    public GrnDto getGrn(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public GrnDto createGrn(GrnRequest request, Long userId) {
        PurchaseOrder order = purchaseOrderRepository.findById(request.getPurchaseOrderId())
            .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + request.getPurchaseOrderId()));

        GoodsReceiptNote grn = GoodsReceiptNote.builder()
            .grnNumber("GRN-" + grnRepository.nextGrnNumber())
            .purchaseOrder(order)
            .receivedDate(request.getReceivedDate() != null ? request.getReceivedDate() : LocalDate.now())
            .status("PENDING")
            .notes(request.getNotes())
            .createdBy(userId)
            .build();

        for (GrnItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                .orElseThrow(() -> new EntityNotFoundException("Variant not found with id: " + itemReq.getVariantId()));

            GrnItem item = GrnItem.builder()
                .grn(grn)
                .variant(variant)
                .orderedQty(itemReq.getOrderedQty() != null ? itemReq.getOrderedQty() : java.math.BigDecimal.ZERO)
                .receivedQty(itemReq.getReceivedQty() != null ? itemReq.getReceivedQty() : java.math.BigDecimal.ZERO)
                .acceptedQty(itemReq.getAcceptedQty() != null ? itemReq.getAcceptedQty() : java.math.BigDecimal.ZERO)
                .rejectedQty(itemReq.getRejectedQty() != null ? itemReq.getRejectedQty() : java.math.BigDecimal.ZERO)
                .rejectionReason(itemReq.getRejectionReason())
                .build();
            grn.getItems().add(item);
        }

        grn = grnRepository.save(grn);
        return toDto(grn);
    }

    @Transactional
    public GrnDto approveGrn(Long id, Long userId) {
        GoodsReceiptNote grn = findById(id);
        if ("APPROVED".equals(grn.getStatus())) {
            throw new IllegalStateException("GRN already approved");
        }

        for (GrnItem item : grn.getItems()) {
            if (item.getAcceptedQty() == null || item.getAcceptedQty().signum() <= 0) {
                continue;
            }
            stockLedgerService.addEntry(
                item.getVariant().getId(),
                "PURCHASE_GRN",
                "GRN",
                grn.getId(),
                item.getAcceptedQty(),
                java.math.BigDecimal.ZERO,
                userId
            );
        }

        grn.setStatus("APPROVED");
        grn = grnRepository.save(grn);

        PurchaseOrder order = grn.getPurchaseOrder();
        if (order != null && !"COMPLETED".equals(order.getStatus())) {
            order.setStatus("RECEIVED");
            purchaseOrderRepository.save(order);
        }
        return toDto(grn);
    }

    private GoodsReceiptNote findById(Long id) {
        return grnRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("GRN not found with id: " + id));
    }

    private PagedResponse<GrnDto> toPage(Page<GoodsReceiptNote> grnPage) {
        return PagedResponse.<GrnDto>builder()
            .content(grnPage.getContent().stream().map(this::toDto).toList())
            .page(grnPage.getNumber())
            .size(grnPage.getSize())
            .totalElements(grnPage.getTotalElements())
            .totalPages(grnPage.getTotalPages())
            .first(grnPage.isFirst())
            .last(grnPage.isLast())
            .build();
    }

    private GrnDto toDto(GoodsReceiptNote grn) {
        PurchaseOrder order = grn.getPurchaseOrder();
        return GrnDto.builder()
            .id(grn.getId())
            .grnNumber(grn.getGrnNumber())
            .purchaseOrderId(order != null ? order.getId() : null)
            .purchaseOrderNumber(order != null ? order.getOrderNumber() : null)
            .supplierId(order != null ? order.getSupplier().getId() : null)
            .supplierName(order != null ? order.getSupplier().getName() : null)
            .receivedDate(grn.getReceivedDate())
            .status(grn.getStatus())
            .notes(grn.getNotes())
            .createdBy(grn.getCreatedBy())
            .createdAt(grn.getCreatedAt())
            .items(grn.getItems().stream().map(this::toItemDto).toList())
            .build();
    }

    private GrnItemDto toItemDto(GrnItem item) {
        ProductVariant variant = item.getVariant();
        return GrnItemDto.builder()
            .id(item.getId())
            .variantId(variant.getId())
            .variantName(variant.getProduct().getName())
            .barcode(variant.getBarcode())
            .colorName(variant.getColor() != null ? variant.getColor().getName() : null)
            .sizeName(variant.getSize() != null ? variant.getSize().getName() : null)
            .orderedQty(item.getOrderedQty())
            .receivedQty(item.getReceivedQty())
            .acceptedQty(item.getAcceptedQty())
            .rejectedQty(item.getRejectedQty())
            .rejectionReason(item.getRejectionReason())
            .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPendingOrderDetails(Long purchaseOrderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseOrderId)
            .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + purchaseOrderId));
        Map<String, Object> result = new HashMap<>();
        result.put("order", purchaseOrderService.getPurchaseOrder(order.getId()));
        return result;
    }
}
