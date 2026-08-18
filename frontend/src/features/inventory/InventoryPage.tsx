import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  X,
  Loader2,
  FileWarning,
  History,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Product, ProductVariant, StockLedgerEntry, PaginatedResponse } from '@/types'
import { formatDate, formatDateTime, formatCurrency, cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'

/* ── Local Types ── */
interface InventoryAlert {
  variantId: number
  productName: string
  barcode: string
  colorName: string
  sizeName: string
  currentStock: number
  minStock: number
  reorderLevel: number
  alertType: string
}

interface StockAdjustmentItemDto {
  id: number
  variantId: number
  barcode: string
  productName: string
  colorName: string
  sizeName: string
  quantity: number
  unitPrice: number
  reason: string
}

interface StockAdjustmentDto {
  id: number
  adjustmentNumber: string
  adjustmentType: 'POSITIVE' | 'NEGATIVE'
  reason: string
  notes: string
  status: string
  items: StockAdjustmentItemDto[]
  createdBy: number
  createdByName: string
  createdAt: string
}

interface AdjustmentItemForm {
  variantId: number
  barcode: string
  productName: string
  colorName: string
  sizeName: string
  quantity: number
  unitPrice: number
  reason: string
}

interface VariantSearchResult {
  variantId: number
  productName: string
  barcode: string
  colorName: string
  sizeName: string
  currentStock: number
}

interface ProductListItem {
  id: number
  itemCode: string
  name: string
  categoryName: string
  status: string
  variants: ProductVariant[]
}

/* ── Tabs ── */
const tabs = [
  { id: 'overview', label: 'Stock Overview', icon: Package },
  { id: 'low-stock', label: 'Low Stock Alerts', icon: AlertTriangle },
  { id: 'reorder', label: 'Reorder Alerts', icon: FileWarning },
  { id: 'adjustments', label: 'Stock Adjustments', icon: ClipboardList },
]

/* ── Helpers ── */
function getStockStatus(current: number, min: number, reorder: number) {
  if (current <= 0) return { label: 'Out of Stock', variant: 'destructive' as const }
  if (current <= min) return { label: 'Low Stock', variant: 'warning' as const }
  if (current <= reorder) return { label: 'Reorder Soon', variant: 'secondary' as const }
  return { label: 'In Stock', variant: 'success' as const }
}

/* ── Main Component ── */
export default function InventoryPage() {
  /* ── Tab State ── */
  const [activeTab, setActiveTab] = useState('overview')

  /* ── Tab 1: Stock Overview ── */
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productPage, setProductPage] = useState(0)
  const [productTotalPages, setProductTotalPages] = useState(0)
  const [productTotalElements, setProductTotalElements] = useState(0)

  /* ── Product Detail Dialog ── */
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  /* ── Stock Ledger Dialog ── */
  const [ledgerVariant, setLedgerVariant] = useState<ProductVariant | null>(null)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [ledgerEntries, setLedgerEntries] = useState<StockLedgerEntry[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [ledgerPage, setLedgerPage] = useState(0)
  const [ledgerTotalPages, setLedgerTotalPages] = useState(0)

  /* ── Tab 2: Low Stock Alerts ── */
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryAlert[]>([])
  const [lowStockLoading, setLowStockLoading] = useState(true)

  /* ── Tab 3: Reorder Alerts ── */
  const [reorderAlerts, setReorderAlerts] = useState<InventoryAlert[]>([])
  const [reorderLoading, setReorderLoading] = useState(true)

  /* ── Tab 4: Stock Adjustments ── */
  const [adjustments, setAdjustments] = useState<StockAdjustmentDto[]>([])
  const [adjustmentsLoading, setAdjustmentsLoading] = useState(true)
  const [adjustmentPage, setAdjustmentPage] = useState(0)
  const [adjustmentTotalPages, setAdjustmentTotalPages] = useState(0)
  const [adjustmentTotalElements, setAdjustmentTotalElements] = useState(0)

  /* ── New Adjustment Dialog ── */
  const [adjOpen, setAdjOpen] = useState(false)
  const [adjType, setAdjType] = useState<'POSITIVE' | 'NEGATIVE'>('POSITIVE')
  const [adjReason, setAdjReason] = useState('')
  const [adjNotes, setAdjNotes] = useState('')
  const [adjItems, setAdjItems] = useState<AdjustmentItemForm[]>([])
  const [adjSubmitting, setAdjSubmitting] = useState(false)

  /* ── Variant search in adjustment ── */
  const [variantSearchQuery, setVariantSearchQuery] = useState('')
  const [variantSearchResults, setVariantSearchResults] = useState<VariantSearchResult[]>([])
  const [variantSearching, setVariantSearching] = useState(false)
  const [showVariantDropdown, setShowVariantDropdown] = useState(false)
  const variantSearchTimer = useRef<ReturnType<typeof setTimeout>>()
  const variantSearchRef = useRef<HTMLDivElement>(null)

  /* ── Data Fetching ── */

  // Products list
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true)
      setProductsError(false)
      const params: Record<string, any> = { page: productPage, size: 10 }
      if (productSearch) params.search = productSearch
      const { data: res } = await api.get<{ success: boolean; data: PaginatedResponse<ProductListItem> }>(
        '/products',
        { params }
      )
      setProducts(res.data.content)
      setProductTotalPages(res.data.totalPages)
      setProductTotalElements(res.data.totalElements)
    } catch {
      setProductsError(true)
      toast.error('Failed to load products')
    } finally {
      setProductsLoading(false)
    }
  }, [productPage, productSearch])

  useEffect(() => {
    if (activeTab === 'overview') fetchProducts()
  }, [fetchProducts, activeTab])

  // Product detail
  const fetchProductDetail = useCallback(async (id: number) => {
    try {
      setDetailLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: Product }>(`/products/${id}`)
      setDetailProduct(res.data)
    } catch {
      toast.error('Failed to load product details')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // Stock ledger
  const fetchLedger = useCallback(async (variantId: number, page: number) => {
    try {
      setLedgerLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: PaginatedResponse<StockLedgerEntry> }>(
        `/products/${variantId}/ledger`,
        { params: { page, size: 20 } }
      )
      setLedgerEntries(res.data.content)
      setLedgerTotalPages(res.data.totalPages)
    } catch {
      toast.error('Failed to load stock ledger')
    } finally {
      setLedgerLoading(false)
    }
  }, [])

  // Low stock alerts
  const fetchLowStock = useCallback(async () => {
    try {
      setLowStockLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: InventoryAlert[] }>(
        '/products/alerts/low-stock'
      )
      setLowStockAlerts(res.data)
    } catch {
      toast.error('Failed to load low stock alerts')
    } finally {
      setLowStockLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'low-stock') fetchLowStock()
  }, [fetchLowStock, activeTab])

  // Reorder alerts
  const fetchReorder = useCallback(async () => {
    try {
      setReorderLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: InventoryAlert[] }>(
        '/products/alerts/reorder'
      )
      setReorderAlerts(res.data)
    } catch {
      toast.error('Failed to load reorder alerts')
    } finally {
      setReorderLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'reorder') fetchReorder()
  }, [fetchReorder, activeTab])

  // Stock adjustments
  const fetchAdjustments = useCallback(async () => {
    try {
      setAdjustmentsLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: PaginatedResponse<StockAdjustmentDto> }>(
        '/stock-adjustments',
        { params: { page: adjustmentPage, size: 10 } }
      )
      setAdjustments(res.data.content)
      setAdjustmentTotalPages(res.data.totalPages)
      setAdjustmentTotalElements(res.data.totalElements)
    } catch {
      toast.error('Failed to load stock adjustments')
    } finally {
      setAdjustmentsLoading(false)
    }
  }, [adjustmentPage])

  useEffect(() => {
    if (activeTab === 'adjustments') fetchAdjustments()
  }, [fetchAdjustments, activeTab])

  // Variant search for adjustment dialog
  const searchVariants = useCallback(async (query: string) => {
    if (!query.trim()) {
      setVariantSearchResults([])
      setShowVariantDropdown(false)
      return
    }
    try {
      setVariantSearching(true)
      const { data: res } = await api.get<{ success: boolean; data: PaginatedResponse<ProductListItem> }>(
        '/products',
        { params: { search: query, size: 10 } }
      )
      const results: VariantSearchResult[] = []
      for (const p of res.data.content) {
        if (p.variants) {
          for (const v of p.variants) {
            results.push({
              variantId: v.id,
              productName: p.name,
              barcode: v.barcode,
              colorName: v.colorName,
              sizeName: v.sizeName,
              currentStock: v.currentStock,
            })
          }
        }
      }
      setVariantSearchResults(results)
      setShowVariantDropdown(results.length > 0)
    } catch {
      setVariantSearchResults([])
    } finally {
      setVariantSearching(false)
    }
  }, [])

  useEffect(() => {
    if (variantSearchQuery.trim()) {
      clearTimeout(variantSearchTimer.current)
      variantSearchTimer.current = setTimeout(() => searchVariants(variantSearchQuery), 400)
    } else {
      setVariantSearchResults([])
      setShowVariantDropdown(false)
    }
    return () => clearTimeout(variantSearchTimer.current)
  }, [variantSearchQuery, searchVariants])

  // Click outside to close variant dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (variantSearchRef.current && !variantSearchRef.current.contains(e.target as Node)) {
        setShowVariantDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ── Handlers ── */

  const openProductDetail = (product: ProductListItem) => {
    setDetailOpen(true)
    fetchProductDetail(product.id)
  }

  const openLedger = (variant: ProductVariant) => {
    setLedgerVariant(variant)
    setLedgerPage(0)
    setLedgerOpen(true)
    fetchLedger(variant.id, 0)
  }

  const handleLedgerPageChange = (newPage: number) => {
    if (ledgerVariant) {
      setLedgerPage(newPage)
      fetchLedger(ledgerVariant.id, newPage)
    }
  }

  const addAdjustmentItem = () => {
    setAdjItems((prev) => [
      ...prev,
      {
        variantId: 0,
        barcode: '',
        productName: '',
        colorName: '',
        sizeName: '',
        quantity: 1,
        unitPrice: 0,
        reason: '',
      },
    ])
  }

  const removeAdjustmentItem = (index: number) => {
    setAdjItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateAdjustmentItem = (index: number, field: keyof AdjustmentItemForm, value: any) => {
    setAdjItems((prev) => {
      const next = [...prev]
      ;(next[index] as any)[field] = value
      return next
    })
  }

  const selectVariantForItem = (index: number, variant: VariantSearchResult) => {
    updateAdjustmentItem(index, 'variantId', variant.variantId)
    updateAdjustmentItem(index, 'barcode', variant.barcode)
    updateAdjustmentItem(index, 'productName', variant.productName)
    updateAdjustmentItem(index, 'colorName', variant.colorName)
    updateAdjustmentItem(index, 'sizeName', variant.sizeName)
    setShowVariantDropdown(false)
    setVariantSearchQuery('')
  }

  const resetAdjustmentForm = () => {
    setAdjType('POSITIVE')
    setAdjReason('')
    setAdjNotes('')
    setAdjItems([])
    setVariantSearchQuery('')
    setAdjSubmitting(false)
  }

  const handleCreateAdjustment = async () => {
    if (!adjReason.trim()) {
      toast.error('Please enter a reason')
      return
    }
    if (adjItems.length === 0) {
      toast.error('Please add at least one item')
      return
    }
    for (const item of adjItems) {
      if (!item.variantId) {
        toast.error('Please select a variant for all items')
        return
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error('Quantity must be greater than 0')
        return
      }
    }
    try {
      setAdjSubmitting(true)
      const payload = {
        adjustmentType: adjType,
        reason: adjReason,
        notes: adjNotes,
        items: adjItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          reason: item.reason,
        })),
      }
      await api.post('/stock-adjustments', payload)
      toast.success('Stock adjustment created successfully')
      setAdjOpen(false)
      resetAdjustmentForm()
      fetchAdjustments()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create adjustment')
    } finally {
      setAdjSubmitting(false)
    }
  }

  /* ── Render Helpers ── */

  const renderPagination = (
    page: number,
    totalPages: number,
    onPageChange: (p: number) => void
  ) => {
    if (totalPages <= 1) return null
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <p className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const renderAlertTable = (
    alerts: InventoryAlert[],
    loading: boolean,
    type: 'low-stock' | 'reorder'
  ) => {
    const isLow = type === 'low-stock'
    const accentClass = isLow
      ? 'border-l-red-500 bg-red-500/5'
      : 'border-l-amber-500 bg-amber-500/5'
    const badgeVariant = isLow ? 'destructive' : 'warning'
    const badgeLabel = isLow ? 'Low Stock' : 'Reorder'

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {isLow ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <FileWarning className="h-4 w-4 text-amber-500" />
            )}
            {isLow ? 'Low Stock Alerts' : 'Reorder Alerts'}
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({alerts.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Color / Size</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : alerts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No {isLow ? 'low stock' : 'reorder'} alerts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.variantId} className={accentClass}>
                      <TableCell className="font-medium">{alert.productName}</TableCell>
                      <TableCell>
                        {alert.colorName} / {alert.sizeName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{alert.barcode}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'font-bold',
                            alert.currentStock <= 0
                              ? 'text-red-500'
                              : alert.currentStock <= alert.minStock
                                ? 'text-orange-500'
                                : 'text-amber-500'
                          )}
                        >
                          {alert.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>{alert.minStock}</TableCell>
                      <TableCell>{alert.reorderLevel}</TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            setAdjType('POSITIVE')
                            setAdjReason(`Restocking: ${alert.productName} (${alert.barcode})`)
                            setAdjItems([
                              {
                                variantId: alert.variantId,
                                barcode: alert.barcode,
                                productName: alert.productName,
                                colorName: alert.colorName,
                                sizeName: alert.sizeName,
                                quantity: 1,
                                unitPrice: 0,
                                reason: 'Restocking',
                              },
                            ])
                            setAdjOpen(true)
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create Adjustment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ── Render ── */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Track stock levels, manage alerts and adjustments"
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Stock Overview ── */}
      {activeTab === 'overview' && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  All Products
                  {!productsLoading && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({productTotalElements})
                    </span>
                  )}
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value)
                      setProductPage(0)
                    }}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead>Total Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : productsError ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Failed to load products.{' '}
                          <button
                            onClick={fetchProducts}
                            className="text-primary underline underline-offset-2"
                          >
                            Retry
                          </button>
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {productSearch
                            ? 'No products matching your search.'
                            : 'No products found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((p) => {
                        const totalStock = p.variants
                          ? p.variants.reduce(
                              (sum, v) => sum + (v.currentStock || 0),
                              0
                            )
                          : 0
                        return (
                          <TableRow
                            key={p.id}
                            className="cursor-pointer"
                            onClick={() => openProductDetail(p)}
                          >
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>{p.categoryName || '—'}</TableCell>
                            <TableCell>
                              {p.variants ? p.variants.length : 0}
                            </TableCell>
                            <TableCell className="font-medium">{totalStock}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  p.status === 'ACTIVE' ? 'success' : 'secondary'
                                }
                              >
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openProductDetail(p)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {renderPagination(productPage, productTotalPages, (p) =>
                setProductPage(p)
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Tab 2: Low Stock Alerts ── */}
      {activeTab === 'low-stock' && (
        <motion.div
          key="low-stock"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {renderAlertTable(lowStockAlerts, lowStockLoading, 'low-stock')}
        </motion.div>
      )}

      {/* ── Tab 3: Reorder Alerts ── */}
      {activeTab === 'reorder' && (
        <motion.div
          key="reorder"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {renderAlertTable(reorderAlerts, reorderLoading, 'reorder')}
        </motion.div>
      )}

      {/* ── Tab 4: Stock Adjustments ── */}
      {activeTab === 'adjustments' && (
        <motion.div
          key="adjustments"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  All Adjustments
                  {!adjustmentsLoading && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({adjustmentTotalElements})
                    </span>
                  )}
                </CardTitle>
                <Button size="sm" onClick={() => { resetAdjustmentForm(); setAdjOpen(true) }}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Adjustment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adjustment #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustmentsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : adjustments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No stock adjustments found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      adjustments.map((adj) => (
                        <TableRow key={adj.id}>
                          <TableCell className="font-medium">
                            {adj.adjustmentNumber}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                adj.adjustmentType === 'POSITIVE'
                                  ? 'success'
                                  : 'destructive'
                              }
                            >
                              {adj.adjustmentType === 'POSITIVE'
                                ? 'Positive'
                                : 'Negative'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {adj.reason}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(adj.createdAt)}
                          </TableCell>
                          <TableCell>{adj.items?.length || 0}</TableCell>
                          <TableCell>{adj.createdByName || '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {renderPagination(adjustmentPage, adjustmentTotalPages, (p) =>
                setAdjustmentPage(p)
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Product Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailProduct ? detailProduct.name : 'Product Details'}
            </DialogTitle>
            {detailProduct && (
              <p className="text-sm text-muted-foreground">
                {detailProduct.categoryName} &middot; {detailProduct.itemCode}
                {detailProduct.brandName && ` &middot; ${detailProduct.brandName}`}
              </p>
            )}
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : detailProduct ? (
            <div className="space-y-4">
              {/* Product Info Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total Stock</p>
                  <p className="text-lg font-bold">
                    {detailProduct.variants.reduce(
                      (s, v) => s + (v.currentStock || 0),
                      0
                    )}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Variants</p>
                  <p className="text-lg font-bold">
                    {detailProduct.variants.length}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Min Price</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      Math.min(
                        ...detailProduct.variants.map((v) => v.sellingPrice || 0)
                      )
                    )}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Max Price</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      Math.max(
                        ...detailProduct.variants.map((v) => v.sellingPrice || 0)
                      )
                    )}
                  </p>
                </div>
              </div>

              {/* Variants Table */}
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Reorder</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailProduct.variants.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="h-20 text-center text-muted-foreground"
                        >
                          No variants for this product.
                        </TableCell>
                      </TableRow>
                    ) : (
                      detailProduct.variants.map((v) => {
                        const status = getStockStatus(
                          v.currentStock,
                          v.minStock,
                          v.reorderLevel
                        )
                        return (
                          <TableRow key={v.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {v.colorHex && (
                                  <span
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: v.colorHex }}
                                  />
                                )}
                                {v.colorName}
                              </div>
                            </TableCell>
                            <TableCell>{v.sizeName}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {v.sku}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {v.barcode}
                            </TableCell>
                            <TableCell>{formatCurrency(v.purchasePrice || 0)}</TableCell>
                            <TableCell>{formatCurrency(v.sellingPrice || 0)}</TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  'font-bold',
                                  v.currentStock <= v.minStock && 'text-destructive'
                                )}
                              >
                                {v.currentStock}
                              </span>
                            </TableCell>
                            <TableCell>{v.minStock}</TableCell>
                            <TableCell>{v.reorderLevel}</TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="View Stock Ledger"
                                onClick={() => openLedger(v)}
                              >
                                <History className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Could not load product details.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Stock Ledger Dialog ── */}
      <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Stock Ledger
              {ledgerVariant && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {ledgerVariant.productName} &middot; {ledgerVariant.colorName} /{' '}
                  {ledgerVariant.sizeName}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Qty In</TableHead>
                  <TableHead>Qty Out</TableHead>
                  <TableHead>Running Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No ledger entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.transactionType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.referenceType && (
                          <span className="text-muted-foreground">
                            {entry.referenceType}#{entry.referenceId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {entry.qtyIn > 0 ? entry.qtyIn : '—'}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {entry.qtyOut > 0 ? entry.qtyOut : '—'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.runningBalance}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {renderPagination(ledgerPage, ledgerTotalPages, handleLedgerPageChange)}
        </DialogContent>
      </Dialog>

      {/* ── New Stock Adjustment Dialog ── */}
      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Stock Adjustment</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a manual stock adjustment entry.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Adjustment Type & Reason */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adjustment Type</label>
                <Select
                  value={adjType}
                  onValueChange={(v) => setAdjType(v as 'POSITIVE' | 'NEGATIVE')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE">Positive (Add Stock)</SelectItem>
                    <SelectItem value="NEGATIVE">Negative (Remove Stock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason *</label>
                <Input
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Damaged goods, restocking"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={adjNotes}
                onChange={(e) => setAdjNotes(e.target.value)}
                className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Optional notes"
                rows={2}
              />
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Items</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAdjustmentItem}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              </div>

              {adjItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg">
                  No items added yet. Click "Add Item" to begin.
                </p>
              )}

              {adjItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border p-3 space-y-3 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeAdjustmentItem(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Variant Search */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Product Variant *
                    </label>
                    <div className="relative" ref={variantSearchRef}>
                      <Input
                        placeholder="Search by product name or barcode..."
                        value={
                          item.variantId
                            ? `${item.productName} - ${item.colorName}/${item.sizeName} (${item.barcode})`
                            : variantSearchQuery
                        }
                        onChange={(e) => {
                          if (item.variantId) {
                            updateAdjustmentItem(idx, 'variantId', 0)
                            updateAdjustmentItem(idx, 'barcode', '')
                            updateAdjustmentItem(idx, 'productName', '')
                            updateAdjustmentItem(idx, 'colorName', '')
                            updateAdjustmentItem(idx, 'sizeName', '')
                          }
                          setVariantSearchQuery(e.target.value)
                        }}
                        onFocus={() => {
                          if (variantSearchResults.length > 0)
                            setShowVariantDropdown(true)
                        }}
                        className="pr-8"
                      />
                      {variantSearching && (
                        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {showVariantDropdown && variantSearchResults.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-background shadow-lg max-h-48 overflow-y-auto">
                          {variantSearchResults.map((vr) => (
                            <button
                              key={vr.variantId}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                              onClick={() => selectVariantForItem(idx, vr)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {vr.productName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Stock: {vr.currentStock}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>
                                  {vr.colorName} / {vr.sizeName}
                                </span>
                                <span className="font-mono">{vr.barcode}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity || ''}
                        onChange={(e) =>
                          updateAdjustmentItem(
                            idx,
                            'quantity',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Qty"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Unit Price
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice || ''}
                        onChange={(e) =>
                          updateAdjustmentItem(
                            idx,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Reason (per item)
                    </label>
                    <Input
                      value={item.reason}
                      onChange={(e) =>
                        updateAdjustmentItem(idx, 'reason', e.target.value)
                      }
                      placeholder="Optional reason for this item"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAdjOpen(false)
                  resetAdjustmentForm()
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateAdjustment}
                disabled={adjSubmitting}
              >
                {adjSubmitting && (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                )}
                {adjSubmitting ? 'Creating...' : 'Create Adjustment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
