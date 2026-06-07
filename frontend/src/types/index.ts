export interface User {
  id: number
  username: string
  fullName: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'BILLING'
  enabled: boolean
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
  parentId: number
  imagePath: string
  sortOrder: number
  status: string
}

export interface Product {
  id: number
  itemCode: string
  name: string
  description: string
  categoryId: number
  categoryName: string
  brandId: number
  brandName: string
  fabric: string
  pattern: string
  gender: string
  hsnCode: string
  gstApplicable: boolean
  cgstPct: number
  sgstPct: number
  igstPct: number
  imagePath: string
  status: string
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: number
  productId: number
  color: string
  size: string
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
  currentBalance: number
  status: string
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
  paymentStatus: string
  items: SaleItem[]
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
