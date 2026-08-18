package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Pattern;
import com.ajith.store.domain.repository.PatternRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatternService {

    private final PatternRepository patternRepository;

    @Transactional(readOnly = true)
    public List<PatternDto> getAllPatterns() {
        return patternRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public PatternDto getPattern(Long id) {
        Pattern pattern = patternRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Pattern not found with id: " + id));
        return toDto(pattern);
    }

    @Transactional
    public PatternDto createPattern(PatternRequest request) {
        Pattern pattern = Pattern.builder()
            .name(request.getName())
            .description(request.getDescription())
            .build();
        pattern = patternRepository.save(pattern);
        return toDto(pattern);
    }

    @Transactional
    public PatternDto updatePattern(Long id, PatternRequest request) {
        Pattern pattern = patternRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Pattern not found with id: " + id));
        pattern.setName(request.getName());
        pattern.setDescription(request.getDescription());
        pattern = patternRepository.save(pattern);
        return toDto(pattern);
    }

    @Transactional
    public void deletePattern(Long id) {
        Pattern pattern = patternRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Pattern not found with id: " + id));
        patternRepository.delete(pattern);
    }

    @Transactional
    public PatternDto togglePatternStatus(Long id) {
        Pattern pattern = patternRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Pattern not found with id: " + id));
        pattern.setStatus("ACTIVE".equals(pattern.getStatus()) ? "INACTIVE" : "ACTIVE");
        pattern = patternRepository.save(pattern);
        return toDto(pattern);
    }

    private PatternDto toDto(Pattern pattern) {
        return PatternDto.builder()
            .id(pattern.getId())
            .name(pattern.getName())
            .description(pattern.getDescription())
            .status(pattern.getStatus())
            .createdAt(pattern.getCreatedAt())
            .build();
    }
}
