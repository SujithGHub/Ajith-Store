package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Manufacturer;
import com.ajith.store.domain.repository.ManufacturerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ManufacturerService {

    private final ManufacturerRepository manufacturerRepository;

    @Transactional(readOnly = true)
    public List<ManufacturerDto> getAllManufacturers() {
        return manufacturerRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public ManufacturerDto getManufacturerById(Long id) {
        Manufacturer manufacturer = manufacturerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found with id: " + id));
        return toDto(manufacturer);
    }

    @Transactional
    public ManufacturerDto createManufacturer(ManufacturerRequest request) {
        Manufacturer manufacturer = Manufacturer.builder()
            .name(request.getName())
            .contactPerson(request.getContactPerson())
            .mobile(request.getMobile())
            .email(request.getEmail())
            .address(request.getAddress())
            .build();
        manufacturer = manufacturerRepository.save(manufacturer);
        return toDto(manufacturer);
    }

    @Transactional
    public ManufacturerDto updateManufacturer(Long id, ManufacturerRequest request) {
        Manufacturer manufacturer = manufacturerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found with id: " + id));
        manufacturer.setName(request.getName());
        manufacturer.setContactPerson(request.getContactPerson());
        manufacturer.setMobile(request.getMobile());
        manufacturer.setEmail(request.getEmail());
        manufacturer.setAddress(request.getAddress());
        manufacturer = manufacturerRepository.save(manufacturer);
        return toDto(manufacturer);
    }

    @Transactional
    public void deleteManufacturer(Long id) {
        Manufacturer manufacturer = manufacturerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found with id: " + id));
        manufacturerRepository.delete(manufacturer);
    }

    @Transactional
    public ManufacturerDto toggleStatus(Long id) {
        Manufacturer manufacturer = manufacturerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found with id: " + id));
        manufacturer.setStatus("ACTIVE".equals(manufacturer.getStatus()) ? "INACTIVE" : "ACTIVE");
        manufacturer = manufacturerRepository.save(manufacturer);
        return toDto(manufacturer);
    }

    private ManufacturerDto toDto(Manufacturer manufacturer) {
        return ManufacturerDto.builder()
            .id(manufacturer.getId())
            .name(manufacturer.getName())
            .contactPerson(manufacturer.getContactPerson())
            .mobile(manufacturer.getMobile())
            .email(manufacturer.getEmail())
            .address(manufacturer.getAddress())
            .status(manufacturer.getStatus())
            .createdAt(manufacturer.getCreatedAt())
            .updatedAt(manufacturer.getUpdatedAt())
            .build();
    }
}
