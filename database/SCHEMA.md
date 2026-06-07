# Ajith Store — Database Schema

## Tables Overview (41 tables)

| Table | Purpose |
|-------|---------|
| store_config | Store information & settings |
| users | System users (auth) |
| role_permissions | RBAC rules |
| audit_logs | Activity tracking |
| **Master Tables** | |
| categories | Product categories (self-referencing for subcategories) |
| brands | Brand master |
| manufacturers | Manufacturer master |
| colors | Color master (with hex codes) |
| sizes | Size master (with display order) |
| fabrics | Fabric master |
| patterns | Pattern master |
| tax_groups | Tax group master (CGST/SGST/IGST) |
| expense_categories | Expense category master |
| coupons | Discount coupons |
| loyalty_settings | Loyalty program configuration |
| **Product Tables** | |
| products | Product master |
| product_variants | Variant-level inventory (links to colors, sizes) |
| product_images | Multiple images per product |
| price_change_history | Audit trail for price changes |
| **Inventory Tables** | |
| stock_ledger | **Mandatory** — every inventory movement recorded here |
| stock_adjustments | Stock adjustments header |
| stock_adjustment_items | Adjustment line items |
| **Supplier & Purchase Tables** | |
| suppliers | Supplier master |
| supplier_transactions | Supplier ledger |
| purchase_orders | Purchase orders |
| purchase_order_items | PO line items |
| goods_receipt_notes | GRN records |
| grn_items | GRN line items |
| purchase_invoices | Supplier invoices |
| purchase_returns | Purchase returns |
| purchase_return_items | Return line items |
| **Customer & Sales Tables** | |
| customers | Customer master |
| customer_transactions | Customer ledger |
| loyalty_transactions | Loyalty points earned/redeemed |
| sales | Sales invoices |
| sale_items | Sale line items |
| payments | Split payments per sale |
| sales_returns | Sales returns |
| sales_return_items | Return line items |
| draft_sales | Hold bills (draft billing) |
| draft_sale_items | Draft bill line items |
| **Financial Tables** | |
| expenses | Expense records (linked to expense_categories) |
| day_closing | Daily cash closing records |
| **System Tables** | |
| notifications | System alerts (low stock, pending payments, etc.) |
| audit_logs | Complete audit history |

## Index Strategy

| Table | Indexes |
|-------|---------|
| users | store_id, role, username |
| audit_logs | user_id, (entity_type, entity_id), created_at |
| categories | parent_id, status |
| products | category_id, brand_id, status, name, item_code, tax_group_id |
| product_variants | product_id, barcode (unique), sku (unique), current_stock, color_id, size_id |
| product_images | product_id |
| price_change_history | variant_id, changed_at |
| stock_ledger | variant_id, transaction_type, (reference_type, reference_id), created_at |
| suppliers | name, status |
| supplier_transactions | supplier_id, transaction_date |
| purchase_orders | supplier_id, status, order_date |
| purchase_invoices | supplier_id, status |
| sales | customer_id, sale_date, payment_status, invoice_number, created_by |
| sale_items | sale_id, variant_id |
| customers | name, mobile, status |
| customer_transactions | customer_id, transaction_date |
| loyalty_transactions | customer_id, transaction_type |
| draft_sales | status, created_by |
| notifications | is_read, type, created_at |
| expenses | expense_date, category, expense_category_id |

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
| seq_draft_no | 1 | Draft sale numbers |

## Key Relationships

- Products → Categories (1:N), Brands (1:N), Tax Groups (1:N), Fabrics (1:N), Patterns (1:N)
- Product Variants → Colors (1:N), Sizes (1:N), Products (1:N)
- Every stock movement → Stock Ledger entry (mandatory)
- Sales → Split Payments (1:N)
- Products → Multiple Images (1:N)
- Prices → Price Change History (1:N)
- Draft Sales → Items (1:N)
- Expenses → Expense Categories (N:1)
