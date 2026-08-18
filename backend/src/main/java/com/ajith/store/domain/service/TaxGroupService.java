package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.TaxGroup;
import com.ajith.store.domain.repository.TaxGroupRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxGroupService {

    private final TaxGroupRepository taxGroupRepository;

    @Transactional(readOnly = true)
    public List<TaxGroupDto> getAllTaxGroups() {
        return taxGroupRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public TaxGroupDto getTaxGroup(Long id) {
        TaxGroup taxGroup = taxGroupRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("TaxGroup not found with id: " + id));
        return toDto(taxGroup);
    }

    @Transactional
    public TaxGroupDto createTaxGroup(TaxGroupRequest request) {
        TaxGroup taxGroup = TaxGroup.builder()
            .name(request.getName())
            .cgstPct(request.getCgstPct())
            .sgstPct(request.getSgstPct())
            .igstPct(request.getIgstPct())
            .build();
        taxGroup = taxGroupRepository.save(taxGroup);
        return toDto(taxGroup);
    }

    @Transactional
    public TaxGroupDto updateTaxGroup(Long id, TaxGroupRequest request) {
        TaxGroup taxGroup = taxGroupRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("TaxGroup not found with id: " + id));
        taxGroup.setName(request.getName());
        taxGroup.setCgstPct(request.getCgstPct());
        taxGroup.setSgstPct(request.getSgstPct());
        taxGroup.setIgstPct(request.getIgstPct());
        taxGroup = taxGroupRepository.save(taxGroup);
        return toDto(taxGroup);
    }

    @Transactional
    public void deleteTaxGroup(Long id) {
        TaxGroup taxGroup = taxGroupRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("TaxGroup not found with id: " + id));
        taxGroupRepository.delete(taxGroup);
    }

    @Transactional
    public TaxGroupDto toggleTaxGroupStatus(Long id) {
        TaxGroup taxGroup = taxGroupRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("TaxGroup not found with id: " + id));
        taxGroup.setStatus("ACTIVE".equals(taxGroup.getStatus()) ? "INACTIVE" : "ACTIVE");
        taxGroup = taxGroupRepository.save(taxGroup);
        return toDto(taxGroup);
    }

    private TaxGroupDto toDto(TaxGroup taxGroup) {
        return TaxGroupDto.builder()
            .id(taxGroup.getId())
            .name(taxGroup.getName())
            .cgstPct(taxGroup.getCgstPct())
            .sgstPct(taxGroup.getSgstPct())
            .igstPct(taxGroup.getIgstPct())
            .status(taxGroup.getStatus())
            .createdAt(taxGroup.getCreatedAt())
            .build();
    }
}
