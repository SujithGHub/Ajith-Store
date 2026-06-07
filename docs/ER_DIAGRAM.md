# Ajith Store — Entity Relationship Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         STORE_CONFIG                               │
│  id (PK) │ name │ address │ phone │ email │ gst │ logo │ ...      │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ 1
                           │ has
                           │ N
┌────────────────────────────────────────────────────────────────────┐
│                         USERS                                      │
│  id (PK) │ store_id (FK) │ username │ password │ role │ enabled    │
└────────────────────────────────────────────────────────────────────┘
         │ 1                      │ 1
         │ created_by             │ assigned
         │ N                      │ N
┌────────────────────────────────┐  ┌────────────────────────────────┐
│    AUDIT_LOGS                  │  │    ROLE_PERMISSIONS            │
│  id (PK) │ user_id (FK) │      │  │  id (PK) │ role_id (FK) │     │
│  action │ entity │ details     │  │  module │ feature │ access     │
└────────────────────────────────┘  └────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         CATEGORIES                                 │
│  id (PK) │ name │ parent_id (FK-self) │ description │ status       │
└───────────────────────┬────────────────────────────────────────────┘
                        │ 1
                        │ has
                        │ N
┌────────────────────────────────────────────────────────────────────┐
│                         PRODUCTS                                   │
│  id (PK) │ item_code │ name │ description                          │
│  category_id (FK) │ brand_id (FK) │ manufacturer_id (FK)            │
│  fabric │ pattern │ gender │ hsn_code │ gst%                       │
└───────────────────────┬────────────────────────────────────────────┘
                        │ 1
                        │ has variants
                        │ N
┌────────────────────────────────────────────────────────────────────┐
│                     PRODUCT_VARIANTS                               │
│  id (PK) │ product_id (FK) │ color │ size │ barcode (UQ) │ sku     │
│  purchase_price │ landing_cost │ mrp │ selling_price │ stock        │
│  min_stock │ reorder_level │ status                                 │
└──────┬───────────────┬────────────────┬────────────────────────────┘
       │ 1             │ 1              │ 1
       │ has           │ has            │ has
       │ N             │ N              │ N
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│ PURCHASE_    │ │ SALE_        │ │ STOCK_ADJUSTMENT_│
│ ORDER_ITEMS  │ │ ITEMS        │ │ ITEMS            │
├──────────────┤ ├──────────────┤ ├──────────────────┤
│ PO Items     │ │ Sale Items   │ │ Adjustment Items │
└──────┬───────┘ └──────┬───────┘ └──────────────────┘
       │ N               │ N
       │ 1               │ 1
┌──────────────┐ ┌──────────────┐
│ PURCHASE_    │ │ SALES        │
│ ORDERS       │ │              │
├──────────────┤ ├──────────────┤
│ id │ po_no   │ │ id │ inv_no  │
│ supplier_id  │ │ customer_id  │
│ (FK)         │ │ (FK) │ total │
│ total │ status│ │ payment_mode│
└──────┬───────┘ └──────┬───────┘
       │ 1              │ 1
       │ has            │ may have
       │ N              │ N
┌──────────────┐ ┌──────────────┐
│ GOODS_RECEIPT│ │ SALES_RETURNS│
│ NOTES (GRN)  │ │              │
└──────────────┘ └──────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         SUPPLIERS                                  │
│  id (PK) │ name │ contact_person │ mobile │ email │ gst │ credit   │
│  opening_balance │ status                                           │
└───────────────────────┬────────────────────────────────────────────┘
                        │ 1
                        │ has
                        │ N
┌────────────────────────────────────────────────────────────────────┐
│                    SUPPLIER_TRANSACTIONS                           │
│  id (PK) │ supplier_id (FK) │ type │ amount │ reference │ date     │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         CUSTOMERS                                  │
│  id (PK) │ customer_code │ name │ mobile │ email │ gst │ credit    │
│  opening_balance │ loyalty_points │ membership_level │ status       │
└───────────────────────┬────────────────────────────────────────────┘
                        │ 1
                        │ has
                        │ N
┌────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER_TRANSACTIONS                           │
│  id (PK) │ customer_id (FK) │ type │ amount │ reference │ date     │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         EXPENSES                                   │
│  id (PK) │ expense_no │ category │ amount │ description │ date      │
│  payment_mode │ created_by (FK)                                     │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         COUPONS                                    │
│  id (PK) │ code (UQ) │ type │ value │ min_purchase │ max_discount   │
│  usage_limit │ valid_from │ valid_to │ status                       │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                    LOYALTY_SETTINGS                                │
│  id (PK) │ points_per_rupee │ redemption_rate │ min_redemption      │
│  max_redemption │ enabled                                           │
└────────────────────────────────────────────────────────────────────┘


RELATIONSHIP SUMMARY:
═══════════════════════════════════════════════════════════════════════

Store 1─────────N Users
User  1─────────N AuditLogs
User  1─────────N Purchases/Sales/Expenses (created_by)

Category 1──────N Subcategories (self-referencing)
Category 1──────N Products
Brand   1──────N Products
Manufacturer 1──N Products

Product 1───────N ProductVariants

ProductVariant 1─N PurchaseOrderItems
ProductVariant 1─N GoodsReceiptNoteItems
ProductVariant 1─N PurchaseReturnItems
ProductVariant 1─N SaleItems
ProductVariant 1─N SalesReturnItems
ProductVariant 1─N StockAdjustmentItems

Supplier 1──────N PurchaseOrders
Supplier 1──────N PurchaseInvoices
Supplier 1──────N PurchaseReturns
Supplier 1──────N SupplierTransactions

PurchaseOrder 1──N PurchaseOrderItems
PurchaseOrder 1──1 GoodsReceiptNotes (optional)
PurchaseOrder 1──N PurchaseInvoices (optional)

Customer 1──────N Sales
Customer 1──────N CustomerTransactions

Sale 1──────────N SaleItems
Sale 1──────────N Payments
Sale 1──────────N SalesReturns

Role 1──────────N RolePermissions
