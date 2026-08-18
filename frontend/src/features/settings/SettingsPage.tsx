import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, Store, FileText, Palette, Building2, Mail, Phone, MapPin, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { StoreConfig } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/shared/PageHeader'
import { cn } from '@/utils'

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'invoice', label: 'Invoice', icon: FileText },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function SettingsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const [activeTab, setActiveTab] = useState('general')
  const [config, setConfig] = useState<StoreConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    storeName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    logoPath: '',
    invoiceHeader: '',
    invoiceFooter: '',
    currency: 'INR',
    taxEnabled: true,
    roundOffEnabled: true,
  })

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: StoreConfig }>('/store-config')
      const c = res.data
      setConfig(c)
      setForm({
        storeName: c.storeName || '',
        address: c.address || '',
        phone: c.phone || '',
        email: c.email || '',
        gstNumber: c.gstNumber || '',
        logoPath: c.logoPath || '',
        invoiceHeader: c.invoiceHeader || '',
        invoiceFooter: c.invoiceFooter || '',
        currency: c.currency || 'INR',
        taxEnabled: c.taxEnabled,
        roundOffEnabled: c.roundOffEnabled,
      })
    } catch {
      toast.error('Failed to load store configuration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.put('/store-config', form)
      toast.success('Store configuration updated')
      fetchConfig()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your store configuration"
      />

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Store Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={form.storeName}
                      onChange={(e) => updateField('storeName', e.target.value)}
                      className="pl-9"
                      placeholder="Ajith Store"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="pl-9"
                      placeholder="Store address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="pl-9"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="pl-9"
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GST Number</label>
                  <Input
                    value={form.gstNumber}
                    onChange={(e) => updateField('gstNumber', e.target.value)}
                    placeholder="GSTIN"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Tax (GST)</p>
                    <p className="text-xs text-muted-foreground">Calculate tax on billing automatically</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.taxEnabled}
                      onChange={(e) => updateField('taxEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Round Off</p>
                    <p className="text-xs text-muted-foreground">Round off total amount to nearest integer</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.roundOffEnabled}
                      onChange={(e) => updateField('roundOffEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'invoice' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Header</label>
                  <textarea
                    value={form.invoiceHeader}
                    onChange={(e) => updateField('invoiceHeader', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Custom header text for invoices"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Footer</label>
                  <textarea
                    value={form.invoiceFooter}
                    onChange={(e) => updateField('invoiceFooter', e.target.value)}
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Custom footer text for invoices"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo Path</label>
                  <Input
                    value={form.logoPath}
                    onChange={(e) => updateField('logoPath', e.target.value)}
                    placeholder="/logos/store-logo.png"
                  />
                  <p className="text-xs text-muted-foreground">Upload logo via the uploads directory</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-end mt-6">
          {!isAdmin && (
            <div className="flex items-center gap-2 mr-auto text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
              Only admins can modify settings
            </div>
          )}
          <Button type="submit" disabled={saving || !isAdmin}>
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
