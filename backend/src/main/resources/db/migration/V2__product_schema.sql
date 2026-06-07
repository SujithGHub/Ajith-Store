-- Ajith Store - Product & Inventory Schema
-- V2: Categories, brands, manufacturers, products, variants, master tables

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    parent_id       BIGINT REFERENCES categories(id),
    image_path      VARCHAR(500),
    sort_order      INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cat_parent ON categories(parent_id);
CREATE INDEX idx_cat_status ON categories(status);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE brands (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    image_path      VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MANUFACTURERS
-- ============================================================
CREATE TABLE manufacturers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    mobile          VARCHAR(50),
    email           VARCHAR(255),
    address         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COLORS
-- ============================================================
CREATE TABLE colors (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    hex_code        VARCHAR(7),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SIZES
-- ============================================================
CREATE TABLE sizes (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    display_order   INT NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FABRICS
-- ============================================================
CREATE TABLE fabrics (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PATTERNS
-- ============================================================
CREATE TABLE patterns (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TAX GROUPS
-- ============================================================
CREATE TABLE tax_groups (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    cgst_pct        DECIMAL(5,2) NOT NULL DEFAULT 0,
    sgst_pct        DECIMAL(5,2) NOT NULL DEFAULT 0,
    igst_pct        DECIMAL(5,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    item_code       VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    category_id     BIGINT REFERENCES categories(id),
    subcategory_id  BIGINT REFERENCES categories(id),
    brand_id        BIGINT REFERENCES brands(id),
    manufacturer_id BIGINT REFERENCES manufacturers(id),
    unit            VARCHAR(50) NOT NULL DEFAULT 'PCS',
    fabric_id       BIGINT REFERENCES fabrics(id),
    pattern_id      BIGINT REFERENCES patterns(id),
    gender          VARCHAR(50),
    age_group       VARCHAR(100),
    hsn_code        VARCHAR(20),
    gst_applicable  BOOLEAN NOT NULL DEFAULT TRUE,
    tax_group_id    BIGINT REFERENCES tax_groups(id),
    image_path      VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prod_category ON products(category_id);
CREATE INDEX idx_prod_brand ON products(brand_id);
CREATE INDEX idx_prod_status ON products(status);
CREATE INDEX idx_prod_name ON products(name);
CREATE INDEX idx_prod_item_code ON products(item_code);
CREATE INDEX idx_prod_tax_group ON products(tax_group_id);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE TABLE product_variants (
    id                BIGSERIAL PRIMARY KEY,
    product_id        BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id          BIGINT REFERENCES colors(id),
    size_id           BIGINT REFERENCES sizes(id),
    barcode           VARCHAR(100) NOT NULL UNIQUE,
    sku               VARCHAR(100) NOT NULL UNIQUE,
    purchase_price    DECIMAL(12,2) NOT NULL DEFAULT 0,
    landing_cost      DECIMAL(12,2) NOT NULL DEFAULT 0,
    mrp               DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price     DECIMAL(12,2) NOT NULL DEFAULT 0,
    wholesale_price   DECIMAL(12,2) NOT NULL DEFAULT 0,
    opening_stock     DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_stock     DECIMAL(12,2) NOT NULL DEFAULT 0,
    min_stock         DECIMAL(12,2) NOT NULL DEFAULT 0,
    reorder_level     DECIMAL(12,2) NOT NULL DEFAULT 0,
    version           BIGINT NOT NULL DEFAULT 0,
    status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pv_product ON product_variants(product_id);
CREATE INDEX idx_pv_barcode ON product_variants(barcode);
CREATE INDEX idx_pv_sku ON product_variants(sku);
CREATE INDEX idx_pv_stock ON product_variants(current_stock);
CREATE INDEX idx_pv_color ON product_variants(color_id);
CREATE INDEX idx_pv_size ON product_variants(size_id);
