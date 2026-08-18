package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Fabric;
import com.ajith.store.domain.repository.FabricRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FabricService {

    private final FabricRepository fabricRepository;

    @Transactional(readOnly = true)
    public List<FabricDto> getAllFabrics() {
        return fabricRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public FabricDto getFabric(Long id) {
        Fabric fabric = fabricRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Fabric not found with id: " + id));
        return toDto(fabric);
    }

    @Transactional
    public FabricDto createFabric(FabricRequest request) {
        Fabric fabric = Fabric.builder()
            .name(request.getName())
            .description(request.getDescription())
            .build();
        fabric = fabricRepository.save(fabric);
        return toDto(fabric);
    }

    @Transactional
    public FabricDto updateFabric(Long id, FabricRequest request) {
        Fabric fabric = fabricRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Fabric not found with id: " + id));
        fabric.setName(request.getName());
        fabric.setDescription(request.getDescription());
        fabric = fabricRepository.save(fabric);
        return toDto(fabric);
    }

    @Transactional
    public void deleteFabric(Long id) {
        Fabric fabric = fabricRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Fabric not found with id: " + id));
        fabricRepository.delete(fabric);
    }

    @Transactional
    public FabricDto toggleFabricStatus(Long id) {
        Fabric fabric = fabricRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Fabric not found with id: " + id));
        fabric.setStatus("ACTIVE".equals(fabric.getStatus()) ? "INACTIVE" : "ACTIVE");
        fabric = fabricRepository.save(fabric);
        return toDto(fabric);
    }

    private FabricDto toDto(Fabric fabric) {
        return FabricDto.builder()
            .id(fabric.getId())
            .name(fabric.getName())
            .description(fabric.getDescription())
            .status(fabric.getStatus())
            .createdAt(fabric.getCreatedAt())
            .build();
    }
}
