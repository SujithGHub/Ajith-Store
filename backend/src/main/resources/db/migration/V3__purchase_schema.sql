-- Ajith Store - Supplier & Purchase Schema
-- V3: Suppliers, purchase orders, GRN, invoices, returns

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    contact_person    VARCHAR(255),
    mobile            VARCHAR(50),
    email             VARCHAR(255),
    address           TEXT,
    gst_number        VARCHAR(50),
    credit_terms      VARCHAR(255),
    opening_balance   DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_balance   DECIMAL(12,2) NOT NULL DEFAULT 0,
    status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supplier_name ON suppliers(name);
CREATE INDEX idx_supplier_status ON suppliers(status);

-- ============================================================
-- SUPPLIER TRANSACTIONS (Ledger)
-- ============================================================
CREATE TABLE supplier_transactions (
    id                BIGSERIAL PRIMARY KEY,
    supplier_id       BIGINT NOT NULL REFERENCES suppliers(id),
    transaction_type  VARCHAR(50) NOT NULL,
    amount            DECIMAL(12,2) NOT NULL,
    reference_type    VARCHAR(100),
    reference_id      BIGINT,
    notes             TEXT,
    transaction_date  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_st_supplier ON supplier_transactions(supplier_id);
CREATE INDEX idx_st_date ON supplier_transactions(transaction_date);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
    id                  BIGSERIAL PRIMARY KEY,
    order_number        VARCHAR(50) NOT NULL UNIQUE,
    supplier_id         BIGINT NOT NULL REFERENCES suppliers(id),
    order_date          DATE NOT NULL,
    expected_delivery   DATE,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(order_date);

-- ============================================================
-- PURCHASE ORDER ITEMS
-- ============================================================
CREATE TABLE purchase_order_items (
    id                BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    variant_id        BIGINT NOT NULL REFERENCES product_variants(id),
    quantity          DECIMAL(12,2) NOT NULL DEFAULT 1,
    unit_price        DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price       DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_poi_po ON purchase_order_items(purchase_order_id);

-- ============================================================
-- GOODS RECEIPT NOTES (GRN)
-- ============================================================
CREATE TABLE goods_receipt_notes (
    id                  BIGSERIAL PRIMARY KEY,
    grn_number          VARCHAR(50) NOT NULL UNIQUE,
    purchase_order_id   BIGINT REFERENCES purchase_orders(id),
    received_date       DATE NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes               TEXT,
    created_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GRN ITEMS
-- ============================================================
CREATE TABLE grn_items (
    id                BIGSERIAL PRIMARY KEY,
    grn_id            BIGINT NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    variant_id        BIGINT NOT NULL REFERENCES product_variants(id),
    ordered_qty       DECIMAL(12,2) NOT NULL DEFAULT 0,
    received_qty      DECIMAL(12,2) NOT NULL DEFAULT 0,
    accepted_qty      DECIMAL(12,2) NOT NULL DEFAULT 0,
    rejected_qty      DECIMAL(12,2) NOT NULL DEFAULT 0,
    rejection_reason  TEXT
);

CREATE INDEX idx_grni_grn ON grn_items(grn_id);

-- ============================================================
-- PURCHASE INVOICES
-- ============================================================
CREATE TABLE purchase_invoices (
    id                  BIGSERIAL PRIMARY KEY,
    invoice_number      VARCHAR(50) NOT NULL UNIQUE,
    supplier_id         BIGINT NOT NULL REFERENCES suppliers(id),
    purchase_order_id   BIGINT REFERENCES purchase_orders(id),
    invoice_date        DATE NOT NULL,
    due_date            DATE,
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount         DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes               TEXT,
    created_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pi_supplier ON purchase_invoices(supplier_id);
CREATE INDEX idx_pi_status ON purchase_invoices(status);

-- ============================================================
-- PURCHASE RETURNS
-- ============================================================
CREATE TABLE purchase_returns (
    id                    BIGSERIAL PRIMARY KEY,
    return_number         VARCHAR(50) NOT NULL UNIQUE,
    supplier_id           BIGINT NOT NULL REFERENCES suppliers(id),
    purchase_invoice_id   BIGINT REFERENCES purchase_invoices(id),
    return_date           DATE NOT NULL,
    reason                TEXT,
    subtotal              DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount            DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
    status                VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_by            BIGINT REFERENCES users(id),
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pr_supplier ON purchase_returns(supplier_id);

-- ============================================================
-- PURCHASE RETURN ITEMS
-- ============================================================
CREATE TABLE purchase_return_items (
    id                  BIGSERIAL PRIMARY KEY,
    purchase_return_id  BIGINT NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    variant_id          BIGINT NOT NULL REFERENCES product_variants(id),
    quantity            DECIMAL(12,2) NOT NULL,
    unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0,
    reason              TEXT
);

CREATE INDEX idx_pri_return ON purchase_return_items(purchase_return_id);
