# Ajith Store — Database Schema

## Overview
- **Total tables:** 48
- **Sequences:** 9
- **Database:** PostgreSQL 16
- **Migration tool:** Flyway 10

---

## Module Map

| # | Module | Tables | Lines of SQL |
|---|--------|--------|-------------|
| 1 | Core & Auth | 4 | V1 |
| 2 | Product Masters | 8 | V2 |
| 3 | Products & Variants | 4 | V2 |
| 4 | Suppliers & Purchases | 10 | V3 |
| 5 | Customers & Sales | 10 | V4 |
| 6 | Salespersons | 2 | V7 |
| 7 | Financial | 3 | V4, V6 |
| 8 | Promotions | 2 | V4 |
| 9 | Notifications | 1 | V6 |
| 10 | Inventory | 3 | V2, V4, V6 |
| **Total** | | **48** | **V1–V7** |

---

## Table Definitions

### V1 — Core Schema

| Table | Columns | Purpose |
|-------|---------|---------|
| `store_config` | id, store_name, address, phone, email, gst_number, logo_path, invoice_header/footer, currency, financial_year_start/end, tax_enabled, round_off_enabled | Store settings |
| `users` | id, store_id(FK), username(UQ), password_hash, full_name, email, phone, role, enabled, last_login_at/ip | System users |
| `role_permissions` | id, role, module, feature, can_create/read/update/delete | RBAC rules |
| `audit_logs` | id, user_id(FK), username, action, entity_type, entity_id, details, ip_address | Activity audit |

### V2 — Product Schema

| Table | Columns | Purpose |
|-------|---------|---------|
| `categories` | id, name, parent_id(FK-self), image_path, sort_order, status | Product categories (self-referencing) |
| `brands` | id, name, description, image_path, status | Brand master |
| `manufacturers` | id, name, contact_person, mobile, email, address, status | Manufacturer master |
| `colors` | id, name, hex_code, status | Color master |
| `sizes` | id, name, display_order, status | Size master |
| `fabrics` | id, name, description, status | Fabric master |
| `patterns` | id, name, description, status | Pattern master |
| `tax_groups` | id, name, cgst_pct, sgst_pct, igst_pct, status | Tax group master |
| `products` | id, item_code(UQ), name, category_id(FK), subcategory_id(FK), brand_id(FK), manufacturer_id(FK), fabric_id(FK), pattern_id(FK), unit, gender, age_group, hsn_code, gst_applicable, tax_group_id(FK), image_path, status | Product master — links to masters |
| `product_variants` | id, product_id(FK), color_id(FK), size_id(FK), barcode(UQ), sku(UQ), purchase_price, landing_cost, mrp, selling_price, wholesale_price, opening_stock, current_stock, min_stock, reorder_level, version, status | Variant-level inventory with optimistic locking |

### V3 — Purchase Schema

| Table | Columns | Purpose |
|-------|---------|---------|
| `suppliers` | id, name, contact_person, mobile, email, address, gst_number, credit_terms, opening_balance, current_balance, status | Supplier master |
| `supplier_transactions` | id, supplier_id(FK), transaction_type, amount, reference_type, reference_id, notes | Supplier ledger |
| `purchase_orders` | id, order_number(UQ), supplier_id(FK), order_date, expected_delivery, status, subtotal, discount_amount, tax_amount, total_amount, created_by(FK) | Purchase orders |
| `purchase_order_items` | id, purchase_order_id(FK), variant_id(FK), quantity, unit_price, discount_amount, tax_amount, total_price | PO line items |
| `goods_receipt_notes` | id, grn_number(UQ), purchase_order_id(FK), received_date, status, created_by(FK) | Goods receipt notes |
| `grn_items` | id, grn_id(FK), variant_id(FK), ordered_qty, received_qty, accepted_qty, rejected_qty, rejection_reason | GRN line items |
| `purchase_invoices` | id, invoice_number(UQ), supplier_id(FK), purchase_order_id(FK), invoice_date, due_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, balance_amount, status, created_by(FK) | Supplier invoices |
| `purchase_returns` | id, return_number(UQ), supplier_id(FK), purchase_invoice_id(FK), return_date, reason, subtotal, tax_amount, total_amount, status, created_by(FK) | Purchase returns |
| `purchase_return_items` | id, purchase_return_id(FK), variant_id(FK), quantity, unit_price, reason | Return line items |

### V4 — Sales Schema

| Table | Columns | Purpose |
|-------|---------|---------|
| `customers` | id, customer_code(UQ), name, mobile, email, address, gst_number, credit_limit, opening_balance, current_balance, loyalty_points, membership_level, status | Customer master |
| `customer_transactions` | id, customer_id(FK), transaction_type, amount, reference_type, reference_id, notes | Customer ledger |
| `sales` | id, invoice_number(UQ), customer_id(FK), sale_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, balance_amount, round_off, coupon_code, coupon_discount, payment_status, created_by(FK) | Sales invoices |
| `sale_items` | id, sale_id(FK), variant_id(FK), quantity, unit_price, discount_amount, tax_amount, total_price | Sale line items |
| `payments` | id, sale_id(FK), payment_mode, amount, reference_number, payment_date | Split payments |
| `sales_returns` | id, return_number(UQ), sale_id(FK), return_date, reason, subtotal, tax_amount, total_amount, refund_amount, status, created_by(FK) | Sales returns |
| `sales_return_items` | id, sales_return_id(FK), variant_id(FK), quantity, unit_price, reason | Return line items |
| `expenses` | id, expense_number(UQ), category, amount, description, expense_date, payment_mode, created_by(FK) | Expense records |
| `stock_adjustments` | id, adjustment_number(UQ), adjustment_type, reason, created_by(FK) | Stock adjustments header |
| `stock_adjustment_items` | id, stock_adjustment_id(FK), variant_id(FK), quantity, unit_price, reason | Adjustment line items |
| `coupons` | id, code(UQ), discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, used_count, valid_from/to, status | Discount coupons |
| `loyalty_settings` | id, points_per_rupee, redemption_rate, min_redemption_points, max_redemption_pct, enabled | Loyalty config |

### V6 — Enhancements

| Table | Columns | Purpose |
|-------|---------|---------|
| `expense_categories` | id, name, description, status | Expense category master |
| `stock_ledger` | id, variant_id(FK), transaction_type, reference_type, reference_id, qty_in, qty_out, running_balance, created_by(FK) | **Mandatory** — every inventory movement |
| `price_change_history` | id, variant_id(FK), old/new_purchase_price, old/new_selling_price, old/new_mrp, changed_by(FK), reason | Audit trail for price changes |
| `product_images` | id, product_id(FK), image_url, display_order | Multiple images per product |
| `draft_sales` | id, draft_number(UQ), customer_id(FK), notes, status, created_by(FK) | Hold bills |
| `draft_sale_items` | id, draft_id(FK), variant_id(FK), quantity, unit_price, discount_amount | Draft bill line items |
| `day_closing` | id, closing_date(UQ), opening_cash, cash_sales, upi_sales, card_sales, credit_sales, total_sales, expenses_total, closing_cash, expected_cash, difference, closed_by(FK) | Daily cash closing |
| `notifications` | id, type, title, message, reference_type, reference_id, is_read | In-app alerts |
| `loyalty_transactions` | id, customer_id(FK), transaction_type, points, reference_type, reference_id, notes | Loyalty points earned/redeemed |

### V7 — Salesperson Tracking

| Table | Columns | Purpose |
|-------|---------|---------|
| `salespersons` | id, name, phone, email, employee_code(UQ), commission_pct, status | Salesperson master |

### Schema Changes to Existing Tables

| Table | Added Column | Source |
|-------|-------------|--------|
| `expenses` | `expense_category_id(FK)` | V6 |
| `sales` | `salesperson_id(FK)` | V7 |

---

## Sequences

| Sequence | Start | Used By |
|----------|-------|---------|
| `seq_invoice_no` | 1001 | `sales.invoice_number` |
| `seq_purchase_order_no` | 1001 | `purchase_orders.order_number` |
| `seq_grn_no` | 1001 | `goods_receipt_notes.grn_number` |
| `seq_purchase_invoice_no` | 1001 | `purchase_invoices.invoice_number` |
| `seq_return_no` | 1001 | `sales_returns.return_number` |
| `seq_expense_no` | 1 | `expenses.expense_number` |
| `seq_adjustment_no` | 1 | `stock_adjustments.adjustment_number` |
| `seq_customer_code` | 1001 | `customers.customer_code` |
| `seq_draft_no` | 1 | `draft_sales.draft_number` |

---

## Index Strategy

| Table | Indexes |
|-------|---------|
| users | store_id, role, username |
| audit_logs | user_id, (entity_type, entity_id), created_at |
| categories | parent_id, status |
| products | category_id, brand_id, status, name, item_code, tax_group_id |
| product_variants | product_id, barcode(UQ), sku(UQ), current_stock, color_id, size_id |
| products_images | product_id |
| price_change_history | variant_id, changed_at |
| stock_ledger | variant_id, transaction_type, (reference_type, reference_id), created_at |
| suppliers | name, status |
| supplier_transactions | supplier_id, transaction_date |
| purchase_orders | supplier_id, status, order_date |
| purchase_invoices | supplier_id, status |
| sales | customer_id, sale_date, payment_status, invoice_number, created_by, salesperson_id |
| sale_items | sale_id, variant_id |
| customers | name, mobile, status |
| customer_transactions | customer_id, transaction_date |
| loyalty_transactions | customer_id, transaction_type |
| draft_sales | status, created_by |
| notifications | is_read, type, created_at |
| expenses | expense_date, expense_category_id |
| salespersons | status |

---

## Key Relationships

- Products → Categories(N:1), Brands(N:1), TaxGroups(N:1), Fabrics(N:1), Patterns(N:1)
- ProductVariants → Colors(N:1), Sizes(N:1), Products(N:1)
- Every stock movement → StockLedger entry (mandatory, no exceptions)
- Current stock on variant is a cached value; stock_ledger is the source of truth
- Sales → Payments (1:N, split payments)
- Products → ProductImages (1:N)
- Prices → PriceChangeHistory (1:N)
- DraftSales → DraftSaleItems (1:N)
- Expenses → ExpenseCategories (N:1)
- Sales → Salespersons (N:1)
- PurchaseOrder → GoodsReceiptNotes (1:0..1, partial receipt supported)
- PurchaseOrder → PurchaseInvoices (1:N, partial invoicing supported)
