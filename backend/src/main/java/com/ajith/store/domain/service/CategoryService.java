package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.Category;
import com.ajith.store.domain.repository.CategoryRepository;
import com.ajith.store.domain.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        return toDto(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getRootCategories() {
        return categoryRepository.findByParentIdIsNull().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getSubcategories(Long parentId) {
        return categoryRepository.findByParentId(parentId).stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public CategoryDto createCategory(CategoryRequest request) {
        Category category = Category.builder()
            .name(request.getName())
            .description(request.getDescription())
            .imagePath(request.getImagePath())
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
            .status("ACTIVE")
            .build();
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new EntityNotFoundException("Parent category not found with id: " + request.getParentId()));
            category.setParent(parent);
        }
        category = categoryRepository.save(category);
        return toDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImagePath(request.getImagePath());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new EntityNotFoundException("Parent category not found with id: " + request.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        category = categoryRepository.save(category);
        return toDto(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        if (!productRepository.findByCategoryId(id, PageRequest.of(0, 1)).isEmpty()) {
            throw new IllegalStateException("Cannot delete category with associated products");
        }
        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryDto toggleCategoryStatus(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        category.setStatus("ACTIVE".equals(category.getStatus()) ? "INACTIVE" : "ACTIVE");
        category = categoryRepository.save(category);
        return toDto(category);
    }

    private CategoryDto toDto(Category category) {
        return CategoryDto.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .parentId(category.getParent() != null ? category.getParent().getId() : null)
            .parentName(category.getParent() != null ? category.getParent().getName() : null)
            .imagePath(category.getImagePath())
            .sortOrder(category.getSortOrder())
            .status(category.getStatus())
            .childrenCount(category.getChildren() != null ? category.getChildren().size() : 0)
            .createdAt(category.getCreatedAt())
            .updatedAt(category.getUpdatedAt())
            .build();
    }
}
