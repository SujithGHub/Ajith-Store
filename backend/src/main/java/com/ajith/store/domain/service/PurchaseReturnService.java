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

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PurchaseReturnService {

    private final PurchaseReturnRepository purchaseReturnRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockLedgerService stockLedgerService;
    private final SupplierService supplierService;

    @Transactional(readOnly = true)
    public PagedResponse<PurchaseReturnDto> getReturns(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseReturn> returnPage = purchaseReturnRepository.findAllByOrderByCreatedAtDesc(pageable);
        return toPage(returnPage);
    }

    @Transactional(readOnly = true)
    public PurchaseReturnDto getReturn(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public PurchaseReturnDto createReturn(PurchaseReturnRequest request, Long userId) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        PurchaseInvoice invoice = request.getPurchaseInvoiceId() != null
            ? purchaseInvoiceRepository.findById(request.getPurchaseInvoiceId())
                .orElseThrow(() -> new EntityNotFoundException("Purchase invoice not found with id: " + request.getPurchaseInvoiceId()))
            : null;

        PurchaseReturn purchaseReturn = PurchaseReturn.builder()
            .returnNumber("PR-" + purchaseReturnRepository.nextReturnNumber())
            .supplier(supplier)
            .purchaseInvoice(invoice)
            .returnDate(request.getReturnDate() != null ? request.getReturnDate() : LocalDate.now())
            .reason(request.getReason())
            .status("APPROVED")
            .createdBy(userId)
            .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (PurchaseReturnItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                .orElseThrow(() -> new EntityNotFoundException("Variant not found with id: " + itemReq.getVariantId()));
            BigDecimal quantity = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ZERO;
            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal lineTotal = quantity.multiply(unitPrice);

            PurchaseReturnItem item = PurchaseReturnItem.builder()
                .purchaseReturn(purchaseReturn)
                .variant(variant)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .reason(itemReq.getReason())
                .build();
            purchaseReturn.getItems().add(item);
            subtotal = subtotal.add(lineTotal);
        }

        purchaseReturn.setSubtotal(subtotal);
        purchaseReturn.setTotalAmount(subtotal);
        purchaseReturn = purchaseReturnRepository.save(purchaseReturn);

        for (PurchaseReturnItem item : purchaseReturn.getItems()) {
            stockLedgerService.addEntry(
                item.getVariant().getId(),
                "PURCHASE_RETURN",
                "PURCHASE_RETURN",
                purchaseReturn.getId(),
                BigDecimal.ZERO,
                item.getQuantity(),
                userId
            );
        }

        supplierService.addTransaction(supplier.getId(), "PURCHASE_RETURN", subtotal.negate(),
            "PURCHASE_RETURN", purchaseReturn.getId(), "Purchase return " + purchaseReturn.getReturnNumber());
        return toDto(purchaseReturn);
    }

    private PurchaseReturn findById(Long id) {
        return purchaseReturnRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Purchase return not found with id: " + id));
    }

    private PagedResponse<PurchaseReturnDto> toPage(Page<PurchaseReturn> returnPage) {
        return PagedResponse.<PurchaseReturnDto>builder()
            .content(returnPage.getContent().stream().map(this::toDto).toList())
            .page(returnPage.getNumber())
            .size(returnPage.getSize())
            .totalElements(returnPage.getTotalElements())
            .totalPages(returnPage.getTotalPages())
            .first(returnPage.isFirst())
            .last(returnPage.isLast())
            .build();
    }

    private PurchaseReturnDto toDto(PurchaseReturn purchaseReturn) {
        PurchaseInvoice invoice = purchaseReturn.getPurchaseInvoice();
        return PurchaseReturnDto.builder()
            .id(purchaseReturn.getId())
            .returnNumber(purchaseReturn.getReturnNumber())
            .supplierId(purchaseReturn.getSupplier().getId())
            .supplierName(purchaseReturn.getSupplier().getName())
            .purchaseInvoiceId(invoice != null ? invoice.getId() : null)
            .purchaseInvoiceNumber(invoice != null ? invoice.getInvoiceNumber() : null)
            .returnDate(purchaseReturn.getReturnDate())
            .reason(purchaseReturn.getReason())
            .subtotal(purchaseReturn.getSubtotal())
            .taxAmount(purchaseReturn.getTaxAmount())
            .totalAmount(purchaseReturn.getTotalAmount())
            .status(purchaseReturn.getStatus())
            .createdBy(purchaseReturn.getCreatedBy())
            .createdAt(purchaseReturn.getCreatedAt())
            .items(purchaseReturn.getItems().stream().map(this::toItemDto).toList())
            .build();
    }

    private PurchaseReturnItemDto toItemDto(PurchaseReturnItem item) {
        ProductVariant variant = item.getVariant();
        return PurchaseReturnItemDto.builder()
            .id(item.getId())
            .variantId(variant.getId())
            .variantName(variant.getProduct().getName())
            .barcode(variant.getBarcode())
            .colorName(variant.getColor() != null ? variant.getColor().getName() : null)
            .sizeName(variant.getSize() != null ? variant.getSize().getName() : null)
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .reason(item.getReason())
            .build();
    }
}
