package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.CustomerTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerTransactionRepository extends JpaRepository<CustomerTransaction, Long> {

    Page<CustomerTransaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId, Pageable pageable);

    List<CustomerTransaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId);
}
