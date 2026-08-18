import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Save,
  Trash2,
  Edit,
  Shield,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Role, RolePermission } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/utils'
import PageHeader from '@/components/shared/PageHeader'

const modules = [
  'DASHBOARD', 'PRODUCTS', 'INVENTORY', 'SUPPLIERS', 'PURCHASES',
  'CUSTOMERS', 'SALES', 'RETURNS', 'EXPENSES', 'REPORTS',
  'USERS', 'SETTINGS', 'STORE_CONFIG', 'AUDIT',
]

const actions = ['create', 'read', 'update', 'delete'] as const

const moduleLabels: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  PRODUCTS: 'Products',
  INVENTORY: 'Inventory',
  SUPPLIERS: 'Suppliers',
  PURCHASES: 'Purchases',
  CUSTOMERS: 'Customers',
  SALES: 'Sales',
  RETURNS: 'Returns',
  EXPENSES: 'Expenses',
  REPORTS: 'Reports',
  USERS: 'Users',
  SETTINGS: 'Settings',
  STORE_CONFIG: 'Store Config',
  AUDIT: 'Audit Logs',
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const [permMatrix, setPermMatrix] = useState<Record<string, Record<string, boolean>>>({})

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get<{ success: boolean; data: Role[] }>('/roles')
      setRoles(res.data)
      if (res.data.length > 0 && !selectedRole) {
        setSelectedRole(res.data[0].role)
      }
    } catch {
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }, [selectedRole])

  useEffect(() => { fetchRoles() }, [])

  const fetchPermissions = useCallback(async (role: string) => {
    try {
      const { data: res } = await api.get<{ success: boolean; data: RolePermission[] }>(`/permissions/${role}`)
      setPermissions(res.data)
      const matrix: Record<string, Record<string, boolean>> = {}
      for (const m of modules) {
        matrix[m] = { create: false, read: true, update: false, delete: false }
      }
      for (const p of res.data) {
        if (!matrix[p.module]) matrix[p.module] = { create: false, read: true, update: false, delete: false }
        matrix[p.module].create = p.canCreate
        matrix[p.module].read = p.canRead
        matrix[p.module].update = p.canUpdate
        matrix[p.module].delete = p.canDelete
      }
      setPermMatrix(matrix)
    } catch {
      toast.error('Failed to load permissions')
    }
  }, [])

  useEffect(() => {
    if (selectedRole) fetchPermissions(selectedRole)
  }, [selectedRole, fetchPermissions])

  const togglePerm = (mod: string, action: string) => {
    setPermMatrix(prev => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [action]: !prev[mod]?.[action],
      },
    }))
  }

  const handleSavePermissions = async () => {
    if (!selectedRole) return
    setSaving(true)
    try {
      const permList = modules.map(mod => ({
        module: mod,
        feature: 'MANAGE',
        canCreate: permMatrix[mod]?.create ?? false,
        canRead: permMatrix[mod]?.read ?? true,
        canUpdate: permMatrix[mod]?.update ?? false,
        canDelete: permMatrix[mod]?.delete ?? false,
      }))
      await api.put('/permissions', { role: selectedRole, permissions: permList })
      toast.success('Permissions updated')
      fetchPermissions(selectedRole)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.trim()) return
    try {
      await api.post('/roles', { role: newRole.toUpperCase(), description: newDesc })
      toast.success('Role created')
      setCreateOpen(false)
      setNewRole('')
      setNewDesc('')
      fetchRoles()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create role')
    }
  }

  const handleDeleteRole = async (role: string) => {
    if (!confirm(`Delete role "${role}"? This cannot be undone.`)) return
    try {
      await api.delete(`/roles/${role}`)
      toast.success('Role deleted')
      if (selectedRole === role) {
        setSelectedRole(null)
        setPermissions([])
      }
      fetchRoles()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete role')
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return
    try {
      await api.put(`/roles/${selectedRole}`, { role: selectedRole, description: editDesc })
      toast.success('Role updated')
      setEditOpen(false)
      fetchRoles()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
  }

  const selectedRoleData = roles.find(r => r.role === selectedRole)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage system roles and their permissions"
      />

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 w-fit flex-wrap">
        {roles.map((r) => (
          <button
            key={r.role}
            onClick={() => setSelectedRole(r.role)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap",
              selectedRole === r.role
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            {r.role.charAt(0) + r.role.slice(1).toLowerCase()}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{r.userCount}</Badge>
          </button>
        ))}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg text-muted-foreground hover:text-foreground transition-all whitespace-nowrap">
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role Name</label>
                <Input value={newRole} onChange={(e) => setNewRole(e.target.value.toUpperCase())} placeholder="e.g. STORE_MANAGER" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Role description" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedRole && selectedRoleData && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {selectedRoleData.role.charAt(0) + selectedRoleData.role.slice(1).toLowerCase()}
            </h2>
            <p className="text-sm text-muted-foreground">{selectedRoleData.description}</p>
            {selectedRoleData.system && (
              <Badge variant="secondary" className="text-[10px]">System</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!selectedRoleData.system && (
              <Button variant="outline" size="sm" onClick={() => handleDeleteRole(selectedRole)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSavePermissions} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </div>
      )}

      {selectedRole && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Permission Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground min-w-[140px]">Module</th>
                  {actions.map((a) => (
                    <th key={a} className="text-center px-3 py-3 font-semibold text-muted-foreground capitalize w-20">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-medium">{moduleLabels[mod] || mod}</td>
                    {actions.map((action) => {
                      const checked = permMatrix[mod]?.[action] ?? false
                      return (
                        <td key={action} className="text-center px-3 py-3">
                          <button
                            type="button"
                            onClick={() => togglePerm(mod, action)}
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-md transition-all",
                              checked
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "bg-muted/30 text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground"
                            )}
                          >
                            {checked ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
