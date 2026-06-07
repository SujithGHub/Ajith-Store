import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PackageSearch,
  Truck,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/inventory', icon: PackageSearch, label: 'Inventory' },
  { to: '/purchases', icon: ShoppingCart, label: 'Purchases' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/billing', icon: FileText, label: 'Billing' },
  { to: '/expenses', icon: Wallet, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300 z-10",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className={cn(
        "flex h-14 items-center border-b",
        collapsed ? "justify-center" : "gap-2.5 px-4"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Store className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">Ajith Store</span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-md text-sm font-medium transition-colors',
                collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn("shrink-0", collapsed ? "h-4.5 w-4.5" : "h-4 w-4")} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <Separator />

      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
