-- Ajith Store - Customer & Sales Schema
-- V4: Customers, sales, payments, returns, expenses, stock adjustments

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
    id                BIGSERIAL PRIMARY KEY,
    customer_code     VARCHAR(50) NOT NULL UNIQUE,
    name              VARCHAR(255) NOT NULL,
    mobile            VARCHAR(50),
    email             VARCHAR(255),
    address           TEXT,
    gst_number        VARCHAR(50),
    credit_limit      DECIMAL(12,2) NOT NULL DEFAULT 0,
    opening_balance   DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_balance   DECIMAL(12,2) NOT NULL DEFAULT 0,
    loyalty_points    DECIMAL(12,2) NOT NULL DEFAULT 0,
    membership_level  VARCHAR(50) NOT NULL DEFAULT 'REGULAR',
    status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cust_name ON customers(name);
CREATE INDEX idx_cust_mobile ON customers(mobile);
CREATE INDEX idx_cust_status ON customers(status);

-- ============================================================
-- CUSTOMER TRANSACTIONS (Ledger)
-- ============================================================
CREATE TABLE customer_transactions (
    id                BIGSERIAL PRIMARY KEY,
    customer_id       BIGINT NOT NULL REFERENCES customers(id),
    transaction_type  VARCHAR(50) NOT NULL,
    amount            DECIMAL(12,2) NOT NULL,
    reference_type    VARCHAR(100),
    reference_id      BIGINT,
    notes             TEXT,
    transaction_date  TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ct_customer ON customer_transactions(customer_id);
CREATE INDEX idx_ct_date ON customer_transactions(transaction_date);

-- ============================================================
-- SALES
-- ============================================================
CREATE TABLE sales (
    id                BIGSERIAL PRIMARY KEY,
    invoice_number    VARCHAR(50) NOT NULL UNIQUE,
    customer_id       BIGINT REFERENCES customers(id),
    sale_date         TIMESTAMP NOT NULL DEFAULT NOW(),
    subtotal          DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    round_off         DECIMAL(12,2) NOT NULL DEFAULT 0,
    coupon_code       VARCHAR(100),
    coupon_discount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_status    VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes             TEXT,
    created_by        BIGINT REFERENCES users(id),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sale_customer ON sales(customer_id);
CREATE INDEX idx_sale_date ON sales(sale_date);
CREATE INDEX idx_sale_status ON sales(payment_status);
CREATE INDEX idx_sale_invoice ON sales(invoice_number);
CREATE INDEX idx_sale_created_by ON sales(created_by);

-- ============================================================
-- SALE ITEMS
-- ============================================================
CREATE TABLE sale_items (
    id                BIGSERIAL PRIMARY KEY,
    sale_id           BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    variant_id        BIGINT NOT NULL REFERENCES product_variants(id),
    quantity          DECIMAL(12,2) NOT NULL DEFAULT 1,
    unit_price        DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_price       DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_si_sale ON sale_items(sale_id);
CREATE INDEX idx_si_variant ON sale_items(variant_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id                BIGSERIAL PRIMARY KEY,
    sale_id           BIGINT NOT NULL REFERENCES sales(id),
    payment_mode      VARCHAR(50) NOT NULL,
    amount            DECIMAL(12,2) NOT NULL,
    reference_number  VARCHAR(255),
    payment_date      TIMESTAMP NOT NULL DEFAULT NOW(),
    notes             TEXT
);

CREATE INDEX idx_payment_sale ON payments(sale_id);

-- ============================================================
-- SALES RETURNS
-- ============================================================
CREATE TABLE sales_returns (
    id                BIGSERIAL PRIMARY KEY,
    return_number     VARCHAR(50) NOT NULL UNIQUE,
    sale_id           BIGINT NOT NULL REFERENCES sales(id),
    return_date       TIMESTAMP NOT NULL DEFAULT NOW(),
    reason            TEXT,
    subtotal          DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    refund_amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
    status            VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_by        BIGINT REFERENCES users(id),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sr_sale ON sales_returns(sale_id);

-- ============================================================
-- SALES RETURN ITEMS
-- ============================================================
CREATE TABLE sales_return_items (
    id                  BIGSERIAL PRIMARY KEY,
    sales_return_id     BIGINT NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
    variant_id          BIGINT NOT NULL REFERENCES product_variants(id),
    quantity            DECIMAL(12,2) NOT NULL,
    unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0,
    reason              TEXT
);

CREATE INDEX idx_sri_return ON sales_return_items(sales_return_id);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE expenses (
    id                BIGSERIAL PRIMARY KEY,
    expense_number    VARCHAR(50) NOT NULL UNIQUE,
    category          VARCHAR(100) NOT NULL,
    amount            DECIMAL(12,2) NOT NULL,
    description       TEXT,
    expense_date      DATE NOT NULL,
    payment_mode      VARCHAR(50),
    notes             TEXT,
    created_by        BIGINT REFERENCES users(id),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expense_date ON expenses(expense_date);
CREATE INDEX idx_expense_category ON expenses(category);

-- ============================================================
-- STOCK ADJUSTMENTS
-- ============================================================
CREATE TABLE stock_adjustments (
    id                BIGSERIAL PRIMARY KEY,
    adjustment_number VARCHAR(50) NOT NULL UNIQUE,
    adjustment_type   VARCHAR(50) NOT NULL,
    reason            TEXT,
    notes             TEXT,
    created_by        BIGINT REFERENCES users(id),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STOCK ADJUSTMENT ITEMS
-- ============================================================
CREATE TABLE stock_adjustment_items (
    id                  BIGSERIAL PRIMARY KEY,
    stock_adjustment_id BIGINT NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    variant_id          BIGINT NOT NULL REFERENCES product_variants(id),
    quantity            DECIMAL(12,2) NOT NULL,
    unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0,
    reason              TEXT
);

CREATE INDEX idx_sai_adjustment ON stock_adjustment_items(stock_adjustment_id);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE coupons (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(100) NOT NULL UNIQUE,
    discount_type       VARCHAR(50) NOT NULL,
    discount_value      DECIMAL(12,2) NOT NULL,
    min_purchase_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    max_discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    usage_limit         INT NOT NULL DEFAULT 0,
    used_count          INT NOT NULL DEFAULT 0,
    valid_from          DATE NOT NULL,
    valid_to            DATE NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOYALTY SETTINGS
-- ============================================================
CREATE TABLE loyalty_settings (
    id                    BIGSERIAL PRIMARY KEY,
    points_per_rupee      DECIMAL(12,2) NOT NULL DEFAULT 1,
    redemption_rate       DECIMAL(12,2) NOT NULL DEFAULT 1,
    min_redemption_points DECIMAL(12,2) NOT NULL DEFAULT 100,
    max_redemption_pct    DECIMAL(5,2) NOT NULL DEFAULT 50,
    enabled               BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);
