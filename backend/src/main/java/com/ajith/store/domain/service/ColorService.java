package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Color;
import com.ajith.store.domain.repository.ColorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColorService {

    private final ColorRepository colorRepository;

    @Transactional(readOnly = true)
    public List<ColorDto> getAllColors() {
        return colorRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public ColorDto getColor(Long id) {
        Color color = colorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Color not found with id: " + id));
        return toDto(color);
    }

    @Transactional
    public ColorDto createColor(ColorRequest request) {
        Color color = Color.builder()
            .name(request.getName())
            .hexCode(request.getHexCode())
            .build();
        color = colorRepository.save(color);
        return toDto(color);
    }

    @Transactional
    public ColorDto updateColor(Long id, ColorRequest request) {
        Color color = colorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Color not found with id: " + id));
        color.setName(request.getName());
        color.setHexCode(request.getHexCode());
        color = colorRepository.save(color);
        return toDto(color);
    }

    @Transactional
    public void deleteColor(Long id) {
        Color color = colorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Color not found with id: " + id));
        colorRepository.delete(color);
    }

    @Transactional
    public ColorDto toggleColorStatus(Long id) {
        Color color = colorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Color not found with id: " + id));
        color.setStatus("ACTIVE".equals(color.getStatus()) ? "INACTIVE" : "ACTIVE");
        color = colorRepository.save(color);
        return toDto(color);
    }

    private ColorDto toDto(Color color) {
        return ColorDto.builder()
            .id(color.getId())
            .name(color.getName())
            .hexCode(color.getHexCode())
            .status(color.getStatus())
            .createdAt(color.getCreatedAt())
            .build();
    }
}
