-- Ajith Store - Product & Inventory Schema
-- V2: Categories, brands, manufacturers, products, variants

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
    fabric          VARCHAR(255),
    pattern         VARCHAR(255),
    gender          VARCHAR(50),
    age_group       VARCHAR(100),
    hsn_code        VARCHAR(20),
    gst_applicable  BOOLEAN NOT NULL DEFAULT TRUE,
    cgst_pct        DECIMAL(5,2) DEFAULT 0,
    sgst_pct        DECIMAL(5,2) DEFAULT 0,
    igst_pct        DECIMAL(5,2) DEFAULT 0,
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

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE TABLE product_variants (
    id                BIGSERIAL PRIMARY KEY,
    product_id        BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color             VARCHAR(100),
    size              VARCHAR(100),
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
