package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Brand;
import com.ajith.store.domain.repository.BrandRepository;
import com.ajith.store.domain.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<BrandDto> getAllBrands() {
        return brandRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public BrandDto getBrand(Long id) {
        Brand brand = brandRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        return toDto(brand);
    }

    @Transactional
    public BrandDto createBrand(BrandRequest request) {
        Brand brand = Brand.builder()
            .name(request.getName())
            .description(request.getDescription())
            .imagePath(request.getImagePath())
            .build();
        brand = brandRepository.save(brand);
        return toDto(brand);
    }

    @Transactional
    public BrandDto updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        brand.setName(request.getName());
        brand.setDescription(request.getDescription());
        brand.setImagePath(request.getImagePath());
        brand = brandRepository.save(brand);
        return toDto(brand);
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        if (!productRepository.findByBrandId(id, PageRequest.of(0, 1)).isEmpty()) {
            throw new IllegalStateException("Cannot delete brand with associated products");
        }
        brandRepository.delete(brand);
    }

    @Transactional
    public BrandDto toggleBrandStatus(Long id) {
        Brand brand = brandRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        brand.setStatus("ACTIVE".equals(brand.getStatus()) ? "INACTIVE" : "ACTIVE");
        brand = brandRepository.save(brand);
        return toDto(brand);
    }

    private BrandDto toDto(Brand brand) {
        return BrandDto.builder()
            .id(brand.getId())
            .name(brand.getName())
            .description(brand.getDescription())
            .imagePath(brand.getImagePath())
            .status(brand.getStatus())
            .createdAt(brand.getCreatedAt())
            .updatedAt(brand.getUpdatedAt())
            .build();
    }
}
