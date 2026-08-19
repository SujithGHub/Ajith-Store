package com.ajith.store.domain.service;

import com.ajith.store.api.dto.*;
import com.ajith.store.domain.model.*;
import com.ajith.store.domain.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final FabricRepository fabricRepository;
    private final PatternRepository patternRepository;
    private final TaxGroupRepository taxGroupRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;
    private final PriceChangeHistoryRepository priceChangeHistoryRepository;
    private final ProductImageRepository productImageRepository;
    private final StockLedgerService stockLedgerService;

    @Transactional(readOnly = true)
    public List<VariantDto> getAllActiveVariants() {
        return productVariantRepository
            .findByStatus("ACTIVE", PageRequest.of(0, 1000)).getContent().stream()
            .map(this::toVariantDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductListDto> getProducts(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage;
        if (search != null && !search.isBlank()) {
            productPage = productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }
        return PagedResponse.<ProductListDto>builder()
            .content(productPage.getContent().stream().map(this::toListDto).toList())
            .page(productPage.getNumber())
            .size(productPage.getSize())
            .totalElements(productPage.getTotalElements())
            .totalPages(productPage.getTotalPages())
            .first(productPage.isFirst())
            .last(productPage.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public ProductDto getProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        return toFullDto(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductByItemCode(String itemCode) {
        Product product = productRepository.findByItemCode(itemCode)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with itemCode: " + itemCode));
        return toFullDto(product);
    }

    @Transactional(readOnly = true)
    public VariantDto lookupByBarcode(String barcode) {
        ProductVariant variant = productVariantRepository.findByBarcode(barcode)
            .orElseThrow(() -> new EntityNotFoundException("Variant not found with barcode: " + barcode));
        return toVariantDto(variant);
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        String itemCode = request.getItemCode();
        if (itemCode == null || itemCode.isBlank()) {
            itemCode = "PRD-" + System.currentTimeMillis();
        }

        Product product = Product.builder()
            .itemCode(itemCode)
            .name(request.getName())
            .description(request.getDescription())
            .unit(request.getUnit() != null ? request.getUnit() : "PCS")
            .gender(request.getGender())
            .ageGroup(request.getAgeGroup())
            .hsnCode(request.getHsnCode())
            .gstApplicable(request.getGstApplicable() != null ? request.getGstApplicable() : true)
            .imagePath(request.getImagePath())
            .build();

        setProductReferences(product, request);

        product = productRepository.save(product);

        if (request.getVariants() != null) {
            for (VariantRequest vr : request.getVariants()) {
                ProductVariant variant = buildVariant(product, vr);
                variant = productVariantRepository.save(variant);

                if (variant.getOpeningStock().compareTo(BigDecimal.ZERO) > 0) {
                    stockLedgerService.addEntry(
                        variant.getId(),
                        "OPENING_STOCK",
                        "PRODUCT_CREATION",
                        product.getId(),
                        variant.getOpeningStock(),
                        BigDecimal.ZERO,
                        null
                    );
                }
            }
        }

        return toFullDto(productRepository.findById(product.getId())
            .orElseThrow(() -> new EntityNotFoundException("Product not found")));
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnit(request.getUnit() != null ? request.getUnit() : "PCS");
        product.setGender(request.getGender());
        product.setAgeGroup(request.getAgeGroup());
        product.setHsnCode(request.getHsnCode());
        product.setGstApplicable(request.getGstApplicable() != null ? request.getGstApplicable() : true);
        product.setImagePath(request.getImagePath());

        setProductReferences(product, request);

        Set<Long> incomingVariantIds = new HashSet<>();
        if (request.getVariants() != null) {
            for (VariantRequest vr : request.getVariants()) {
                if (vr.getId() != null) {
                    incomingVariantIds.add(vr.getId());
                    ProductVariant existingVariant = productVariantRepository.findById(vr.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Variant not found with id: " + vr.getId()));

                    trackPriceChanges(existingVariant, vr);

                    existingVariant.setColor(vr.getColorId() != null
                        ? colorRepository.findById(vr.getColorId())
                            .orElseThrow(() -> new EntityNotFoundException("Color not found with id: " + vr.getColorId()))
                        : null);
                    existingVariant.setSize(vr.getSizeId() != null
                        ? sizeRepository.findById(vr.getSizeId())
                            .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + vr.getSizeId()))
                        : null);
                    existingVariant.setBarcode(vr.getBarcode());
                    existingVariant.setSku(vr.getSku());
                    existingVariant.setPurchasePrice(vr.getPurchasePrice() != null ? vr.getPurchasePrice() : BigDecimal.ZERO);
                    existingVariant.setLandingCost(vr.getLandingCost() != null ? vr.getLandingCost() : BigDecimal.ZERO);
                    existingVariant.setMrp(vr.getMrp() != null ? vr.getMrp() : BigDecimal.ZERO);
                    existingVariant.setSellingPrice(vr.getSellingPrice() != null ? vr.getSellingPrice() : BigDecimal.ZERO);
                    existingVariant.setWholesalePrice(vr.getWholesalePrice() != null ? vr.getWholesalePrice() : BigDecimal.ZERO);
                    existingVariant.setMinStock(vr.getMinStock() != null ? vr.getMinStock() : BigDecimal.ZERO);
                    existingVariant.setReorderLevel(vr.getReorderLevel() != null ? vr.getReorderLevel() : BigDecimal.ZERO);
                    if (vr.getStatus() != null) {
                        existingVariant.setStatus(vr.getStatus());
                    }
                    productVariantRepository.save(existingVariant);
                } else {
                    ProductVariant newVariant = buildVariant(product, vr);
                    productVariantRepository.save(newVariant);
                }
            }
        }

        List<ProductVariant> existingVariants = productVariantRepository.findByProductId(product.getId());
        for (ProductVariant existingVariant : existingVariants) {
            if (!incomingVariantIds.contains(existingVariant.getId())) {
                existingVariant.setStatus("INACTIVE");
                productVariantRepository.save(existingVariant);
            }
        }

        product = productRepository.save(product);
        return toFullDto(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        product.setStatus("INACTIVE");
        productRepository.save(product);
    }

    @Transactional
    public ProductDto toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        product.setStatus("ACTIVE".equals(product.getStatus()) ? "INACTIVE" : "ACTIVE");
        product = productRepository.save(product);
        return toFullDto(product);
    }

    @Transactional(readOnly = true)
    public List<VariantDto> getLowStockAlerts() {
        return productVariantRepository.findAll().stream()
            .filter(v -> "ACTIVE".equals(v.getStatus()))
            .filter(v -> v.getCurrentStock().compareTo(v.getMinStock()) <= 0)
            .map(this::toVariantDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<VariantDto> getReorderAlerts() {
        return productVariantRepository.findAll().stream()
            .filter(v -> "ACTIVE".equals(v.getStatus()))
            .filter(v -> v.getCurrentStock().compareTo(v.getReorderLevel()) <= 0
                && v.getCurrentStock().compareTo(v.getMinStock()) > 0)
            .map(this::toVariantDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<StockLedgerDto> getVariantLedger(Long variantId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return stockLedgerService.getLedgerByVariant(variantId, pageable);
    }

    @Transactional
    public ProductDto addImage(Long productId, String imageUrl, Integer displayOrder) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));

        ProductImage image = ProductImage.builder()
            .product(product)
            .imageUrl(imageUrl)
            .displayOrder(displayOrder != null ? displayOrder : product.getImages().size())
            .build();
        productImageRepository.save(image);
        return toFullDto(productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId)));
    }

    @Transactional
    public ProductDto removeImage(Long productId, Long imageId) {
        productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        ProductImage image = productImageRepository.findById(imageId)
            .orElseThrow(() -> new EntityNotFoundException("Image not found with id: " + imageId));
        productImageRepository.delete(image);
        return toFullDto(productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId)));
    }

    private void setProductReferences(Product product, ProductRequest request) {
        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + request.getCategoryId())));
        } else {
            product.setCategory(null);
        }
        if (request.getSubcategoryId() != null) {
            product.setSubcategory(categoryRepository.findById(request.getSubcategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Subcategory not found with id: " + request.getSubcategoryId())));
        } else {
            product.setSubcategory(null);
        }
        if (request.getBrandId() != null) {
            product.setBrand(brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + request.getBrandId())));
        } else {
            product.setBrand(null);
        }
        if (request.getManufacturerId() != null) {
            product.setManufacturer(manufacturerRepository.findById(request.getManufacturerId())
                .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found with id: " + request.getManufacturerId())));
        } else {
            product.setManufacturer(null);
        }
        if (request.getFabricId() != null) {
            product.setFabric(fabricRepository.findById(request.getFabricId())
                .orElseThrow(() -> new EntityNotFoundException("Fabric not found with id: " + request.getFabricId())));
        } else {
            product.setFabric(null);
        }
        if (request.getPatternId() != null) {
            product.setPattern(patternRepository.findById(request.getPatternId())
                .orElseThrow(() -> new EntityNotFoundException("Pattern not found with id: " + request.getPatternId())));
        } else {
            product.setPattern(null);
        }
        if (request.getTaxGroupId() != null) {
            product.setTaxGroup(taxGroupRepository.findById(request.getTaxGroupId())
                .orElseThrow(() -> new EntityNotFoundException("TaxGroup not found with id: " + request.getTaxGroupId())));
        } else {
            product.setTaxGroup(null);
        }
    }

    private ProductVariant buildVariant(Product product, VariantRequest vr) {
        String barcode = vr.getBarcode();
        if (barcode == null || barcode.isBlank()) {
            barcode = "BAR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        String sku = vr.getSku();
        if (sku == null || sku.isBlank()) {
            sku = "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        ProductVariant variant = ProductVariant.builder()
            .product(product)
            .barcode(barcode)
            .sku(sku)
            .purchasePrice(vr.getPurchasePrice() != null ? vr.getPurchasePrice() : BigDecimal.ZERO)
            .landingCost(vr.getLandingCost() != null ? vr.getLandingCost() : BigDecimal.ZERO)
            .mrp(vr.getMrp() != null ? vr.getMrp() : BigDecimal.ZERO)
            .sellingPrice(vr.getSellingPrice() != null ? vr.getSellingPrice() : BigDecimal.ZERO)
            .wholesalePrice(vr.getWholesalePrice() != null ? vr.getWholesalePrice() : BigDecimal.ZERO)
            .openingStock(vr.getOpeningStock() != null ? vr.getOpeningStock() : BigDecimal.ZERO)
            .currentStock(vr.getOpeningStock() != null ? vr.getOpeningStock() : BigDecimal.ZERO)
            .minStock(vr.getMinStock() != null ? vr.getMinStock() : BigDecimal.ZERO)
            .reorderLevel(vr.getReorderLevel() != null ? vr.getReorderLevel() : BigDecimal.ZERO)
            .build();

        if (vr.getColorId() != null) {
            variant.setColor(colorRepository.findById(vr.getColorId())
                .orElseThrow(() -> new EntityNotFoundException("Color not found with id: " + vr.getColorId())));
        }
        if (vr.getSizeId() != null) {
            variant.setSize(sizeRepository.findById(vr.getSizeId())
                .orElseThrow(() -> new EntityNotFoundException("Size not found with id: " + vr.getSizeId())));
        }
        return variant;
    }

    private void trackPriceChanges(ProductVariant variant, VariantRequest vr) {
        BigDecimal newPurchasePrice = vr.getPurchasePrice() != null ? vr.getPurchasePrice() : BigDecimal.ZERO;
        BigDecimal newSellingPrice = vr.getSellingPrice() != null ? vr.getSellingPrice() : BigDecimal.ZERO;
        BigDecimal newMrp = vr.getMrp() != null ? vr.getMrp() : BigDecimal.ZERO;

        boolean changed = !variant.getPurchasePrice().equals(newPurchasePrice)
            || !variant.getSellingPrice().equals(newSellingPrice)
            || !variant.getMrp().equals(newMrp);

        if (changed) {
            PriceChangeHistory history = PriceChangeHistory.builder()
                .variant(variant)
                .oldPurchasePrice(variant.getPurchasePrice())
                .newPurchasePrice(newPurchasePrice)
                .oldSellingPrice(variant.getSellingPrice())
                .newSellingPrice(newSellingPrice)
                .oldMrp(variant.getMrp())
                .newMrp(newMrp)
                .build();
            priceChangeHistoryRepository.save(history);
        }
    }

    private ProductListDto toListDto(Product product) {
        List<ProductVariant> variants = productVariantRepository.findByProductIdAndStatus(product.getId(), "ACTIVE");
        BigDecimal totalStock = variants.stream()
            .map(ProductVariant::getCurrentStock)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return ProductListDto.builder()
            .id(product.getId())
            .itemCode(product.getItemCode())
            .name(product.getName())
            .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
            .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
            .status(product.getStatus())
            .variantCount(variants.size())
            .totalStock(totalStock)
            .createdAt(product.getCreatedAt())
            .build();
    }

    private ProductDto toFullDto(Product product) {
        List<VariantDto> variantDtos = product.getVariants().stream()
            .map(this::toVariantDto)
            .toList();
        List<ProductImageDto> imageDtos = product.getImages().stream()
            .sorted(Comparator.comparing(ProductImage::getDisplayOrder))
            .map(this::toImageDto)
            .toList();
        return ProductDto.builder()
            .id(product.getId())
            .name(product.getName())
            .itemCode(product.getItemCode())
            .description(product.getDescription())
            .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
            .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
            .subcategoryId(product.getSubcategory() != null ? product.getSubcategory().getId() : null)
            .subcategoryName(product.getSubcategory() != null ? product.getSubcategory().getName() : null)
            .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
            .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
            .manufacturerId(product.getManufacturer() != null ? product.getManufacturer().getId() : null)
            .manufacturerName(product.getManufacturer() != null ? product.getManufacturer().getName() : null)
            .unit(product.getUnit())
            .fabricId(product.getFabric() != null ? product.getFabric().getId() : null)
            .fabricName(product.getFabric() != null ? product.getFabric().getName() : null)
            .patternId(product.getPattern() != null ? product.getPattern().getId() : null)
            .patternName(product.getPattern() != null ? product.getPattern().getName() : null)
            .gender(product.getGender())
            .ageGroup(product.getAgeGroup())
            .hsnCode(product.getHsnCode())
            .gstApplicable(product.getGstApplicable())
            .taxGroupId(product.getTaxGroup() != null ? product.getTaxGroup().getId() : null)
            .taxGroupName(product.getTaxGroup() != null ? product.getTaxGroup().getName() : null)
            .cgstPct(product.getTaxGroup() != null ? product.getTaxGroup().getCgstPct() : null)
            .sgstPct(product.getTaxGroup() != null ? product.getTaxGroup().getSgstPct() : null)
            .igstPct(product.getTaxGroup() != null ? product.getTaxGroup().getIgstPct() : null)
            .imagePath(product.getImagePath())
            .status(product.getStatus())
            .variants(variantDtos)
            .images(imageDtos)
            .build();
    }

    private ProductImageDto toImageDto(ProductImage image) {
        return ProductImageDto.builder()
            .id(image.getId())
            .imageUrl(image.getImageUrl())
            .displayOrder(image.getDisplayOrder())
            .createdAt(image.getCreatedAt())
            .build();
    }

    private VariantDto toVariantDto(ProductVariant variant) {
        return VariantDto.builder()
            .id(variant.getId())
            .productId(variant.getProduct().getId())
            .productName(variant.getProduct().getName())
            .colorId(variant.getColor() != null ? variant.getColor().getId() : null)
            .colorName(variant.getColor() != null ? variant.getColor().getName() : null)
            .colorHex(variant.getColor() != null ? variant.getColor().getHexCode() : null)
            .sizeId(variant.getSize() != null ? variant.getSize().getId() : null)
            .sizeName(variant.getSize() != null ? variant.getSize().getName() : null)
            .barcode(variant.getBarcode())
            .sku(variant.getSku())
            .purchasePrice(variant.getPurchasePrice())
            .landingCost(variant.getLandingCost())
            .mrp(variant.getMrp())
            .sellingPrice(variant.getSellingPrice())
            .wholesalePrice(variant.getWholesalePrice())
            .openingStock(variant.getOpeningStock())
            .currentStock(variant.getCurrentStock())
            .minStock(variant.getMinStock())
            .reorderLevel(variant.getReorderLevel())
            .status(variant.getStatus())
            .createdAt(variant.getCreatedAt())
            .updatedAt(variant.getUpdatedAt())
            .build();
    }
}
