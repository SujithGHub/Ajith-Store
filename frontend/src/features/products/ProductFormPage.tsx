import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, X, Save, ArrowLeft, Barcode } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import type { Category, Brand, Color, Size, TaxGroup, Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/shared/PageHeader'

interface ProductForm {
  name: string
  itemCode: string
  description: string
  categoryId: string
  subcategoryId: string
  brandId: string
  unit: string
  hsnCode: string
  gender: string
  taxGroupId: string
  gstApplicable: boolean
  status: string
}

interface VariantRow {
  tempId: string
  colorId: string
  sizeId: string
  sku: string
  barcode: string
  purchasePrice: number
  mrp: number
  sellingPrice: number
  openingStock: number
  minStock: number
  reorderLevel: number
}

function generateBarcode() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BC${ts}${rand}`
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'variants'>('basic')

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [taxGroups, setTaxGroups] = useState<TaxGroup[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])

  const form = useForm<ProductForm>({
    defaultValues: {
      name: '',
      itemCode: '',
      description: '',
      categoryId: '',
      subcategoryId: '',
      brandId: '',
      unit: 'PCS',
      hsnCode: '',
      gender: '',
      taxGroupId: '',
      gstApplicable: false,
      status: 'ACTIVE',
    },
  })

  const selectedCategoryId = form.watch('categoryId')

  const parentCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories],
  )

  const subcategories = useMemo(
    () =>
      selectedCategoryId
        ? categories.filter((c) => c.parentId !== null && String(c.parentId) === selectedCategoryId)
        : [],
    [categories, selectedCategoryId],
  )

  useEffect(() => {
    if (selectedCategoryId) {
      form.setValue('subcategoryId', '')
    }
  }, [selectedCategoryId, form])

  useEffect(() => {
    const load = async () => {
      try {
        const [catR, brandR, colR, sizeR, taxR] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/colors'),
          api.get('/sizes'),
          api.get('/tax-groups'),
        ])
        const extract = (r: any) => r.data?.data ?? r.data
        setCategories(extract(catR))
        setBrands(extract(brandR))
        setColors(extract(colR))
        setSizes(extract(sizeR))
        setTaxGroups(extract(taxR))
      } catch {
        toast.error('Failed to load reference data')
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    const loadProduct = async () => {
      try {
        setLoading(true)
        const { data: res } = await api.get<{ success: boolean; data: Product }>(`/products/${id}`)
        const p = res.data
        form.reset({
          name: p.name,
          itemCode: p.itemCode ?? '',
          description: p.description ?? '',
          categoryId: p.categoryId ? String(p.categoryId) : '',
          subcategoryId: p.subcategoryId ? String(p.subcategoryId) : '',
          brandId: p.brandId ? String(p.brandId) : '',
          unit: p.unit || 'PCS',
          hsnCode: p.hsnCode ?? '',
          gender: p.gender ?? '',
          taxGroupId: p.taxGroupId ? String(p.taxGroupId) : '',
          gstApplicable: p.gstApplicable,
          status: p.status,
        })
        setVariants(
          (p.variants ?? []).map((v) => ({
            tempId: `v_${v.id}`,
            colorId: v.colorId ? String(v.colorId) : '',
            sizeId: v.sizeId ? String(v.sizeId) : '',
            sku: v.sku ?? '',
            barcode: v.barcode ?? '',
            purchasePrice: v.purchasePrice ?? 0,
            mrp: v.mrp ?? 0,
            sellingPrice: v.sellingPrice ?? 0,
            openingStock: 0,
            minStock: v.minStock ?? 0,
            reorderLevel: v.reorderLevel ?? 0,
          })),
        )
      } catch {
        toast.error('Failed to load product details')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [isEdit, id, form, navigate])

  const handleFormSubmit = async (data: ProductForm) => {
    if (!data.name.trim()) {
      toast.error('Product name is required')
      return
    }

    const payload = {
      name: data.name.trim(),
      itemCode: data.itemCode.trim() || undefined,
      description: data.description,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      subcategoryId: data.subcategoryId ? Number(data.subcategoryId) : null,
      brandId: data.brandId ? Number(data.brandId) : null,
      unit: data.unit || 'PCS',
      hsnCode: data.hsnCode,
      gender: data.gender,
      gstApplicable: data.gstApplicable,
      taxGroupId: data.taxGroupId ? Number(data.taxGroupId) : null,
      status: data.status,
      variants: variants.map((v) => ({
        colorId: v.colorId ? Number(v.colorId) : null,
        sizeId: v.sizeId ? Number(v.sizeId) : null,
        sku: v.sku,
        barcode: v.barcode,
        purchasePrice: Number(v.purchasePrice) || 0,
        mrp: Number(v.mrp) || 0,
        sellingPrice: Number(v.sellingPrice) || 0,
        openingStock: Number(v.openingStock) || 0,
        minStock: Number(v.minStock) || 0,
        reorderLevel: Number(v.reorderLevel) || 0,
      })),
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload)
        toast.success('Product updated')
      } else {
        await api.post('/products', payload)
        toast.success('Product created')
      }
      navigate('/products')
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`)
    } finally {
      setSubmitting(false)
    }
  }

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        tempId: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        colorId: '',
        sizeId: '',
        sku: '',
        barcode: '',
        purchasePrice: 0,
        mrp: 0,
        sellingPrice: 0,
        openingStock: 0,
        minStock: 0,
        reorderLevel: 0,
      },
    ])
  }

  const removeVariant = (tempId: string) => {
    setVariants((prev) => prev.filter((v) => v.tempId !== tempId))
  }

  const updateVariant = (tempId: string, field: keyof VariantRow, value: any) => {
    setVariants((prev) => prev.map((v) => (v.tempId === tempId ? { ...v, [field]: value } : v)))
  }

  const assignBarcode = (tempId: string) => {
    updateVariant(tempId, 'barcode', generateBarcode())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title={isEdit ? 'Edit Product' : 'Add Product'}
        description={isEdit ? 'Update product details and variants' : 'Create a new product with variants'}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Products
          </Button>
        }
      />

      {loading ? (
        <div className="rounded-xl border px-6 py-16 text-center text-muted-foreground">
          Loading product...
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('variants')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'variants'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Variants
            </button>
          </div>

          {activeTab === 'basic' && (
            <div className="max-w-4xl space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input {...form.register('name')} placeholder="Product name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Item Code</label>
                  <Input {...form.register('itemCode')} placeholder="Auto-generated" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  {...form.register('description')}
                  placeholder="Product description"
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={form.watch('categoryId')}
                    onValueChange={(v) => form.setValue('categoryId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subcategory</label>
                  <Select
                    value={form.watch('subcategoryId')}
                    onValueChange={(v) => form.setValue('subcategoryId', v)}
                    disabled={!selectedCategoryId || subcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedCategoryId
                            ? 'Select category first'
                            : subcategories.length === 0
                              ? 'No subcategories'
                              : 'Select subcategory'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand</label>
                  <Select
                    value={form.watch('brandId')}
                    onValueChange={(v) => form.setValue('brandId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Group</label>
                  <Select
                    value={form.watch('taxGroupId')}
                    onValueChange={(v) => form.setValue('taxGroupId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax group" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxGroups.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name} ({t.cgstPct}% + {t.sgstPct}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Input {...form.register('unit')} placeholder="PCS" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">HSN Code</label>
                  <Input {...form.register('hsnCode')} placeholder="HSN code" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <Select
                    value={form.watch('gender')}
                    onValueChange={(v) => form.setValue('gender', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {['MALE', 'FEMALE', 'UNISEX', 'KIDS'].map((g) => (
                        <SelectItem key={g} value={g}>
                          {g.charAt(0) + g.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(v) => form.setValue('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.watch('gstApplicable')}
                      onChange={(e) => form.setValue('gstApplicable', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    GST Applicable
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left font-medium py-2 px-3">Color</th>
                      <th className="text-left font-medium py-2 px-3">Size</th>
                      <th className="text-left font-medium py-2 px-3">SKU</th>
                      <th className="text-left font-medium py-2 px-3">Barcode</th>
                      <th className="text-right font-medium py-2 px-3">Purchase Price</th>
                      <th className="text-right font-medium py-2 px-3">MRP</th>
                      <th className="text-right font-medium py-2 px-3">Selling Price</th>
                      <th className="text-right font-medium py-2 px-3">Opening Stock</th>
                      <th className="text-right font-medium py-2 px-3">Min Stock</th>
                      <th className="text-right font-medium py-2 px-3">Reorder Level</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-muted-foreground">
                          No variants added yet. Click "Add Variant" below.
                        </td>
                      </tr>
                    )}
                    {variants.map((v) => (
                      <tr key={v.tempId} className="border-b hover:bg-muted/30">
                        <td className="py-1.5 px-3">
                          <Select
                            value={v.colorId}
                            onValueChange={(val) => updateVariant(v.tempId, 'colorId', val)}
                          >
                            <SelectTrigger className="h-9 text-sm w-32">
                              <SelectValue placeholder="Color" />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="inline-block h-3 w-3 rounded-full border"
                                      style={{ backgroundColor: c.hexCode }}
                                    />
                                    {c.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-1.5 px-3">
                          <Select
                            value={v.sizeId}
                            onValueChange={(val) => updateVariant(v.tempId, 'sizeId', val)}
                          >
                            <SelectTrigger className="h-9 text-sm w-24">
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              {sizes.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            value={v.sku}
                            onChange={(e) => updateVariant(v.tempId, 'sku', e.target.value)}
                            placeholder="SKU"
                            className="h-9 text-sm w-32"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <div className="flex items-center gap-1">
                            <Input
                              value={v.barcode}
                              onChange={(e) => updateVariant(v.tempId, 'barcode', e.target.value)}
                              placeholder="Barcode"
                              className="h-9 text-sm font-mono w-36"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => assignBarcode(v.tempId)}
                              title="Generate barcode"
                            >
                              <Barcode className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={v.purchasePrice || ''}
                            onChange={(e) => updateVariant(v.tempId, 'purchasePrice', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-9 text-sm text-right w-28"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={v.mrp || ''}
                            onChange={(e) => updateVariant(v.tempId, 'mrp', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-9 text-sm text-right w-28"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={v.sellingPrice || ''}
                            onChange={(e) => updateVariant(v.tempId, 'sellingPrice', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-9 text-sm text-right w-28"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            value={v.openingStock || ''}
                            onChange={(e) => updateVariant(v.tempId, 'openingStock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="h-9 text-sm text-right w-24"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            value={v.minStock || ''}
                            onChange={(e) => updateVariant(v.tempId, 'minStock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="h-9 text-sm text-right w-24"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            value={v.reorderLevel || ''}
                            onChange={(e) => updateVariant(v.tempId, 'reorderLevel', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="h-9 text-sm text-right w-24"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive"
                            onClick={() => removeVariant(v.tempId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Variant
              </Button>
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/products')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="h-4 w-4 mr-1.5" />
              {submitting
                ? 'Saving...'
                : isEdit
                  ? 'Update Product'
                  : 'Create Product'}
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  )
}