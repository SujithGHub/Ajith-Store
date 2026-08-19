import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Phone,
  History,
  Award,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Customer, CustomerTransaction } from '@/types'
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

interface CustomerForm {
  name: string
  mobile: string
  email: string
  address: string
  gstNumber: string
  creditLimit: number
  openingBalance: number
}

const emptyForm: CustomerForm = {
  name: '',
  mobile: '',
  email: '',
  address: '',
  gstNumber: '',
  creditLimit: 0,
  openingBalance: 0,
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [ledgerCustomer, setLedgerCustomer] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 10

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: any }>('/customers', {
        params: { page: 0, size: 200 },
      })
      setCustomers(res.data?.content || [])
    } catch {
      toast.error('Failed to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditing(customer)
    setForm({
      name: customer.name,
      mobile: customer.mobile || '',
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
      creditLimit: Number(customer.creditLimit || 0),
      openingBalance: Number(customer.openingBalance || 0),
    })
    setDialogOpen(true)
  }

  function setField(key: keyof CustomerForm, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name?.trim()) {
      toast.error('Customer name is required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const { data: res } = await api.put(`/customers/${editing.id}`, form)
        toast.success(res.message || 'Customer updated')
      } else {
        const { data: res } = await api.post('/customers', form)
        toast.success(res.message || 'Customer created')
      }
      setDialogOpen(false)
      fetchCustomers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(customer: Customer) {
    try {
      await api.patch(`/customers/${customer.id}/status`)
      toast.success('Customer status toggled')
      fetchCustomers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  async function handleDelete(customer: Customer) {
    if (!confirm(`Delete customer "${customer.name}"?`)) return
    try {
      await api.delete(`/customers/${customer.id}`)
      toast.success('Customer deleted')
      fetchCustomers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete customer')
    }
  }

  async function openLedger(customer: Customer) {
    setLedgerCustomer(customer)
    setLedgerOpen(true)
    setLedgerLoading(true)
    try {
      const { data: res } = await api.get(`/customers/${customer.id}/transactions`, {
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

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.mobile?.includes(q) ||
        c.customerCode?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q),
    )
  }, [customers, searchQuery])

  const paginated = useMemo(() => {
    const start = page * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, page])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer master data, balances, and ledger"
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Customer
          </Button>
        }
      />

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
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
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add your first customer to start billing"
          action={!searchQuery ? { label: 'Add Customer', onClick: openCreate } : undefined}
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Loyalty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{customer.customerCode}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-sm">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.mobile || '—'}
                      </span>
                      {customer.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(customer.currentBalance || 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      {Number(customer.loyaltyPoints || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'warning'}>{customer.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Ledger" onClick={() => openLedger(customer)}>
                        <History className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(customer)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(customer)}>
                        <Badge className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(customer)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCustomers.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages} ({filteredCustomers.length} total)
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
            <DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Name <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Customer name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={form.mobile} onChange={(e) => setField('mobile', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              </div>
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
                <Label>Credit Limit</Label>
                <Input
                  type="number"
                  value={form.creditLimit}
                  onChange={(e) => setField('creditLimit', Number(e.target.value))}
                />
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
            <DialogTitle>Ledger — {ledgerCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">
            <span className="text-muted-foreground">Current Balance:</span>{' '}
            <span className="font-semibold">{formatCurrency(Number(ledgerCustomer?.currentBalance || 0))}</span>
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
