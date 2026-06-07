# Ajith Store — Entity Relationship Diagram

```
MODULE 1: CORE ──────────────────────────────────────────────────────
┌──────────────────────────────┐
│        STORE_CONFIG          │
│ id (PK) │ name │ address     │
│ phone │ email │ gst │ logo   │
│ currency │ financial_year    │
│ tax_enabled │ round_off      │
└──────────┬───────────────────┘
           │ 1
           │ has
           │ N
┌─────────────────────────────────────────────────────────────────────┐
│  USERS                            │  ROLE_PERMISSIONS               │
│  id (PK) │ store_id (FK)          │  id (PK) │ role │ module        │
│  username │ password │ role        │  feature │ crud flags          │
│  enabled │ last_login             │  UNIQUE(role, module, feature)  │
└──────────┬────────────────────────┴─────────────────────────────────┘
           │ 1
           │ creates
           │ N
┌─────────────────────────────────────────────────────────────────────┐
│  AUDIT_LOGS                                                        │
│  id (PK) │ user_id (FK) │ action │ entity_type │ entity_id          │
│  details │ ip_address │ created_at                                   │
└─────────────────────────────────────────────────────────────────────┘

MODULE 2: PRODUCT MASTERS ───────────────────────────────────────────
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   COLORS     │ │    SIZES     │ │   FABRICS    │ │   PATTERNS   │
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ name         │ │ name         │ │ name         │ │ name         │
│ hex_code     │ │ display_order│ │ description  │ │ description  │
│ status       │ │ status       │ │ status       │ │ status       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  BRANDS      │ │MANUFACTURERS │ │ CATEGORIES   │ │  TAX_GROUPS  │
│ id (PK)      │ │ id (PK)      │ │ id (PK)      │ │ id (PK)      │
│ name         │ │ name         │ │ name         │ │ name         │
│ description  │ │ contact      │ │ parent_id(FK)│ │ cgst │ sgst  │
│ status       │ │ status       │ │ status       │ │ igst │ status│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

MODULE 3: PRODUCTS & INVENTORY ──────────────────────────────────────
                    ┌──────────────────────┐
                    │      PRODUCTS         │
                    │ id (PK) │ item_code   │
                    │ name │ description    │
                    │ category_id (FK)      │
                    │ brand_id (FK)         │
                    │ fabric_id (FK)        │
                    │ pattern_id (FK)       │
                    │ tax_group_id (FK)     │
                    │ hsn_code │ gender     │
                    │ status                │
                    └──────────┬───────────┘
                               │ 1
                               │ has
                               │ N
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          N                    N                    N
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ PRODUCT_IMAGES  │  │PRODUCT_VARIANTS   │  │ PRICE_CHANGE_   │
│ id (PK)         │  │ id (PK)           │  │ HISTORY          │
│ product_id (FK) │  │ product_id (FK)   │  │ id (PK)          │
│ image_url       │  │ color_id (FK)     │  │ variant_id (FK)  │
│ display_order   │  │ size_id (FK)      │  │ old/new_prices   │
└─────────────────┘  │ barcode (UQ)      │  │ changed_by (FK)  │
                     │ sku (UQ)          │  │ reason           │
                     │ prices (5 cols)   │  └─────────────────┘
                     │ current_stock     │
                     │ min_stock         │        STOCK LEDGER
                     │ reorder_level     │  ┌──────────────────────┐
                     │ version (lock)    │  │ variant_id (FK)      │
                     └────────┬──────────┘  │ transaction_type     │
                              │ 1           │ qty_in │ qty_out     │
                              │ has         │ running_balance      │
                              │ N           │ reference_type/id    │
              ┌───────────────┼───────────┐ └──────────────────────┘
              │               │           │
              N               N           N
┌─────────────────┐ ┌─────────────────┐ ┌──────────────────────┐
│ STOCK_ADJUSTMENT │ │  SALE_ITEMS    │ │ PURCHASE_ORDER_ITEMS │
│ _ITEMS           │ │ variant_id(FK) │ │ variant_id (FK)      │
│ variant_id (FK)  │ │ quantity       │ │ quantity │ unit_price │
│ quantity         │ │ unit_price     │ │ discount │ tax_amount │
│ reason           │ │ discount │ tax  │ └──────────────────────┘
└─────────────────┘ └─────────────────┘

MODULE 4: SUPPLIERS & PURCHASES ─────────────────────────────────────
┌──────────────────────────┐
│        SUPPLIERS          │
│ id (PK) │ name            │
│ contact_person │ mobile   │
│ gst_number │ credit_terms │
│ current_balance           │
│ status                    │
└──────┬───────────────────┘
       │ 1
       │ has
       │ N
┌─────────────────────────────────────────────────────────────────────┐
│ SUPPLIER_TRANS    │ PURCHASE_ORDERS    │ PURCHASE_INVOICES         │
│ supplier_id (FK)  │ id (PK)            │ id (PK)                   │
│ transaction_type  │ order_number (UQ)  │ invoice_number (UQ)       │
│ amount            │ supplier_id (FK)   │ supplier_id (FK)          │
│ reference         │ order_date         │ invoice_date              │
└───────────────────│ status             │ due_date                  │
                    │ total_amount       │ total │ paid │ balance    │
                    │ created_by (FK)    │ status                    │
                    └──────┬────────────┘ └──────────────────────────┘
                           │ 1                          │ 1
                           │ has                        │ has
                           │ N                          │ N
                    ┌──────────────┐          ┌──────────────────┐
                    │ GOOGS_RECEIPT│          │ PURCHASE_RETURNS │
                    │ _NOTES (GRN) │          │ return_number(UQ)│
                    │ id (PK)      │          │ supplier_id (FK) │
                    │ grn_number   │          │ return_date      │
                    │ po_id (FK)   │          │ amount           │
                    │ received_date│          └──────────────────┘
                    │ status       │
                    └──────────────┘

MODULE 5: CUSTOMERS & SALES ─────────────────────────────────────────
┌──────────────────────────┐
│        CUSTOMERS          │
│ id (PK) │ customer_code   │
│ name │ mobile │ email     │
│ gst_number │ credit_limit │
│ current_balance           │
│ loyalty_points            │
│ membership_level          │
│ status                    │
└──────┬───────────────────┘
       │ 1
       │ has
       │ N
┌─────────────────────────────────────────────────────────────────────┐
│ CUSTOMER_TRANS │ LOYALTY_TRANS    │         SALES                  │
│ customer_id(FK) │ customer_id(FK) │ id (PK) │ invoice_number (UQ) │
│ transaction_type│ transaction_type│ customer_id (FK)              │
│ amount          │ points          │ sale_date                     │
│ reference       │ reference       │ subtotal │ discount │ tax     │
└─────────────────┘ reference       │ total │ paid │ balance        │
                  └─────────────────│ round_off │ coupon_discount   │
                                    │ payment_status                │
                                    │ salesperson_id (FK)           │
                                    │ created_by (FK)               │
                                    └──────┬───────────────────────┘
                                           │ 1
                                     ┌─────┼──────────┐
                                     │     │          │
                                     N     N          N
┌─────────────────┐ ┌─────────────────┐ ┌───────────────────┐
│   SALE_ITEMS    │ │    PAYMENTS     │ │  SALES_RETURNS    │
│ sale_id (FK)    │ │ sale_id (FK)    │ │ id (PK)           │
│ variant_id (FK) │ │ payment_mode    │ │ sale_id (FK)      │
│ quantity        │ │ amount          │ │ return_number(UQ) │
│ unit_price      │ │ reference_no    │ │ return_date       │
│ discount │ tax  │ │ payment_date    │ │ total_amount      │
└─────────────────┘ └─────────────────┘ │ refund_amount     │
                                        └───────────────────┘
       ┌─────────────────────────────────────┐
       │          DRAFT_SALES                │
       │ id (PK) │ draft_number (UQ)          │
       │ customer_id (FK) │ notes            │
       │ status (ACTIVE/RESUMED/CANCELLED)   │
       │ created_by (FK)                     │
       └──────────────────┬──────────────────┘
                          │ 1
                          │ has
                          │ N
                   ┌─────────────────┐
                   │ DRAFT_SALE_ITEMS│
                   │ draft_id (FK)   │
                   │ variant_id (FK) │
                   │ quantity        │
                   │ unit_price      │
                   └─────────────────┘

MODULE 6: SALESPERSONS ──────────────────────────────────────────────
┌──────────────────────────┐
│       SALESPERSONS        │
│ id (PK) │ name            │
│ phone │ email             │
│ employee_code (UQ)        │
│ commission_pct            │
│ status                    │
└──────┬───────────────────┘
       │ 1
       │ handles
       │ N
       └─────── sales.salesperson_id (FK)

MODULE 7: FINANCIAL ─────────────────────────────────────────────────
┌──────────────────────────┐  ┌──────────────────┐
│       EXPENSES            │  │ DAY_CLOSING      │
│ id (PK)                   │  │ id (PK)          │
│ expense_number (UQ)       │  │ closing_date(UQ) │
│ expense_category_id (FK)  │  │ opening_cash     │
│ amount                    │  │ cash/upi/card/   │
│ description               │  │ credit_sales     │
│ expense_date              │  │ expenses_total   │
│ payment_mode              │  │ closing_cash     │
│ created_by (FK)           │  │ expected_cash    │
└──────────────────────────┘  │ difference       │
                              │ closed_by (FK)   │
┌──────────────────────────┐  └──────────────────┘
│   EXPENSE_CATEGORIES     │
│ id (PK) │ name           │
│ description │ status     │
└──────────────────────────┘

MODULE 8: PROMOTIONS & NOTIFICATIONS ────────────────────────────────
┌──────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│     COUPONS       │  │  LOYALTY_SETTINGS    │  │  NOTIFICATIONS  │
│ id (PK)           │  │ id (PK)              │  │ id (PK)         │
│ code (UQ)         │  │ points_per_rupee     │  │ type            │
│ discount_type     │  │ redemption_rate      │  │ title │ message │
│ discount_value    │  │ min_redemption       │  │ reference_type  │
│ valid_from/to     │  │ max_redemption_pct   │  │ is_read         │
│ usage_limit       │  │ enabled              │  └──────────────────┘
│ status            │  └──────────────────────┘
└──────────────────┘


═══════════════════════════════════════════════════════════════════════
RELATIONSHIP SUMMARY
═══════════════════════════════════════════════════════════════════════

CORE
  Store 1──────────N Users
  User 1───────────N AuditLogs
  RolePermissions (role + module + feature)

PRODUCT MASTERS
  Color 1──────────N ProductVariants
  Size 1───────────N ProductVariants
  Fabric 1─────────N Products
  Pattern 1────────N Products
  TaxGroup 1───────N Products
  Brand 1──────────N Products
  Manufacturer 1───N Products
  Category 1───────N Products
  Category 1───────N Subcategories (self-ref)

PRODUCTS
  Product 1────────N ProductVariants
  Product 1────────N ProductImages
  Product 1────────N PriceChangeHistory
  ProductVariant 1─N StockLedger (mandatory)
  ProductVariant 1─N PriceChangeHistory
  ProductVariant 1─N StockAdjustmentItems
  ProductVariant 1─N PurchaseOrderItems
  ProductVariant 1─N SaleItems
  ProductVariant 1─N DraftSaleItems
  ProductVariant 1─N SalesReturnItems
  ProductVariant 1─N PurchaseReturnItems

PURCHASES
  Supplier 1───────N PurchaseOrders
  Supplier 1───────N PurchaseInvoices
  Supplier 1───────N PurchaseReturns
  Supplier 1───────N SupplierTransactions
  PurchaseOrder 1──N PurchaseOrderItems
  PurchaseOrder 1──0..1 GoodsReceiptNotes (optional partial)
  PurchaseOrder 1──N PurchaseInvoices (optional partial)
  PurchaseInvoice 1─N PurchaseReturns

SALES & CUSTOMERS
  Customer 1───────N Sales
  Customer 1───────N CustomerTransactions
  Customer 1───────N LoyaltyTransactions
  Sale 1───────────N SaleItems
  Sale 1───────────N Payments (split payments)
  Sale 1───────────N SalesReturns
  Sale 1───────────0..1 DraftSales (resume from hold)
  Sale N───────────1 Salesperson
  DraftSale 1──────N DraftSaleItems

FINANCIAL
  ExpenseCategory 1─N Expenses
  DayClosing (one per date)
