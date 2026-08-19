package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Supplier;
import com.ajith.store.domain.model.SupplierTransaction;
import com.ajith.store.domain.repository.SupplierRepository;
import com.ajith.store.domain.repository.SupplierTransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierTransactionRepository supplierTransactionRepository;

    @Transactional(readOnly = true)
    public PagedResponse<SupplierDto> getSuppliers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Supplier> supplierPage;
        if (search != null && !search.isBlank()) {
            supplierPage = supplierRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            supplierPage = supplierRepository.findAll(pageable);
        }
        return PagedResponse.<SupplierDto>builder()
            .content(supplierPage.getContent().stream().map(this::toDto).toList())
            .page(supplierPage.getNumber())
            .size(supplierPage.getSize())
            .totalElements(supplierPage.getTotalElements())
            .totalPages(supplierPage.getTotalPages())
            .first(supplierPage.isFirst())
            .last(supplierPage.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplier(Long id) {
        Supplier supplier = findById(id);
        return toDto(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
            .name(request.getName())
            .contactPerson(request.getContactPerson())
            .mobile(request.getMobile())
            .email(request.getEmail())
            .address(request.getAddress())
            .gstNumber(request.getGstNumber())
            .creditTerms(request.getCreditTerms())
            .openingBalance(request.getOpeningBalance() != null ? request.getOpeningBalance() : BigDecimal.ZERO)
            .currentBalance(request.getOpeningBalance() != null ? request.getOpeningBalance() : BigDecimal.ZERO)
            .build();
        supplier = supplierRepository.save(supplier);

        if (supplier.getOpeningBalance().compareTo(BigDecimal.ZERO) != 0) {
            addTransaction(supplier.getId(), "OPENING_BALANCE", supplier.getOpeningBalance(),
                "OPENING_BALANCE", supplier.getId(), "Opening balance");
        }
        return toDto(supplier);
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = findById(id);
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setMobile(request.getMobile());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setGstNumber(request.getGstNumber());
        supplier.setCreditTerms(request.getCreditTerms());
        supplier = supplierRepository.save(supplier);
        return toDto(supplier);
    }

    @Transactional
    public SupplierDto toggleSupplierStatus(Long id) {
        Supplier supplier = findById(id);
        supplier.setStatus("ACTIVE".equals(supplier.getStatus()) ? "INACTIVE" : "ACTIVE");
        supplier = supplierRepository.save(supplier);
        return toDto(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = findById(id);
        supplier.setStatus("INACTIVE");
        supplierRepository.save(supplier);
    }

    @Transactional
    public SupplierTransactionDto addTransaction(Long supplierId, String transactionType, BigDecimal amount,
                                                 String referenceType, Long referenceId, String notes) {
        Supplier supplier = findById(supplierId);
        SupplierTransaction transaction = SupplierTransaction.builder()
            .supplier(supplier)
            .transactionType(transactionType)
            .amount(amount)
            .referenceType(referenceType)
            .referenceId(referenceId)
            .notes(notes)
            .build();
        transaction = supplierTransactionRepository.save(transaction);

        BigDecimal newBalance = supplier.getCurrentBalance().add(amount);
        supplier.setCurrentBalance(newBalance);
        supplierRepository.save(supplier);

        return toTransactionDto(transaction);
    }

    @Transactional(readOnly = true)
    public PagedResponse<SupplierTransactionDto> getSupplierTransactions(Long supplierId, int page, int size) {
        findById(supplierId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<SupplierTransaction> transactionPage =
            supplierTransactionRepository.findBySupplierIdOrderByTransactionDateDesc(supplierId, pageable);
        return PagedResponse.<SupplierTransactionDto>builder()
            .content(transactionPage.getContent().stream().map(this::toTransactionDto).toList())
            .page(transactionPage.getNumber())
            .size(transactionPage.getSize())
            .totalElements(transactionPage.getTotalElements())
            .totalPages(transactionPage.getTotalPages())
            .first(transactionPage.isFirst())
            .last(transactionPage.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllActiveSuppliers() {
        return supplierRepository.findByStatus("ACTIVE").stream()
            .map(this::toDto)
            .toList();
    }

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
    }

    private SupplierDto toDto(Supplier supplier) {
        return SupplierDto.builder()
            .id(supplier.getId())
            .name(supplier.getName())
            .contactPerson(supplier.getContactPerson())
            .mobile(supplier.getMobile())
            .email(supplier.getEmail())
            .address(supplier.getAddress())
            .gstNumber(supplier.getGstNumber())
            .creditTerms(supplier.getCreditTerms())
            .openingBalance(supplier.getOpeningBalance())
            .currentBalance(supplier.getCurrentBalance())
            .status(supplier.getStatus())
            .createdAt(supplier.getCreatedAt())
            .updatedAt(supplier.getUpdatedAt())
            .build();
    }

    private SupplierTransactionDto toTransactionDto(SupplierTransaction transaction) {
        return SupplierTransactionDto.builder()
            .id(transaction.getId())
            .supplierId(transaction.getSupplier().getId())
            .supplierName(transaction.getSupplier().getName())
            .transactionType(transaction.getTransactionType())
            .amount(transaction.getAmount())
            .referenceType(transaction.getReferenceType())
            .referenceId(transaction.getReferenceId())
            .notes(transaction.getNotes())
            .transactionDate(transaction.getTransactionDate())
            .build();
    }
}
