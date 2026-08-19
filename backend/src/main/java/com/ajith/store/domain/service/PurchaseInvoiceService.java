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
public class PurchaseInvoiceService {

    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierService supplierService;

    @Transactional(readOnly = true)
    public PagedResponse<PurchaseInvoiceDto> getInvoices(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseInvoice> invoicePage = (status != null && !status.isBlank())
            ? purchaseInvoiceRepository.findByStatus(status, pageable)
            : purchaseInvoiceRepository.findAllByOrderByCreatedAtDesc(pageable);
        return toPage(invoicePage);
    }

    @Transactional(readOnly = true)
    public PurchaseInvoiceDto getInvoice(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public PurchaseInvoiceDto createInvoice(PurchaseInvoiceRequest request, Long userId) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        BigDecimal subtotal = request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal tax = request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discount).add(tax);
        BigDecimal paidAmount = request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal balance = total.subtract(paidAmount);

        PurchaseInvoice invoice = PurchaseInvoice.builder()
            .invoiceNumber("PI-" + purchaseInvoiceRepository.nextInvoiceNumber())
            .supplier(supplier)
            .purchaseOrder(request.getPurchaseOrderId() != null
                ? purchaseOrderRepository.findById(request.getPurchaseOrderId())
                    .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + request.getPurchaseOrderId()))
                : null)
            .invoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now())
            .dueDate(request.getDueDate())
            .subtotal(subtotal)
            .discountAmount(discount)
            .taxAmount(tax)
            .totalAmount(total)
            .paidAmount(paidAmount)
            .balanceAmount(balance)
            .status(balance.signum() <= 0 ? "PAID" : "PARTIAL")
            .notes(request.getNotes())
            .createdBy(userId)
            .build();
        invoice = purchaseInvoiceRepository.save(invoice);

        supplierService.addTransaction(supplier.getId(), "PURCHASE_INVOICE", total,
            "PURCHASE_INVOICE", invoice.getId(), "Purchase invoice " + invoice.getInvoiceNumber());

        if (paidAmount.signum() > 0) {
            supplierService.addTransaction(supplier.getId(), "SUPPLIER_PAYMENT", paidAmount.negate(),
                "PURCHASE_INVOICE_PAYMENT", invoice.getId(), "Payment for " + invoice.getInvoiceNumber());
        }
        return toDto(invoice);
    }

    @Transactional
    public PurchaseInvoiceDto updateInvoicePayment(Long id, BigDecimal paidAmount, Long userId) {
        PurchaseInvoice invoice = findById(id);
        if (invoice.getBalanceAmount().signum() <= 0) {
            throw new IllegalStateException("Invoice already fully paid");
        }
        BigDecimal additionalPayment = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        if (additionalPayment.signum() < 0) {
            throw new IllegalArgumentException("Payment amount cannot be negative");
        }
        if (additionalPayment.compareTo(invoice.getBalanceAmount()) > 0) {
            throw new IllegalArgumentException("Payment exceeds balance amount");
        }

        invoice.setPaidAmount(invoice.getPaidAmount().add(additionalPayment));
        invoice.setBalanceAmount(invoice.getTotalAmount().subtract(invoice.getPaidAmount()));
        invoice.setStatus(invoice.getBalanceAmount().signum() <= 0 ? "PAID" : "PARTIAL");
        invoice = purchaseInvoiceRepository.save(invoice);

        if (additionalPayment.signum() > 0) {
            supplierService.addTransaction(invoice.getSupplier().getId(), "SUPPLIER_PAYMENT", additionalPayment.negate(),
                "PURCHASE_INVOICE_PAYMENT", invoice.getId(), "Payment for " + invoice.getInvoiceNumber());
        }
        return toDto(invoice);
    }

    private PurchaseInvoice findById(Long id) {
        return purchaseInvoiceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Purchase invoice not found with id: " + id));
    }

    private PagedResponse<PurchaseInvoiceDto> toPage(Page<PurchaseInvoice> invoicePage) {
        return PagedResponse.<PurchaseInvoiceDto>builder()
            .content(invoicePage.getContent().stream().map(this::toDto).toList())
            .page(invoicePage.getNumber())
            .size(invoicePage.getSize())
            .totalElements(invoicePage.getTotalElements())
            .totalPages(invoicePage.getTotalPages())
            .first(invoicePage.isFirst())
            .last(invoicePage.isLast())
            .build();
    }

    private PurchaseInvoiceDto toDto(PurchaseInvoice invoice) {
        PurchaseOrder order = invoice.getPurchaseOrder();
        return PurchaseInvoiceDto.builder()
            .id(invoice.getId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .supplierId(invoice.getSupplier().getId())
            .supplierName(invoice.getSupplier().getName())
            .purchaseOrderId(order != null ? order.getId() : null)
            .purchaseOrderNumber(order != null ? order.getOrderNumber() : null)
            .invoiceDate(invoice.getInvoiceDate())
            .dueDate(invoice.getDueDate())
            .subtotal(invoice.getSubtotal())
            .discountAmount(invoice.getDiscountAmount())
            .taxAmount(invoice.getTaxAmount())
            .totalAmount(invoice.getTotalAmount())
            .paidAmount(invoice.getPaidAmount())
            .balanceAmount(invoice.getBalanceAmount())
            .status(invoice.getStatus())
            .notes(invoice.getNotes())
            .createdBy(invoice.getCreatedBy())
            .createdAt(invoice.getCreatedAt())
            .build();
    }
}
