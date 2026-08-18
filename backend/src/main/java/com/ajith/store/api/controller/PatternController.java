package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.PatternService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patterns")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PatternController {

    private final PatternService patternService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatternDto>>> getAllPatterns() {
        return ResponseEntity.ok(ApiResponse.success(patternService.getAllPatterns()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatternDto>> getPattern(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patternService.getPattern(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatternDto>> createPattern(@Valid @RequestBody PatternRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Pattern created successfully", patternService.createPattern(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatternDto>> updatePattern(@PathVariable Long id, @Valid @RequestBody PatternRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Pattern updated successfully", patternService.updatePattern(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PatternDto>> togglePatternStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Pattern status toggled", patternService.togglePatternStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePattern(@PathVariable Long id) {
        patternService.deletePattern(id);
        return ResponseEntity.ok(ApiResponse.success("Pattern deleted successfully", null));
    }
}
