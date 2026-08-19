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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional(readOnly = true)
    public PagedResponse<PurchaseOrderDto> getPurchaseOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseOrder> orderPage = (status != null && !status.isBlank())
            ? purchaseOrderRepository.findByStatus(status, pageable)
            : purchaseOrderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return toPage(orderPage);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrder(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(PurchaseOrderRequest request, Long userId) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        PurchaseOrder order = PurchaseOrder.builder()
            .orderNumber("PO-" + purchaseOrderRepository.nextOrderNumber())
            .supplier(supplier)
            .orderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now())
            .expectedDelivery(request.getExpectedDelivery())
            .status("DRAFT")
            .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
            .notes(request.getNotes())
            .createdBy(userId)
            .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = findVariant(itemReq.getVariantId());
            BigDecimal quantity = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal itemDiscount = itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = unitPrice.multiply(quantity);
            BigDecimal itemTax = computeTax(variant, lineSubtotal.subtract(itemDiscount));
            BigDecimal totalPrice = lineSubtotal.subtract(itemDiscount).add(itemTax);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                .purchaseOrder(order)
                .variant(variant)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .discountAmount(itemDiscount)
                .taxAmount(itemTax)
                .totalPrice(totalPrice)
                .build();
            order.getItems().add(item);

            subtotal = subtotal.add(lineSubtotal);
            taxAmount = taxAmount.add(itemTax);
        }

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(subtotal.subtract(order.getDiscountAmount()).add(taxAmount));
        order = purchaseOrderRepository.save(order);
        return toDto(order);
    }

    @Transactional
    public PurchaseOrderDto updatePurchaseOrder(Long id, PurchaseOrderRequest request) {
        PurchaseOrder order = findById(id);
        if (!"DRAFT".equals(order.getStatus())) {
            throw new IllegalStateException("Only DRAFT purchase orders can be updated");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        order.setSupplier(supplier);
        order.setExpectedDelivery(request.getExpectedDelivery());
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        order.setNotes(request.getNotes());

        order.getItems().clear();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = findVariant(itemReq.getVariantId());
            BigDecimal quantity = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal itemDiscount = itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal lineSubtotal = unitPrice.multiply(quantity);
            BigDecimal itemTax = computeTax(variant, lineSubtotal.subtract(itemDiscount));
            BigDecimal totalPrice = lineSubtotal.subtract(itemDiscount).add(itemTax);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                .purchaseOrder(order)
                .variant(variant)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .discountAmount(itemDiscount)
                .taxAmount(itemTax)
                .totalPrice(totalPrice)
                .build();
            order.getItems().add(item);

            subtotal = subtotal.add(lineSubtotal);
            taxAmount = taxAmount.add(itemTax);
        }

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(subtotal.subtract(order.getDiscountAmount()).add(taxAmount));
        order = purchaseOrderRepository.save(order);
        return toDto(order);
    }

    @Transactional
    public PurchaseOrderDto updateOrderStatus(Long id, String status) {
        PurchaseOrder order = findById(id);
        order.setStatus(status);
        order = purchaseOrderRepository.save(order);
        return toDto(order);
    }

    @Transactional
    public void deletePurchaseOrder(Long id) {
        PurchaseOrder order = findById(id);
        if (!"DRAFT".equals(order.getStatus())) {
            throw new IllegalStateException("Only DRAFT purchase orders can be deleted");
        }
        purchaseOrderRepository.delete(order);
    }

    private PurchaseOrder findById(Long id) {
        return purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + id));
    }

    private ProductVariant findVariant(Long id) {
        return productVariantRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Variant not found with id: " + id));
    }

    private BigDecimal computeTax(ProductVariant variant, BigDecimal taxableAmount) {
        Product product = variant.getProduct();
        if (product.getTaxGroup() == null || Boolean.FALSE.equals(product.getGstApplicable())) {
            return BigDecimal.ZERO;
        }
        TaxGroup taxGroup = product.getTaxGroup();
        BigDecimal cgst = taxGroup.getCgstPct() != null ? taxGroup.getCgstPct() : BigDecimal.ZERO;
        BigDecimal sgst = taxGroup.getSgstPct() != null ? taxGroup.getSgstPct() : BigDecimal.ZERO;
        BigDecimal igst = taxGroup.getIgstPct() != null ? taxGroup.getIgstPct() : BigDecimal.ZERO;
        BigDecimal taxRate = cgst.add(sgst).add(igst);
        return taxableAmount.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private PagedResponse<PurchaseOrderDto> toPage(Page<PurchaseOrder> orderPage) {
        return PagedResponse.<PurchaseOrderDto>builder()
            .content(orderPage.getContent().stream().map(this::toDto).toList())
            .page(orderPage.getNumber())
            .size(orderPage.getSize())
            .totalElements(orderPage.getTotalElements())
            .totalPages(orderPage.getTotalPages())
            .first(orderPage.isFirst())
            .last(orderPage.isLast())
            .build();
    }

    private PurchaseOrderDto toDto(PurchaseOrder order) {
        return PurchaseOrderDto.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .supplierId(order.getSupplier().getId())
            .supplierName(order.getSupplier().getName())
            .orderDate(order.getOrderDate())
            .expectedDelivery(order.getExpectedDelivery())
            .status(order.getStatus())
            .subtotal(order.getSubtotal())
            .discountAmount(order.getDiscountAmount())
            .taxAmount(order.getTaxAmount())
            .totalAmount(order.getTotalAmount())
            .notes(order.getNotes())
            .createdBy(order.getCreatedBy())
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .items(order.getItems().stream().map(this::toItemDto).toList())
            .build();
    }

    private PurchaseOrderItemDto toItemDto(PurchaseOrderItem item) {
        ProductVariant variant = item.getVariant();
        return PurchaseOrderItemDto.builder()
            .id(item.getId())
            .variantId(variant.getId())
            .variantName(variant.getProduct().getName())
            .barcode(variant.getBarcode())
            .colorName(variant.getColor() != null ? variant.getColor().getName() : null)
            .sizeName(variant.getSize() != null ? variant.getSize().getName() : null)
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .discountAmount(item.getDiscountAmount())
            .taxAmount(item.getTaxAmount())
            .totalPrice(item.getTotalPrice())
            .build();
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderDto> getActiveOrdersForGrn(Long supplierId) {
        List<PurchaseOrder> orders = supplierId != null
            ? purchaseOrderRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId, PageRequest.of(0, 50)).getContent()
            : purchaseOrderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 50)).getContent();
        return orders.stream()
            .filter(o -> !"DRAFT".equals(o.getStatus()))
            .map(this::toDto)
            .toList();
    }
}
