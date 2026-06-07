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
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import KpiCard from '@/components/shared/KpiCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const kpis = [
  { title: "Today's Sales", value: '₹ 12,450', change: '+12.5% vs yesterday', trend: 'up' as const, icon: <DollarSign className="h-5 w-5" /> },
  { title: 'Monthly Sales', value: '₹ 3,82,400', change: '+8.2% vs last month', trend: 'up' as const, icon: <TrendingUp className="h-5 w-5" /> },
  { title: 'Stock Value', value: '₹ 28,45,000', change: '342 items in stock', icon: <Package className="h-5 w-5" /> },
  { title: 'Low Stock Items', value: '12', change: 'Needs reorder', trend: 'down' as const, icon: <AlertTriangle className="h-5 w-5" /> },
  { title: 'Outstanding', value: '₹ 1,24,500', change: '18 customers', trend: 'down' as const, icon: <Users className="h-5 w-5" /> },
]

const quickActions = [
  { label: 'New Sale', icon: ShoppingCart, color: 'bg-foreground text-background' },
  { label: 'New Purchase', icon: Plus, color: 'bg-foreground text-background' },
  { label: 'Add Customer', icon: Users, color: 'bg-muted text-foreground' },
]

const notifications = [
  { type: 'low-stock', title: 'Oxford Shirt - Red - M', message: 'Only 2 units left', variant: 'warning' as const },
  { type: 'low-stock', title: 'Casual Jeans - Blue - 32', message: 'Only 1 unit left', variant: 'warning' as const },
  { type: 'pending', title: 'Pending Payment - RM Textiles', message: '₹ 45,000 due since 3 days', variant: 'destructive' as const },
  { type: 'credit', title: 'Credit Limit - Kumar & Co', message: 'Exceeded by ₹ 12,000', variant: 'destructive' as const },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your store performance"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="sm">This Week</Button>
            <Button variant="outline" size="sm">This Month</Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue chart card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
              <select className="text-sm border-0 bg-transparent text-muted-foreground focus:outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] flex items-end gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const h = 40 + Math.random() * 160
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="flex-1 rounded-md bg-gradient-to-t from-foreground/80 to-foreground/20"
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-6 transition-colors hover:border-foreground/30 ${action.color}`}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] px-6 pb-4">
                <div className="space-y-3">
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Top Products</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                    <span className="text-sm font-medium">{item.amount}</span>
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
