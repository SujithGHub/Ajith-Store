package com.ajith.store.api.controller;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.service.ColorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ColorController {

    private final ColorService colorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ColorDto>>> getAllColors() {
        return ResponseEntity.ok(ApiResponse.success(colorService.getAllColors()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ColorDto>> getColor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(colorService.getColor(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ColorDto>> createColor(@Valid @RequestBody ColorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Color created successfully", colorService.createColor(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ColorDto>> updateColor(@PathVariable Long id, @Valid @RequestBody ColorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Color updated successfully", colorService.updateColor(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ColorDto>> toggleColorStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Color status toggled", colorService.toggleColorStatus(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
        return ResponseEntity.ok(ApiResponse.success("Color deleted successfully", null));
    }
}
