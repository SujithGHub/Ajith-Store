export interface User {
  id: number
  storeId: number
  username: string
  fullName: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'BILLING'
  enabled: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface StoreConfig {
  id: number
  storeName: string
  address: string
  phone: string
  email: string
  gstNumber: string
  logoPath: string
  invoiceHeader: string
  invoiceFooter: string
  currency: string
  taxEnabled: boolean
  roundOffEnabled: boolean
}

export interface Category {
  id: number
  name: string
  description: string
  parentId: number | null
  parentName?: string
  imagePath: string
  sortOrder: number
  status: string
}

export interface Brand {
  id: number
  name: string
  description: string
  imagePath: string
  status: string
}

export interface Color {
  id: number
  name: string
  hexCode: string
  status: string
}

export interface Size {
  id: number
  name: string
  displayOrder: number
  status: string
}

export interface Fabric {
  id: number
  name: string
  description: string
  status: string
}

export interface Pattern {
  id: number
  name: string
  description: string
  status: string
}

export interface TaxGroup {
  id: number
  name: string
  cgstPct: number
  sgstPct: number
  igstPct: number
  status: string
}

export interface ExpenseCategory {
  id: number
  name: string
  description: string
  status: string
}

export interface ProductImage {
  id: number
  productId: number
  imageUrl: string
  displayOrder: number
}

export interface Product {
  id: number
  itemCode: string
  name: string
  description: string
  categoryId: number
  categoryName: string
  subcategoryId: number
  subcategoryName: string
  brandId: number
  brandName: string
  manufacturerId: number
  manufacturerName: string
  unit: string
  fabricId: number
  fabricName: string
  patternId: number
  patternName: string
  gender: string
  ageGroup: string
  hsnCode: string
  gstApplicable: boolean
  taxGroupId: number
  taxGroupName: string
  cgstPct: number
  sgstPct: number
  igstPct: number
  imagePath: string
  images: ProductImage[]
  status: string
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: number
  productId: number
  productName: string
  colorId: number
  colorName: string
  colorHex: string
  sizeId: number
  sizeName: string
  barcode: string
  sku: string
  purchasePrice: number
  landingCost: number
  mrp: number
  sellingPrice: number
  wholesalePrice: number
  currentStock: number
  minStock: number
  reorderLevel: number
  status: string
}

export interface Supplier {
  id: number
  name: string
  contactPerson: string
  mobile: string
  email: string
  address: string
  gstNumber: string
  creditTerms: string
  openingBalance: number
  currentBalance: number
  status: string
}

export interface PurchaseOrder {
  id: number
  orderNumber: string
  supplierId: number
  supplierName: string
  orderDate: string
  expectedDelivery: string
  status: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  notes: string
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: number
  variantId: number
  variantName: string
  barcode: string
  colorName: string
  sizeName: string
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  totalPrice: number
}

export interface Customer {
  id: number
  customerCode: string
  name: string
  mobile: string
  email: string
  address: string
  gstNumber: string
  creditLimit: number
  openingBalance: number
  currentBalance: number
  loyaltyPoints: number
  membershipLevel: string
  status: string
}

export interface SaleItem {
  variantId: number
  barcode: string
  productName: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  totalPrice: number
}

export interface Payment {
  id: number
  saleId: number
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT'
  amount: number
  referenceNumber: string
  paymentDate: string
  notes: string
}

export interface Sale {
  id: number
  invoiceNumber: string
  customerId: number
  customerName: string
  saleDate: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  roundOff: number
  couponCode: string
  couponDiscount: number
  paymentStatus: string
  notes: string
  items: SaleItem[]
  payments: Payment[]
  createdBy: number
  createdByName: string
}

export interface DraftSale {
  id: number
  draftNumber: string
  customerId: number
  customerName: string
  notes: string
  status: string
  items: DraftSaleItem[]
  createdBy: number
  createdAt: string
}

export interface DraftSaleItem {
  id: number
  variantId: number
  barcode: string
  productName: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  discountAmount: number
}

export interface StockLedgerEntry {
  id: number
  variantId: number
  transactionType: string
  referenceType: string
  referenceId: number
  qtyIn: number
  qtyOut: number
  runningBalance: number
  createdBy: number
  createdAt: string
}

export interface Expense {
  id: number
  expenseNumber: string
  expenseCategoryId: number
  expenseCategoryName: string
  amount: number
  description: string
  expenseDate: string
  paymentMode: string
  notes: string
  createdBy: number
}

export interface DayClosing {
  id: number
  closingDate: string
  openingCash: number
  cashSales: number
  upiSales: number
  cardSales: number
  creditSales: number
  totalSales: number
  expensesTotal: number
  closingCash: number
  expectedCash: number
  difference: number
  notes: string
  closedBy: number
  closedAt: string
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  referenceType: string
  referenceId: number
  isRead: boolean
  createdAt: string
}

export interface LoyaltyTransaction {
  id: number
  customerId: number
  transactionType: string
  points: number
  referenceType: string
  referenceId: number
  notes: string
  createdAt: string
}

export interface DashboardStats {
  todaySales: number
  monthlySales: number
  yearlySales: number
  currentStockValue: number
  outstandingCredits: number
  lowStockCount: number
  totalCustomers: number
  totalSuppliers: number
}

export interface PriceChangeHistory {
  id: number
  variantId: number
  oldPurchasePrice: number
  newPurchasePrice: number
  oldSellingPrice: number
  newSellingPrice: number
  oldMrp: number
  newMrp: number
  changedBy: number
  changedByName: string
  reason: string
  changedAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface PageRequest {
  page?: number
  size?: number
  sort?: string
  search?: string
}

export interface Role {
  role: string
  description: string
  system: boolean
  createdAt: string
  userCount: number
}

export interface RolePermission {
  id: number
  role: string
  module: string
  feature: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface SupplierTransaction {
  id: number
  supplierId: number
  supplierName: string
  transactionType: string
  amount: number
  referenceType: string
  referenceId: number
  notes: string
  transactionDate: string
}

export interface CustomerTransaction {
  id: number
  customerId: number
  customerName: string
  transactionType: string
  amount: number
  referenceType: string
  referenceId: number
  notes: string
  transactionDate: string
}

export interface GrnItem {
  id: number
  variantId: number
  variantName: string
  barcode: string
  colorName: string
  sizeName: string
  orderedQty: number
  receivedQty: number
  acceptedQty: number
  rejectedQty: number
  rejectionReason: string
}

export interface Grn {
  id: number
  grnNumber: string
  purchaseOrderId: number
  purchaseOrderNumber: string
  supplierId: number
  supplierName: string
  receivedDate: string
  status: string
  notes: string
  createdBy: number
  createdAt: string
  items: GrnItem[]
}

export interface PurchaseInvoice {
  id: number
  invoiceNumber: string
  supplierId: number
  supplierName: string
  purchaseOrderId: number
  purchaseOrderNumber: string
  invoiceDate: string
  dueDate: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  status: string
  notes: string
  createdBy: number
  createdAt: string
}

export interface PurchaseReturnItem {
  id: number
  variantId: number
  variantName: string
  barcode: string
  colorName: string
  sizeName: string
  quantity: number
  unitPrice: number
  reason: string
}

export interface PurchaseReturn {
  id: number
  returnNumber: string
  supplierId: number
  supplierName: string
  purchaseInvoiceId: number
  purchaseInvoiceNumber: string
  returnDate: string
  reason: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: string
  createdBy: number
  createdAt: string
  items: PurchaseReturnItem[]
}
