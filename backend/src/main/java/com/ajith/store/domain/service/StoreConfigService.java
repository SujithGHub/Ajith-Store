package com.ajith.store.domain.service;

import com.ajith.store.api.dto.StoreConfigDto;
import com.ajith.store.api.dto.StoreConfigRequest;
import com.ajith.store.domain.model.StoreConfig;
import com.ajith.store.domain.repository.StoreConfigRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreConfigService {

    private final StoreConfigRepository storeConfigRepository;

    @Transactional(readOnly = true)
    public StoreConfigDto getConfig() {
        StoreConfig config = storeConfigRepository.findById(1L)
            .orElseThrow(() -> new EntityNotFoundException("Store configuration not found"));
        return toDto(config);
    }

    @Transactional
    public StoreConfigDto updateConfig(StoreConfigRequest request) {
        StoreConfig config = storeConfigRepository.findById(1L)
            .orElseThrow(() -> new EntityNotFoundException("Store configuration not found"));
        updateEntity(config, request);
        config = storeConfigRepository.save(config);
        return toDto(config);
    }

    private StoreConfigDto toDto(StoreConfig config) {
        return StoreConfigDto.builder()
            .id(config.getId())
            .storeName(config.getStoreName())
            .address(config.getAddress())
            .phone(config.getPhone())
            .email(config.getEmail())
            .gstNumber(config.getGstNumber())
            .logoPath(config.getLogoPath())
            .invoiceHeader(config.getInvoiceHeader())
            .invoiceFooter(config.getInvoiceFooter())
            .currency(config.getCurrency())
            .financialYearStart(config.getFinancialYearStart())
            .financialYearEnd(config.getFinancialYearEnd())
            .taxEnabled(config.getTaxEnabled())
            .roundOffEnabled(config.getRoundOffEnabled())
            .build();
    }

    private void updateEntity(StoreConfig config, StoreConfigRequest request) {
        if (request.getStoreName() != null) config.setStoreName(request.getStoreName());
        if (request.getAddress() != null) config.setAddress(request.getAddress());
        if (request.getPhone() != null) config.setPhone(request.getPhone());
        if (request.getEmail() != null) config.setEmail(request.getEmail());
        if (request.getGstNumber() != null) config.setGstNumber(request.getGstNumber());
        if (request.getLogoPath() != null) config.setLogoPath(request.getLogoPath());
        if (request.getInvoiceHeader() != null) config.setInvoiceHeader(request.getInvoiceHeader());
        if (request.getInvoiceFooter() != null) config.setInvoiceFooter(request.getInvoiceFooter());
        if (request.getCurrency() != null) config.setCurrency(request.getCurrency());
        if (request.getFinancialYearStart() != null) config.setFinancialYearStart(request.getFinancialYearStart());
        if (request.getFinancialYearEnd() != null) config.setFinancialYearEnd(request.getFinancialYearEnd());
        if (request.getTaxEnabled() != null) config.setTaxEnabled(request.getTaxEnabled());
        if (request.getRoundOffEnabled() != null) config.setRoundOffEnabled(request.getRoundOffEnabled());
    }
}
