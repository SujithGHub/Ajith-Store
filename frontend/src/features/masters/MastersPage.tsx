import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  Building2,
  Palette,
  Maximize2,
  Shirt,
  Layout,
  Percent,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type {
  Category, Brand, Color, Size, Fabric as FabricType,
  Pattern, TaxGroup,
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
import { cn } from '@/utils'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'

interface TabConfig {
  key: string
  label: string
  icon: React.ElementType
  endpoint: string
}

const tabs: TabConfig[] = [
  { key: 'categories', label: 'Categories', icon: Tags, endpoint: '/api/categories' },
  { key: 'brands', label: 'Brands', icon: Building2, endpoint: '/api/brands' },
  { key: 'colors', label: 'Colors', icon: Palette, endpoint: '/api/colors' },
  { key: 'sizes', label: 'Sizes', icon: Maximize2, endpoint: '/api/sizes' },
  { key: 'fabrics', label: 'Fabrics', icon: Shirt, endpoint: '/api/fabrics' },
  { key: 'patterns', label: 'Patterns', icon: Layout, endpoint: '/api/patterns' },
  { key: 'tax-groups', label: 'Tax Groups', icon: Percent, endpoint: '/api/tax-groups' },
]

type Entity = Category | Brand | Color | Size | FabricType | Pattern | TaxGroup

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'color'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  min?: number
  max?: number
  step?: number
}

function getFields(tabKey: string): FieldDef[] {
  const base: FieldDef[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter name' },
  ]
  if (tabKey === 'categories') {
    base.push(
      { key: 'parentId', label: 'Parent Category', type: 'select', placeholder: 'None (root category)' },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Optional description' },
      { key: 'sortOrder', label: 'Sort Order', type: 'number', placeholder: '0' },
    )
  } else if (tabKey === 'colors') {
    base.push(
      { key: 'hexCode', label: 'Hex Code', type: 'color', required: true, placeholder: '#000000' },
    )
  } else if (tabKey === 'sizes') {
    base.push(
      { key: 'displayOrder', label: 'Display Order', type: 'number', required: true, placeholder: '0' },
    )
  } else if (tabKey === 'tax-groups') {
    base.push(
      { key: 'cgstPct', label: 'CGST (%)', type: 'number', required: true, placeholder: '0', min: 0, max: 100, step: 0.01 },
      { key: 'sgstPct', label: 'SGST (%)', type: 'number', required: true, placeholder: '0', min: 0, max: 100, step: 0.01 },
      { key: 'igstPct', label: 'IGST (%)', type: 'number', required: true, placeholder: '0', min: 0, max: 100, step: 0.01 },
    )
  } else {
    base.push(
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Optional description' },
    )
  }
  base.push({
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
    ],
  })
  return base
}

function getDefaultForm(tabKey: string): Record<string, any> {
  const defaults: Record<string, any> = { name: '', status: 'ACTIVE' }
  if (tabKey === 'categories') {
    defaults.parentId = null
    defaults.description = ''
    defaults.sortOrder = 0
  } else if (tabKey === 'colors') {
    defaults.hexCode = '#000000'
  } else if (tabKey === 'sizes') {
    defaults.displayOrder = 0
  } else if (tabKey === 'tax-groups') {
    defaults.cgstPct = 0
    defaults.sgstPct = 0
    defaults.igstPct = 0
  } else {
    defaults.description = ''
  }
  return defaults
}

function entityLabel(tabKey: string): string {
  return tabs.find((t) => t.key === tabKey)?.label ?? tabKey
}

function singularLabel(tabKey: string): string {
  const map: Record<string, string> = {
    categories: 'Category',
    brands: 'Brand',
    colors: 'Color',
    sizes: 'Size',
    fabrics: 'Fabric',
    patterns: 'Pattern',
    'tax-groups': 'Tax Group',
  }
  return map[tabKey] ?? tabKey
}

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState<string>('categories')
  const [data, setData] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Entity | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(0)
  const pageSize = 10

  const config = useMemo(() => tabs.find((t) => t.key === activeTab)!, [activeTab])
  const fields = useMemo(() => getFields(activeTab), [activeTab])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: Entity[] }>(config.endpoint)
      setData(res.data || [])
    } catch {
      toast.error(`Failed to load ${config.label}`)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [config.endpoint, config.label])

  const fetchCategories = useCallback(async () => {
    try {
      const { data: res } = await api.get<{ success: boolean; data: Category[] }>('/api/categories/root')
      setCategories(res.data || [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchData()
    if (activeTab === 'categories') fetchCategories()
  }, [activeTab, fetchData, fetchCategories])

  function openCreate() {
    setEditingItem(null)
    setFormData(getDefaultForm(activeTab))
    setDialogOpen(true)
  }

  function openEdit(item: Entity) {
    setEditingItem(item)
    const fd: Record<string, any> = { ...item }
    setFormData(fd)
    setDialogOpen(true)
  }

  function setFormValue(key: string, value: any) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!formData.name?.trim()) {
      toast.error('Name is required')
      return
    }
    if (activeTab === 'colors' && !formData.hexCode?.trim()) {
      toast.error('Hex code is required')
      return
    }

    const payload = { ...formData }
    if (activeTab === 'categories' && (payload.parentId === '' || payload.parentId === null)) {
      payload.parentId = null
    }

    setSaving(true)
    try {
      if (editingItem) {
        const { data: res } = await api.put<{ success: boolean; message: string; data: Entity }>(
          `${config.endpoint}/${editingItem.id}`,
          payload,
        )
        if (res.success) {
          toast.success(res.message || `${singularLabel(activeTab)} updated`)
        }
      } else {
        const { data: res } = await api.post<{ success: boolean; message: string; data: Entity }>(
          config.endpoint,
          payload,
        )
        if (res.success) {
          toast.success(res.message || `${singularLabel(activeTab)} created`)
        }
      }
      setDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to save ${singularLabel(activeTab)}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Entity) {
    const label = (item as any).name || singularLabel(activeTab)
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    try {
      await api.delete(`${config.endpoint}/${item.id}`)
      toast.success(`${singularLabel(activeTab)} deleted`)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to delete ${singularLabel(activeTab)}`)
    }
  }

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data
    const q = searchQuery.toLowerCase()
    return data.filter((item) => {
      const d = item as any
      return d.name?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
    })
  }, [data, searchQuery])

  const paginatedData = useMemo(() => {
    const start = page * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, page])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

  function statusVariant(status: string): 'success' | 'secondary' | 'warning' {
    if (status === 'ACTIVE') return 'success'
    if (status === 'INACTIVE') return 'warning'
    return 'secondary'
  }

  function getTableHeaders(): string[] {
    const headers = ['Name']
    if (activeTab === 'categories') headers.push('Parent')
    if (activeTab === 'colors') headers.push('Hex Code')
    if (activeTab === 'sizes') headers.push('Display Order')
    if (activeTab === 'tax-groups') headers.push('CGST', 'SGST', 'IGST')
    headers.push('Status', 'Actions')
    return headers
  }

  function renderCell(item: Entity, field: string): React.ReactNode {
    const d = item as any
    if (field === 'status') {
      return <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
    }
    if (field === 'parentId') {
      if (activeTab !== 'categories') return null
      return d.parentName || (d.parentId ? `ID: ${d.parentId}` : '—')
    }
    if (field === 'hexCode') {
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded border"
            style={{ backgroundColor: d.hexCode || '#000' }}
          />
          <span className="font-mono text-xs">{d.hexCode}</span>
        </div>
      )
    }
    if (['cgstPct', 'sgstPct', 'igstPct'].includes(field)) {
      return `${Number(d[field]).toFixed(2)}%`
    }
    return d[field] ?? '—'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Masters"
        description="Manage categories, brands, colors, and other master data"
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
                setPage(0)
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${config.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              className="h-9 pl-9"
            />
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add {singularLabel(activeTab)}
          </Button>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-card">
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            title={`No ${config.label.toLowerCase()} found`}
            description={
              searchQuery
                ? 'Try a different search term'
                : `Get started by adding your first ${singularLabel(activeTab).toLowerCase()}`
            }
            action={!searchQuery ? { label: `Add ${singularLabel(activeTab)}`, onClick: openCreate } : undefined}
          />
        ) : (
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  {getTableHeaders().map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{(item as any).name}</TableCell>
                    {activeTab === 'categories' && (
                      <TableCell className="text-muted-foreground">
                        {renderCell(item, 'parentId')}
                      </TableCell>
                    )}
                    {activeTab === 'colors' && (
                      <TableCell>{renderCell(item, 'hexCode')}</TableCell>
                    )}
                    {activeTab === 'sizes' && (
                      <TableCell>{(item as any).displayOrder ?? '—'}</TableCell>
                    )}
                    {activeTab === 'tax-groups' && (
                      <>
                        <TableCell>{renderCell(item, 'cgstPct')}</TableCell>
                        <TableCell>{renderCell(item, 'sgstPct')}</TableCell>
                        <TableCell>{renderCell(item, 'igstPct')}</TableCell>
                      </>
                    )}
                    <TableCell>{renderCell(item, 'status')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredData.length > pageSize && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages} ({filteredData.length} total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
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
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${singularLabel(activeTab)}` : `Add ${singularLabel(activeTab)}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map((field) => {
              if (field.type === 'select' && field.key === 'parentId') {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Select
                      value={formData.parentId ? String(formData.parentId) : ''}
                      onValueChange={(v) => setFormValue('parentId', v ? Number(v) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || 'Select...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (root category)</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              }
              if (field.type === 'select') {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Select
                      value={formData[field.key] || ''}
                      onValueChange={(v) => setFormValue(field.key, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || 'Select...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options || []).map((opt) => (
                          <SelectItem key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              }
              if (field.type === 'color') {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-lg border shrink-0"
                        style={{ backgroundColor: formData.hexCode || '#000000' }}
                      />
                      <Input
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormValue(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                )
              }
              if (field.type === 'number') {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      type="number"
                      value={formData[field.key] ?? ''}
                      onChange={(e) => setFormValue(field.key, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  </div>
                )
              }
              return (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  <Input
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormValue(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              )
            })}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
