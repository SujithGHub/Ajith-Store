package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Customer;
import com.ajith.store.domain.model.CustomerTransaction;
import com.ajith.store.domain.repository.CustomerRepository;
import com.ajith.store.domain.repository.CustomerTransactionRepository;
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
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerTransactionRepository customerTransactionRepository;

    @Transactional(readOnly = true)
    public PagedResponse<CustomerDto> getCustomers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Customer> customerPage;
        if (search != null && !search.isBlank()) {
            if (search.matches("\\d+")) {
                customerPage = customerRepository.findByMobileContaining(search, pageable);
            } else {
                customerPage = customerRepository.findByNameContainingIgnoreCase(search, pageable);
            }
        } else {
            customerPage = customerRepository.findAll(pageable);
        }
        return PagedResponse.<CustomerDto>builder()
            .content(customerPage.getContent().stream().map(this::toDto).toList())
            .page(customerPage.getNumber())
            .size(customerPage.getSize())
            .totalElements(customerPage.getTotalElements())
            .totalPages(customerPage.getTotalPages())
            .first(customerPage.isFirst())
            .last(customerPage.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomer(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public CustomerDto createCustomer(CustomerRequest request) {
        Long code = customerRepository.nextCustomerCode();
        Customer customer = Customer.builder()
            .customerCode("CUST-" + code)
            .name(request.getName())
            .mobile(request.getMobile())
            .email(request.getEmail())
            .address(request.getAddress())
            .gstNumber(request.getGstNumber())
            .creditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : BigDecimal.ZERO)
            .openingBalance(request.getOpeningBalance() != null ? request.getOpeningBalance() : BigDecimal.ZERO)
            .currentBalance(request.getOpeningBalance() != null ? request.getOpeningBalance() : BigDecimal.ZERO)
            .build();
        customer = customerRepository.save(customer);

        if (customer.getOpeningBalance().compareTo(BigDecimal.ZERO) != 0) {
            addTransaction(customer.getId(), "OPENING_BALANCE", customer.getOpeningBalance(),
                "OPENING_BALANCE", customer.getId(), "Opening balance");
        }
        return toDto(customer);
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findById(id);
        customer.setName(request.getName());
        customer.setMobile(request.getMobile());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setGstNumber(request.getGstNumber());
        customer.setCreditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : customer.getCreditLimit());
        customer = customerRepository.save(customer);
        return toDto(customer);
    }

    @Transactional
    public CustomerDto toggleCustomerStatus(Long id) {
        Customer customer = findById(id);
        customer.setStatus("ACTIVE".equals(customer.getStatus()) ? "INACTIVE" : "ACTIVE");
        customer = customerRepository.save(customer);
        return toDto(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = findById(id);
        customer.setStatus("INACTIVE");
        customerRepository.save(customer);
    }

    @Transactional
    public CustomerTransactionDto addTransaction(Long customerId, String transactionType, BigDecimal amount,
                                                 String referenceType, Long referenceId, String notes) {
        Customer customer = findById(customerId);
        CustomerTransaction transaction = CustomerTransaction.builder()
            .customer(customer)
            .transactionType(transactionType)
            .amount(amount)
            .referenceType(referenceType)
            .referenceId(referenceId)
            .notes(notes)
            .build();
        transaction = customerTransactionRepository.save(transaction);

        BigDecimal newBalance = customer.getCurrentBalance().add(amount);
        customer.setCurrentBalance(newBalance);
        customerRepository.save(customer);

        return toTransactionDto(transaction);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CustomerTransactionDto> getCustomerTransactions(Long customerId, int page, int size) {
        findById(customerId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<CustomerTransaction> transactionPage =
            customerTransactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId, pageable);
        return PagedResponse.<CustomerTransactionDto>builder()
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
    public List<CustomerDto> getAllActiveCustomers() {
        return customerRepository.findByStatus("ACTIVE").stream()
            .map(this::toDto)
            .toList();
    }

    private Customer findById(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
    }

    private CustomerDto toDto(Customer customer) {
        return CustomerDto.builder()
            .id(customer.getId())
            .customerCode(customer.getCustomerCode())
            .name(customer.getName())
            .mobile(customer.getMobile())
            .email(customer.getEmail())
            .address(customer.getAddress())
            .gstNumber(customer.getGstNumber())
            .creditLimit(customer.getCreditLimit())
            .openingBalance(customer.getOpeningBalance())
            .currentBalance(customer.getCurrentBalance())
            .loyaltyPoints(customer.getLoyaltyPoints())
            .membershipLevel(customer.getMembershipLevel())
            .status(customer.getStatus())
            .createdAt(customer.getCreatedAt())
            .updatedAt(customer.getUpdatedAt())
            .build();
    }

    private CustomerTransactionDto toTransactionDto(CustomerTransaction transaction) {
        return CustomerTransactionDto.builder()
            .id(transaction.getId())
            .customerId(transaction.getCustomer().getId())
            .customerName(transaction.getCustomer().getName())
            .transactionType(transaction.getTransactionType())
            .amount(transaction.getAmount())
            .referenceType(transaction.getReferenceType())
            .referenceId(transaction.getReferenceId())
            .notes(transaction.getNotes())
            .transactionDate(transaction.getTransactionDate())
            .build();
    }
}
