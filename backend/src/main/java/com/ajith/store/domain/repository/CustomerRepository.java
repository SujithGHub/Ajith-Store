package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Page<Customer> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Customer> findByMobileContaining(String mobile, Pageable pageable);

    List<Customer> findByStatus(String status);

    boolean existsByNameIgnoreCase(String name);

    @Query(value = "SELECT nextval('seq_customer_code')", nativeQuery = true)
    Long nextCustomerCode();
}
