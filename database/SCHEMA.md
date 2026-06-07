# Ajith Store — Database Schema

## Tables Overview

| Table | Purpose |
|-------|---------|
| store_config | Store information & settings |
| users | System users (auth) |
| role_permissions | RBAC rules |
| audit_logs | Activity tracking |
| categories | Product categories (self-referencing for subcategories) |
| brands | Product brands |
| manufacturers | Manufacturers |
| products | Product master |
| product_variants | Variant-level inventory (color+size) |
| suppliers | Supplier master |
| supplier_transactions | Supplier ledger |
| purchase_orders | Purchase orders |
| purchase_order_items | PO line items |
| goods_receipt_notes | GRN records |
| grn_items | GRN line items |
| purchase_invoices | Supplier invoices |
| purchase_returns | Purchase returns |
| purchase_return_items | Return line items |
| customers | Customer master |
| customer_transactions | Customer ledger |
| sales | Sales invoices |
| sale_items | Sale line items |
| payments | Payment records |
| sales_returns | Sales returns |
| sales_return_items | Return line items |
| expenses | Expense records |
| stock_adjustments | Stock adjustments |
| stock_adjustment_items | Adjustment line items |
| coupons | Discount coupons |
| loyalty_settings | Loyalty program configuration |

## Index Strategy

| Table | Indexes |
|-------|---------|
| users | store_id, role, username |
| audit_logs | user_id, (entity_type, entity_id), created_at |
| categories | parent_id, status |
| products | category_id, brand_id, status, name, item_code |
| product_variants | product_id, barcode (unique), sku (unique), current_stock |
| suppliers | name, status |
| supplier_transactions | supplier_id, transaction_date |
| purchase_orders | supplier_id, status, order_date |
| purchase_invoices | supplier_id, status |
| sales | customer_id, sale_date, payment_status, invoice_number, created_by |
| sale_items | sale_id, variant_id |
| customers | name, mobile, status |
| customer_transactions | customer_id, transaction_date |
| expenses | expense_date, category |

## Sequences

| Sequence | Start | Purpose |
|----------|-------|---------|
| seq_invoice_no | 1001 | Sales invoice numbers |
| seq_purchase_order_no | 1001 | Purchase order numbers |
| seq_grn_no | 1001 | GRN numbers |
| seq_purchase_invoice_no | 1001 | Purchase invoice numbers |
| seq_return_no | 1001 | Return numbers |
| seq_expense_no | 1 | Expense numbers |
| seq_adjustment_no | 1 | Adjustment numbers |
| seq_customer_code | 1001 | Customer codes |
