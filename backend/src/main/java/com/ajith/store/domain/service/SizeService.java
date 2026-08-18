package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Size;
import com.ajith.store.domain.repository.SizeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SizeService {

    private final SizeRepository sizeRepository;

    @Transactional(readOnly = true)
    public List<SizeDto> getAllSizes() {
        return sizeRepository.findAllByOrderByDisplayOrderAsc().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public SizeDto getSize(Long id) {
        Size size = sizeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + id));
        return toDto(size);
    }

    @Transactional
    public SizeDto createSize(SizeRequest request) {
        Size size = Size.builder()
            .name(request.getName())
            .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
            .build();
        size = sizeRepository.save(size);
        return toDto(size);
    }

    @Transactional
    public SizeDto updateSize(Long id, SizeRequest request) {
        Size size = sizeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + id));
        size.setName(request.getName());
        if (request.getDisplayOrder() != null) {
            size.setDisplayOrder(request.getDisplayOrder());
        }
        size = sizeRepository.save(size);
        return toDto(size);
    }

    @Transactional
    public void deleteSize(Long id) {
        Size size = sizeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + id));
        sizeRepository.delete(size);
    }

    @Transactional
    public SizeDto toggleSizeStatus(Long id) {
        Size size = sizeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + id));
        size.setStatus("ACTIVE".equals(size.getStatus()) ? "INACTIVE" : "ACTIVE");
        size = sizeRepository.save(size);
        return toDto(size);
    }

    private SizeDto toDto(Size size) {
        return SizeDto.builder()
            .id(size.getId())
            .name(size.getName())
            .displayOrder(size.getDisplayOrder())
            .status(size.getStatus())
            .createdAt(size.getCreatedAt())
            .build();
    }
}
