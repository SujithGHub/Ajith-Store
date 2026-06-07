import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  ShoppingCart,
  Plus,
  ArrowRight,
  Receipt,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import PageHeader from '@/components/shared/PageHeader'
import KpiCard from '@/components/shared/KpiCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils'

const kpis = [
  { title: "Today's Sales", value: '₹ 12,450', change: '+12.5% vs yesterday', trend: 'up' as const, icon: <DollarSign className="h-5 w-5" /> },
  { title: 'Monthly Sales', value: '₹ 3,82,400', change: '+8.2% vs last month', trend: 'up' as const, icon: <TrendingUp className="h-5 w-5" /> },
  { title: 'Stock Value', value: '₹ 28,45,000', change: '342 items in stock', icon: <Package className="h-5 w-5" /> },
  { title: 'Low Stock Items', value: '12', change: 'Needs reorder', trend: 'down' as const, icon: <AlertTriangle className="h-5 w-5" /> },
  { title: 'Outstanding', value: '₹ 1,24,500', change: '18 customers', trend: 'down' as const, icon: <Users className="h-5 w-5" /> },
]

const notifications = [
  { type: 'low-stock', title: 'Oxford Shirt - Red - M', message: 'Only 2 units left', variant: 'warning' as const },
  { type: 'low-stock', title: 'Casual Jeans - Blue - 32', message: 'Only 1 unit left', variant: 'warning' as const },
  { type: 'pending', title: 'Pending Payment - RM Textiles', message: '₹ 45,000 due since 3 days', variant: 'destructive' as const },
  { type: 'credit', title: 'Credit Limit - Kumar & Co', message: 'Exceeded by ₹ 12,000', variant: 'destructive' as const },
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardPage() {
  const { user } = useAuthStore()

  const barHeights = useMemo(
    () => Array.from({ length: 7 }).map(() => 40 + Math.random() * 160),
    []
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {user?.fullName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening at your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Today</Button>
          <Button variant="outline" size="sm">This Week</Button>
          <Button variant="outline" size="sm">This Month</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'New Sale', icon: ShoppingCart, desc: 'Create invoice' },
          { label: 'New Purchase', icon: Receipt, desc: 'Add PO or GRN' },
          { label: 'Add Customer', icon: UserPlus, desc: 'Register new customer' },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue bar chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
              <select className="text-sm border-0 bg-transparent text-muted-foreground focus:outline-none cursor-pointer">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] flex items-end gap-2">
                {barHeights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      ₹{(h * 100).toLocaleString()}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
                      className="w-full rounded-sm bg-gradient-to-t from-primary/80 to-primary/30"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {days.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[260px] px-4 pb-4">
                <div className="space-y-2">
                  {notifications.map((n, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-lg border p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={n.variant} className="h-1.5 w-1.5 rounded-full p-0" />
                        <p className="text-sm font-medium">{n.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Top products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-medium">Top Products</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Oxford Shirt', sales: '142 units', amount: '₹ 1,42,000' },
                  { name: 'Casual Jeans', sales: '98 units', amount: '₹ 1,17,600' },
                  { name: 'Printed Kurti', sales: '76 units', amount: '₹ 76,000' },
                  { name: 'Silk Saree', sales: '45 units', amount: '₹ 1,12,500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sales}</p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{item.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
