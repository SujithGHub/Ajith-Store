import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Phone,
  Mail,
  MapPin,
  Wallet,
  History,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Supplier, SupplierTransaction } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { cn, formatCurrency } from '@/utils'

interface SupplierForm {
  name: string
  contactPerson: string
  mobile: string
  email: string
  address: string
  gstNumber: string
  creditTerms: string
  openingBalance: number
}

const emptyForm: SupplierForm = {
  name: '',
  contactPerson: '',
  mobile: '',
  email: '',
  address: '',
  gstNumber: '',
  creditTerms: '',
  openingBalance: 0,
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState<SupplierForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [ledgerSupplier, setLedgerSupplier] = useState<Supplier | null>(null)
  const [transactions, setTransactions] = useState<SupplierTransaction[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 10

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: any }>('/suppliers', {
        params: { page: 0, size: 200 },
      })
      setSuppliers(res.data?.content || [])
    } catch {
      toast.error('Failed to load suppliers')
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      mobile: supplier.mobile || '',
      email: supplier.email || '',
      address: supplier.address || '',
      gstNumber: supplier.gstNumber || '',
      creditTerms: supplier.creditTerms || '',
      openingBalance: Number(supplier.openingBalance || 0),
    })
    setDialogOpen(true)
  }

  function setField(key: keyof SupplierForm, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name?.trim()) {
      toast.error('Supplier name is required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const { data: res } = await api.put(`/suppliers/${editing.id}`, form)
        toast.success(res.message || 'Supplier updated')
      } else {
        const { data: res } = await api.post('/suppliers', form)
        toast.success(res.message || 'Supplier created')
      }
      setDialogOpen(false)
      fetchSuppliers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save supplier')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(supplier: Supplier) {
    try {
      await api.patch(`/suppliers/${supplier.id}/status`)
      toast.success('Supplier status toggled')
      fetchSuppliers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  async function handleDelete(supplier: Supplier) {
    if (!confirm(`Delete supplier "${supplier.name}"?`)) return
    try {
      await api.delete(`/suppliers/${supplier.id}`)
      toast.success('Supplier deleted')
      fetchSuppliers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete supplier')
    }
  }

  async function openLedger(supplier: Supplier) {
    setLedgerSupplier(supplier)
    setLedgerOpen(true)
    setLedgerLoading(true)
    try {
      const { data: res } = await api.get(`/suppliers/${supplier.id}/transactions`, {
        params: { page: 0, size: 100 },
      })
      setTransactions(res.data?.content || [])
    } catch {
      toast.error('Failed to load ledger')
      setTransactions([])
    } finally {
      setLedgerLoading(false)
    }
  }

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers
    const q = searchQuery.toLowerCase()
    return suppliers.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.contactPerson?.toLowerCase().includes(q) ||
        s.mobile?.includes(q) ||
        s.gstNumber?.toLowerCase().includes(q),
    )
  }, [suppliers, searchQuery])

  const paginated = useMemo(() => {
    const start = page * pageSize
    return filteredSuppliers.slice(start, start + pageSize)
  }, [filteredSuppliers, page])

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage supplier master data and ledger"
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Supplier
          </Button>
        }
      />

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(0)
          }}
          className="h-9 pl-9"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers found"
          description="Add your first supplier to start recording purchases"
          action={!searchQuery ? { label: 'Add Supplier', onClick: openCreate } : undefined}
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>GST</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-xs text-muted-foreground">{supplier.creditTerms || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-sm">
                      {supplier.contactPerson && (
                        <span className="text-muted-foreground">{supplier.contactPerson}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {supplier.mobile || '—'}
                      </span>
                      {supplier.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {supplier.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{supplier.gstNumber || '—'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(supplier.currentBalance || 0))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.status === 'ACTIVE' ? 'success' : 'warning'}>{supplier.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Ledger" onClick={() => openLedger(supplier)}>
                        <History className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(supplier)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(supplier)}>
                        <Wallet className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(supplier)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSuppliers.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages} ({filteredSuppliers.length} total)
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Name <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Supplier name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={form.contactPerson} onChange={(e) => setField('contactPerson', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={form.mobile} onChange={(e) => setField('mobile', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setField('address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input value={form.gstNumber} onChange={(e) => setField('gstNumber', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Credit Terms</Label>
                <Input value={form.creditTerms} onChange={(e) => setField('creditTerms', e.target.value)} placeholder="e.g. Net 30" />
              </div>
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Opening Balance</Label>
                <Input
                  type="number"
                  value={form.openingBalance}
                  onChange={(e) => setField('openingBalance', Number(e.target.value))}
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ledger — {ledgerSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">
            <span className="text-muted-foreground">Current Balance:</span>{' '}
            <span className="font-semibold">{formatCurrency(Number(ledgerSupplier?.currentBalance || 0))}</span>
          </div>
          {ledgerLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : transactions.length === 0 ? (
            <EmptyState title="No transactions" description="No ledger entries recorded yet" />
          ) : (
            <div className="max-h-[50vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(txn.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={txn.amount >= 0 ? 'success' : 'secondary'}>{txn.transactionType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{txn.notes || '—'}</TableCell>
                      <TableCell className={cn('text-right font-medium', txn.amount < 0 && 'text-destructive')}>
                        {formatCurrency(Number(txn.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
