import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Banknote,
  Undo2,
  ClipboardList,
  PackageCheck,
  FileText,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type {
  Supplier, PurchaseOrder, PurchaseOrderItem, Grn, GrnItem,
  PurchaseInvoice, PurchaseReturn, ProductVariant,
} from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { cn, formatCurrency, formatDate } from '@/utils'

type TabKey = 'orders' | 'grns' | 'invoices' | 'returns'

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'orders', label: 'Purchase Orders', icon: ClipboardList },
  { key: 'grns', label: 'GRN', icon: PackageCheck },
  { key: 'invoices', label: 'Invoices', icon: FileText },
  { key: 'returns', label: 'Returns', icon: RotateCcw },
]

interface PoItemForm {
  variantId: number | null
  quantity: number
  unitPrice: number
  discountAmount: number
}

const emptyPoItem: PoItemForm = { variantId: null, quantity: 1, unitPrice: 0, discountAmount: 0 }

interface GrnItemForm {
  variantId: number
  orderedQty: number
  receivedQty: number
  acceptedQty: number
  rejectedQty: number
  rejectionReason: string
}

function statusVariant(status: string): 'success' | 'warning' | 'secondary' {
  const s = status?.toUpperCase()
  if (['APPROVED', 'PAID', 'COMPLETED', 'RECEIVED', 'ACTIVE'].includes(s)) return 'success'
  if (['PENDING', 'PARTIAL', 'DRAFT'].includes(s)) return 'warning'
  return 'secondary'
}

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('orders')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [allVariants, setAllVariants] = useState<(ProductVariant & { productName?: string })[]>([])
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [grns, setGrns] = useState<Grn[]>([])
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([])
  const [returns, setReturns] = useState<PurchaseReturn[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [poDialog, setPoDialog] = useState(false)
  const [poForm, setPoForm] = useState({ supplierId: null as number | null, expectedDelivery: '', discountAmount: 0, notes: '' })
  const [poItems, setPoItems] = useState<PoItemForm[]>([{ ...emptyPoItem }])
  const [saving, setSaving] = useState(false)

  const [grnDialog, setGrnDialog] = useState(false)
  const [grnOrderId, setGrnOrderId] = useState<number | null>(null)
  const [grnItems, setGrnItems] = useState<GrnItemForm[]>([])

  const [invoiceDialog, setInvoiceDialog] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({
    supplierId: null as number | null,
    purchaseOrderId: null as number | null,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    paidAmount: 0,
    notes: '',
  })

  const [returnDialog, setReturnDialog] = useState(false)
  const [returnForm, setReturnForm] = useState({
    supplierId: null as number | null,
    purchaseInvoiceId: null as number | null,
    returnDate: new Date().toISOString().slice(0, 10),
    reason: '',
  })
  const [returnItems, setReturnItems] = useState<{ variantId: number; quantity: number; unitPrice: number; reason: string }[]>([])

  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState<any>(null)
  const [viewTitle, setViewTitle] = useState('')

  const loadReferenceData = useCallback(async () => {
    try {
      const [{ data: sup }, { data: varR }] = await Promise.all([
        api.get('/suppliers/active'),
        api.get('/products/variants'),
      ])
      setSuppliers(sup.data || [])
      setAllVariants(varR.data || [])
    } catch {
      // silent
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [o, g, i, r] = await Promise.all([
        api.get('/purchase-orders', { params: { page: 0, size: 100 } }),
        api.get('/grns', { params: { page: 0, size: 100 } }),
        api.get('/purchase-invoices', { params: { page: 0, size: 100 } }),
        api.get('/purchase-returns', { params: { page: 0, size: 100 } }),
      ])
      setOrders(o.data?.content || [])
      setGrns(g.data?.content || [])
      setInvoices(i.data?.content || [])
      setReturns(r.data?.content || [])
    } catch {
      toast.error('Failed to load purchase data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReferenceData()
    fetchData()
  }, [loadReferenceData, fetchData])

  function variantLabel(v: ProductVariant & { productName?: string }): string {
    const parts = [v.productName]
    if (v.colorName) parts.push(v.colorName)
    if (v.sizeName) parts.push(v.sizeName)
    return parts.join(' / ')
  }

  function openCreatePo() {
    setPoForm({ supplierId: null, expectedDelivery: '', discountAmount: 0, notes: '' })
    setPoItems([{ ...emptyPoItem }])
    setPoDialog(true)
  }

  function addPoItem() {
    setPoItems((prev) => [...prev, { ...emptyPoItem }])
  }

  function updatePoItem(idx: number, patch: Partial<PoItemForm>) {
    setPoItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  async function handleCreatePo() {
    if (!poForm.supplierId) {
      toast.error('Select a supplier')
      return
    }
    const validItems = poItems.filter((it) => it.variantId != null && it.quantity > 0)
    if (validItems.length === 0) {
      toast.error('Add at least one item')
      return
    }
    setSaving(true)
    try {
      await api.post('/purchase-orders', {
        supplierId: poForm.supplierId,
        expectedDelivery: poForm.expectedDelivery || null,
        discountAmount: poForm.discountAmount,
        notes: poForm.notes,
        items: validItems.map((it) => ({
          variantId: it.variantId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discountAmount: it.discountAmount,
        })),
      })
      toast.success('Purchase order created')
      setPoDialog(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create PO')
    } finally {
      setSaving(false)
    }
  }

  function openCreateGrn() {
    setGrnOrderId(null)
    setGrnItems([])
    setGrnDialog(true)
  }

  function selectGrnOrder(orderId: number) {
    setGrnOrderId(orderId)
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    setGrnItems(
      order.items.map((it) => ({
        variantId: it.variantId,
        orderedQty: it.quantity,
        receivedQty: it.quantity,
        acceptedQty: it.quantity,
        rejectedQty: 0,
        rejectionReason: '',
      })),
    )
  }

  function updateGrnItem(idx: number, patch: Partial<GrnItemForm>) {
    setGrnItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  async function handleCreateGrn() {
    if (!grnOrderId) {
      toast.error('Select a purchase order')
      return
    }
    if (grnItems.length === 0) {
      toast.error('No items to receive')
      return
    }
    setSaving(true)
    try {
      await api.post('/grns', {
        purchaseOrderId: grnOrderId,
        receivedDate: new Date().toISOString().slice(0, 10),
        items: grnItems,
      })
      toast.success('GRN created — approve to update stock')
      setGrnDialog(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create GRN')
    } finally {
      setSaving(false)
    }
  }

  async function handleApproveGrn(grn: Grn) {
    if (!confirm(`Approve GRN ${grn.grnNumber}? Stock will be updated.`)) return
    try {
      await api.patch(`/grns/${grn.id}/approve`)
      toast.success('GRN approved, stock updated')
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve GRN')
    }
  }

  function openCreateInvoice() {
    setInvoiceForm({
      supplierId: null,
      purchaseOrderId: null,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: '',
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      paidAmount: 0,
      notes: '',
    })
    setInvoiceDialog(true)
  }

  async function handleCreateInvoice() {
    if (!invoiceForm.supplierId) {
      toast.error('Select a supplier')
      return
    }
    if (invoiceForm.subtotal <= 0) {
      toast.error('Subtotal must be greater than zero')
      return
    }
    setSaving(true)
    try {
      const { data: res } = await api.post('/purchase-invoices', {
        ...invoiceForm,
        purchaseOrderId: invoiceForm.purchaseOrderId || null,
      })
      toast.success(res.message || 'Invoice created')
      setInvoiceDialog(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  async function handleRecordPayment(invoice: PurchaseInvoice) {
    const amountStr = prompt(`Record payment for ${invoice.invoiceNumber} (balance ${invoice.balanceAmount}):`, String(invoice.balanceAmount))
    if (!amountStr) return
    const amount = Number(amountStr)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount')
      return
    }
    try {
      await api.patch(`/purchase-invoices/${invoice.id}/payment`, null, { params: { amount } })
      toast.success('Payment recorded')
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    }
  }

  function openCreateReturn() {
    setReturnForm({
      supplierId: null,
      purchaseInvoiceId: null,
      returnDate: new Date().toISOString().slice(0, 10),
      reason: '',
    })
    setReturnItems([{ variantId: 0, quantity: 1, unitPrice: 0, reason: '' }])
    setReturnDialog(true)
  }

  function addReturnItem() {
    setReturnItems((prev) => [...prev, { variantId: 0, quantity: 1, unitPrice: 0, reason: '' }])
  }

  function updateReturnItem(idx: number, patch: Partial<{ variantId: number; quantity: number; unitPrice: number; reason: string }>) {
    setReturnItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  async function handleCreateReturn() {
    if (!returnForm.supplierId) {
      toast.error('Select a supplier')
      return
    }
    const validItems = returnItems.filter((it) => it.variantId && it.quantity > 0)
    if (validItems.length === 0) {
      toast.error('Add at least one item')
      return
    }
    setSaving(true)
    try {
      await api.post('/purchase-returns', {
        ...returnForm,
        purchaseInvoiceId: returnForm.purchaseInvoiceId || null,
        items: validItems,
      })
      toast.success('Purchase return created, stock updated')
      setReturnDialog(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create return')
    } finally {
      setSaving(false)
    }
  }

  function openView(title: string, data: any) {
    setViewTitle(title)
    setViewData(data)
    setViewOpen(true)
  }

  function renderItemsTable(items: any[] | undefined) {
    return (
      <div className="max-h-[40vh] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items || []).map((it) => (
              <TableRow key={it.id}>
                <TableCell>
                  <div className="font-medium text-sm">{it.variantName || it.productName || '—'}</div>
                  <div className="text-xs text-muted-foreground">
                    {[it.barcode, it.colorName && it.colorName, it.sizeName && it.sizeName].filter(Boolean).join(' · ')}
                  </div>
                </TableCell>
                <TableCell className="text-right">{it.quantity ?? it.acceptedQty ?? it.receivedQty ?? '—'}</TableCell>
                <TableCell className="text-right">{formatCurrency(Number(it.unitPrice || 0))}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Number(it.totalPrice || it.unitPrice * (it.quantity || 0)))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const q = searchQuery.toLowerCase()
    return orders.filter(
      (o) => o.orderNumber?.toLowerCase().includes(q) || o.supplierName?.toLowerCase().includes(q),
    )
  }, [orders, searchQuery])

  const filteredGrns = useMemo(() => {
    if (!searchQuery.trim()) return grns
    const q = searchQuery.toLowerCase()
    return grns.filter(
      (g) => g.grnNumber?.toLowerCase().includes(q) || g.supplierName?.toLowerCase().includes(q),
    )
  }, [grns, searchQuery])

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices
    const q = searchQuery.toLowerCase()
    return invoices.filter(
      (i) => i.invoiceNumber?.toLowerCase().includes(q) || i.supplierName?.toLowerCase().includes(q),
    )
  }, [invoices, searchQuery])

  const filteredReturns = useMemo(() => {
    if (!searchQuery.trim()) return returns
    const q = searchQuery.toLowerCase()
    return returns.filter(
      (r) => r.returnNumber?.toLowerCase().includes(q) || r.supplierName?.toLowerCase().includes(q),
    )
  }, [returns, searchQuery])

  const availableOrders = orders.filter((o) => !['DRAFT'].includes(o.status))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="Purchase orders, goods receipt, invoices, and returns"
        actions={
          <>
            {activeTab === 'orders' && (
              <Button onClick={openCreatePo} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Purchase Order
              </Button>
            )}
            {activeTab === 'grns' && (
              <Button onClick={openCreateGrn} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New GRN
              </Button>
            )}
            {activeTab === 'invoices' && (
              <Button onClick={openCreateInvoice} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Invoice
              </Button>
            )}
            {activeTab === 'returns' && (
              <Button onClick={openCreateReturn} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Return
              </Button>
            )}
          </>
        }
      />

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 w-fit flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setSearchQuery('')
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap',
                activeTab === tab.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {activeTab === 'orders' &&
            (filteredOrders.length === 0 ? (
              <EmptyState title="No purchase orders" description="Create your first purchase order" action={{ label: 'New Purchase Order', onClick: openCreatePo }} />
            ) : (
              <div className="rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.supplierName}</TableCell>
                        <TableCell className="text-xs">{formatDate(order.orderDate)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell><Badge variant={statusVariant(order.status)}>{order.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(`Purchase Order ${order.orderNumber}`, order)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}

          {activeTab === 'grns' &&
            (filteredGrns.length === 0 ? (
              <EmptyState title="No GRNs" description="Receive goods against a purchase order" action={{ label: 'New GRN', onClick: openCreateGrn }} />
            ) : (
              <div className="rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>PO</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrns.map((grn) => (
                      <TableRow key={grn.id}>
                        <TableCell className="font-mono text-xs font-medium">{grn.grnNumber}</TableCell>
                        <TableCell>{grn.supplierName}</TableCell>
                        <TableCell className="font-mono text-xs">{grn.purchaseOrderNumber}</TableCell>
                        <TableCell className="text-xs">{formatDate(grn.receivedDate)}</TableCell>
                        <TableCell><Badge variant={statusVariant(grn.status)}>{grn.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(`GRN ${grn.grnNumber}`, grn)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {grn.status !== 'APPROVED' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleApproveGrn(grn)} title="Approve GRN">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}

          {activeTab === 'invoices' &&
            (filteredInvoices.length === 0 ? (
              <EmptyState title="No invoices" description="Record supplier invoices" action={{ label: 'New Invoice', onClick: openCreateInvoice }} />
            ) : (
              <div className="rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.supplierName}</TableCell>
                        <TableCell className="text-xs">{formatDate(inv.invoiceDate)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(inv.totalAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(inv.balanceAmount)}</TableCell>
                        <TableCell><Badge variant={statusVariant(inv.status)}>{inv.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(`Invoice ${inv.invoiceNumber}`, inv)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {inv.balanceAmount > 0 && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleRecordPayment(inv)} title="Record payment">
                                <Banknote className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}

          {activeTab === 'returns' &&
            (filteredReturns.length === 0 ? (
              <EmptyState title="No returns" description="Record returns to suppliers" action={{ label: 'New Return', onClick: openCreateReturn }} />
            ) : (
              <div className="rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((ret) => (
                      <TableRow key={ret.id}>
                        <TableCell className="font-mono text-xs font-medium">{ret.returnNumber}</TableCell>
                        <TableCell>{ret.supplierName}</TableCell>
                        <TableCell className="font-mono text-xs">{ret.purchaseInvoiceNumber || '—'}</TableCell>
                        <TableCell className="text-xs">{formatDate(ret.returnDate)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(ret.totalAmount)}</TableCell>
                        <TableCell><Badge variant={statusVariant(ret.status)}>{ret.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openView(`Return ${ret.returnNumber}`, ret)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
        </motion.div>
      )}

      {/* PO Dialog */}
      <Dialog open={poDialog} onOpenChange={setPoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select value={poForm.supplierId ? String(poForm.supplierId) : ''} onValueChange={(v) => setPoForm((p) => ({ ...p, supplierId: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery</Label>
                <Input type="date" value={poForm.expectedDelivery} onChange={(e) => setPoForm((p) => ({ ...p, expectedDelivery: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              <div className="space-y-3">
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Select value={item.variantId ? String(item.variantId) : ''} onValueChange={(v) => updatePoItem(idx, { variantId: Number(v) })}>
                        <SelectTrigger><SelectValue placeholder="Variant" /></SelectTrigger>
                        <SelectContent>
                          {allVariants.map((v) => (
                            <SelectItem key={v.id} value={String(v.id)}>{variantLabel(v)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => updatePoItem(idx, { quantity: Number(e.target.value) })} placeholder="Qty" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={0} value={item.unitPrice} onChange={(e) => updatePoItem(idx, { unitPrice: Number(e.target.value) })} placeholder="Rate" />
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-1">
                        <Input type="number" min={0} value={item.discountAmount} onChange={(e) => updatePoItem(idx, { discountAmount: Number(e.target.value) })} placeholder="Disc" />
                        <Button variant="ghost" size="icon" className="h-9 w-8 text-destructive" onClick={() => setPoItems((prev) => prev.filter((_, i) => i !== idx))} disabled={poItems.length === 1}>
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addPoItem}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" min={0} value={poForm.discountAmount} onChange={(e) => setPoForm((p) => ({ ...p, discountAmount: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={poForm.notes} onChange={(e) => setPoForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPoDialog(false)}>Cancel</Button>
              <Button onClick={handleCreatePo} disabled={saving}>{saving ? 'Saving...' : 'Create PO'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* GRN Dialog */}
      <Dialog open={grnDialog} onOpenChange={setGrnDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New GRN</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Purchase Order *</Label>
              <Select value={grnOrderId ? String(grnOrderId) : ''} onValueChange={(v) => selectGrnOrder(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select PO" /></SelectTrigger>
                <SelectContent>
                  {availableOrders.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.orderNumber} — {o.supplierName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {grnItems.length > 0 && (
              <div className="space-y-3">
                {grnItems.map((item, idx) => (
                  <div key={idx} className="rounded-lg border p-3 space-y-2">
                    <div className="text-sm font-medium">
                      {allVariants.find((v) => v.id === item.variantId) ? variantLabel(allVariants.find((v) => v.id === item.variantId)!) : 'Variant ' + item.variantId}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Ordered</Label>
                        <Input value={item.orderedQty} readOnly className="bg-muted/50" />
                      </div>
                      <div>
                        <Label className="text-xs">Received</Label>
                        <Input type="number" min={0} value={item.receivedQty} onChange={(e) => updateGrnItem(idx, { receivedQty: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label className="text-xs">Accepted</Label>
                        <Input type="number" min={0} value={item.acceptedQty} onChange={(e) => updateGrnItem(idx, { acceptedQty: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label className="text-xs">Rejected</Label>
                        <Input type="number" min={0} value={item.rejectedQty} onChange={(e) => updateGrnItem(idx, { rejectedQty: Number(e.target.value) })} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setGrnDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateGrn} disabled={saving}>{saving ? 'Saving...' : 'Create GRN'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Purchase Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={invoiceForm.supplierId ? String(invoiceForm.supplierId) : ''} onValueChange={(v) => setInvoiceForm((p) => ({ ...p, supplierId: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Purchase Order (optional)</Label>
              <Select value={invoiceForm.purchaseOrderId ? String(invoiceForm.purchaseOrderId) : ''} onValueChange={(v) => setInvoiceForm((p) => ({ ...p, purchaseOrderId: v ? Number(v) : null }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availableOrders.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.orderNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input type="date" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subtotal *</Label>
                <Input type="number" min={0} value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm((p) => ({ ...p, subtotal: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" min={0} value={invoiceForm.discountAmount} onChange={(e) => setInvoiceForm((p) => ({ ...p, discountAmount: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax</Label>
                <Input type="number" min={0} value={invoiceForm.taxAmount} onChange={(e) => setInvoiceForm((p) => ({ ...p, taxAmount: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Paid Now</Label>
                <Input type="number" min={0} value={invoiceForm.paidAmount} onChange={(e) => setInvoiceForm((p) => ({ ...p, paidAmount: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              Total:{' '}
              <span className="font-semibold">
                {formatCurrency(invoiceForm.subtotal - invoiceForm.discountAmount + invoiceForm.taxAmount)}
              </span>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setInvoiceDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateInvoice} disabled={saving}>{saving ? 'Saving...' : 'Create Invoice'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={returnDialog} onOpenChange={setReturnDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Purchase Return</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select value={returnForm.supplierId ? String(returnForm.supplierId) : ''} onValueChange={(v) => setReturnForm((p) => ({ ...p, supplierId: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Input type="date" value={returnForm.returnDate} onChange={(e) => setReturnForm((p) => ({ ...p, returnDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              <div className="space-y-3">
                {returnItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Select value={item.variantId ? String(item.variantId) : ''} onValueChange={(v) => updateReturnItem(idx, { variantId: Number(v) })}>
                        <SelectTrigger><SelectValue placeholder="Variant" /></SelectTrigger>
                        <SelectContent>
                          {allVariants.map((v) => (
                            <SelectItem key={v.id} value={String(v.id)}>{variantLabel(v)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => updateReturnItem(idx, { quantity: Number(e.target.value) })} placeholder="Qty" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={0} value={item.unitPrice} onChange={(e) => updateReturnItem(idx, { unitPrice: Number(e.target.value) })} placeholder="Rate" />
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-1">
                        <Input value={item.reason} onChange={(e) => updateReturnItem(idx, { reason: e.target.value })} placeholder="Reason" />
                        <Button variant="ghost" size="icon" className="h-9 w-8 text-destructive" onClick={() => setReturnItems((prev) => prev.filter((_, i) => i !== idx))} disabled={returnItems.length === 1}>
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addReturnItem}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={returnForm.reason} onChange={(e) => setReturnForm((p) => ({ ...p, reason: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setReturnDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateReturn} disabled={saving}>{saving ? 'Saving...' : 'Create Return'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{viewTitle}</DialogTitle></DialogHeader>
          {viewData && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier</span>
                  <span className="font-medium">{viewData.supplierName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span><Badge variant={statusVariant(viewData.status)}>{viewData.status}</Badge></span>
                </div>
                {viewData.totalAmount != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{formatCurrency(viewData.totalAmount)}</span>
                  </div>
                )}
                {viewData.balanceAmount != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-semibold">{formatCurrency(viewData.balanceAmount)}</span>
                  </div>
                )}
              </div>
              {renderItemsTable(viewData.items)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
