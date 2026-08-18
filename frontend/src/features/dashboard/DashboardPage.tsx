import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  ShoppingCart,
  ArrowRight,
  Receipt,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils'

const kpiConfig = [
  {
    title: "Today's Sales",
    value: '₹12,450',
    change: '+12.5% vs yesterday',
    trend: 'up',
    color: 'emerald',
    icon: DollarSign,
    bgGradient: 'from-emerald-500/10 via-transparent to-transparent',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    iconGlow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    borderColor: 'hover:border-emerald-500/30'
  },
  {
    title: 'Monthly Sales',
    value: '₹3,82,400',
    change: '+8.2% vs last month',
    trend: 'up',
    color: 'indigo',
    icon: TrendingUp,
    bgGradient: 'from-indigo-500/10 via-transparent to-transparent',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    iconGlow: 'group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]',
    borderColor: 'hover:border-indigo-500/30'
  },
  {
    title: 'Stock Value',
    value: '₹28,45,000',
    change: '342 items in stock',
    trend: 'neutral',
    color: 'blue',
    icon: Package,
    bgGradient: 'from-blue-500/10 via-transparent to-transparent',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    iconGlow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    borderColor: 'hover:border-blue-500/30'
  },
  {
    title: 'Low Stock Items',
    value: '12',
    change: 'Needs reorder',
    trend: 'down',
    color: 'amber',
    icon: AlertTriangle,
    bgGradient: 'from-amber-500/10 via-transparent to-transparent',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    iconGlow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    borderColor: 'hover:border-amber-500/30'
  },
  {
    title: 'Outstanding',
    value: '₹1,24,500',
    change: '18 customers',
    trend: 'down',
    color: 'rose',
    icon: Users,
    bgGradient: 'from-rose-500/10 via-transparent to-transparent',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    iconGlow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    borderColor: 'hover:border-rose-500/30'
  }
]

const notifications = [
  { type: 'low-stock', title: 'Oxford Shirt - Red - M', message: 'Only 2 units left', variant: 'warning' as const },
  { type: 'low-stock', title: 'Casual Jeans - Blue - 32', message: 'Only 1 unit left', variant: 'warning' as const },
  { type: 'pending', title: 'Pending Payment - RM Textiles', message: '₹ 45,000 due since 3 days', variant: 'destructive' as const },
  { type: 'credit', title: 'Credit Limit - Kumar & Co', message: 'Exceeded by ₹ 12,000', variant: 'destructive' as const },
]

const chartData = [
  { day: 'Mon', revenue: 15450, cost: 9200 },
  { day: 'Tue', revenue: 19620, cost: 11050 },
  { day: 'Wed', revenue: 18570, cost: 9800 },
  { day: 'Thu', revenue: 22400, cost: 13100 },
  { day: 'Fri', revenue: 21000, cost: 11800 },
  { day: 'Sat', revenue: 25800, cost: 14200 },
  { day: 'Sun', revenue: 28450, cost: 15600 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-background/95 backdrop-blur-md p-4 shadow-xl border-border/80 min-w-[155px]">
        <p className="text-xs font-bold text-foreground mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((pld: any) => (
            <div key={pld.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pld.stroke || pld.color }} />
                <span className="text-[11px] text-muted-foreground">{pld.name}</span>
              </div>
              <span className="text-xs font-bold text-foreground">
                ₹{pld.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Greeting and Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
            {greeting}, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's a snapshot of Ajith Store's performance today.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 self-start md:self-auto">
          {['Today', 'This Week', 'This Month'].map((period, index) => (
            <Button
              key={period}
              variant={index === 0 ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 text-xs font-semibold rounded-lg px-4 transition-all duration-200",
                index === 0 ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {kpiConfig.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300",
              "hover:shadow-md hover:-translate-y-0.5",
              kpi.borderColor
            )}
          >
            {/* Hover Background Glow */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none", kpi.bgGradient)} />

            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Top Row: Title & Icon */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">{kpi.title}</p>
                <div className={cn("rounded-lg p-1.5 shrink-0 transition-all duration-300 group-hover:scale-105", kpi.iconBg, kpi.iconGlow)}>
                  <kpi.icon className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Bottom Section: Value & Change */}
              <div className="mt-4 space-y-1">
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight whitespace-nowrap text-foreground">
                  {kpi.value}
                </p>

                {kpi.change && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {kpi.trend === 'up' && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        <ArrowUpRight className="h-2.5 w-2.5" /> {kpi.change.split(' ')[0]}
                      </span>
                    )}
                    {kpi.trend === 'down' && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        <ArrowDownRight className="h-2.5 w-2.5" /> {kpi.change.split(' ')[0]}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground font-semibold truncate">
                      {kpi.trend !== 'neutral' ? kpi.change.substring(kpi.change.indexOf(' ') + 1) : kpi.change}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'New Sale', icon: ShoppingCart, desc: 'Create billing invoice', color: 'indigo', path: '/billing' },
          { label: 'New Purchase', icon: Receipt, desc: 'Add purchase order or GRN', color: 'blue', path: '/purchases' },
          { label: 'Add Customer', icon: UserPlus, desc: 'Register new customer profile', color: 'emerald', path: '/customers' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-5 text-left transition-all duration-300",
              "hover:shadow-md hover:border-primary/20"
            )}
          >
            {/* Background Blur Glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-xl transition-all duration-500 group-hover:scale-150" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <action.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-muted-foreground/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-muted/20 bg-muted/5">
              <div>
                <CardTitle className="text-base font-semibold">Revenue & Cost Analysis</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Visual representation of store performance</p>
              </div>
              <select className="text-xs font-semibold border border-border/80 bg-background rounded-lg px-2.5 py-1.5 text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.15} stroke="currentColor" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      name="Purchases"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCost)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-muted/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#6366f1]" />
                  <span className="text-xs font-semibold">Revenue (Sales)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-xs font-semibold">Purchases (Cost)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Notifications / Live Alerts */}
          <Card className="border-muted-foreground/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3 border-b border-muted/20 bg-muted/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Live Alerts</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Critical inventory and payment alerts</p>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                {notifications.length} Active
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[280px] px-4 py-4">
                <div className="space-y-3">
                  {notifications.map((n, i) => {
                    let alertColorClass = ''
                    let iconBg = ''
                    let alertIcon = null

                    if (n.variant === 'warning') {
                      alertColorClass = 'border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
                      iconBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      alertIcon = <AlertTriangle className="h-4 w-4" />
                    } else if (n.variant === 'destructive') {
                      alertColorClass = 'border-l-rose-500 bg-rose-500/5 hover:bg-rose-500/10'
                      iconBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      alertIcon = <AlertTriangle className="h-4 w-4" />
                    }

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "rounded-xl border border-l-4 p-3.5 space-y-1 transition-all duration-200 cursor-pointer flex gap-3 items-start",
                          alertColorClass
                        )}
                      >
                        <div className={cn("rounded-lg p-2 shrink-0 mt-0.5", iconBg)}>
                          {alertIcon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-muted-foreground/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-muted/20 bg-muted/5">
              <div>
                <CardTitle className="text-base font-semibold">Top Performing Products</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Most sold products this month</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 px-2 hover:bg-muted">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { name: 'Oxford Shirt', sales: '142 units', amount: '₹ 1,42,000', percentage: 80, badgeColor: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
                  { name: 'Casual Jeans', sales: '98 units', amount: '₹ 1,17,600', percentage: 65, badgeColor: 'bg-slate-400/15 text-slate-600 dark:text-slate-400 border-slate-400/30' },
                  { name: 'Printed Kurti', sales: '76 units', amount: '₹ 76,000', percentage: 45, badgeColor: 'bg-amber-600/15 text-amber-700 dark:text-amber-500 border-amber-500/30' },
                  { name: 'Silk Saree', sales: '45 units', amount: '₹ 1,12,500', percentage: 55, badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold", item.badgeColor)}>
                          {i + 1}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sales}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-foreground tabular-nums">{item.amount}</span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
                        className={cn(
                          "h-full rounded-full",
                          i === 0 ? "bg-yellow-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-600" : "bg-indigo-500"
                        )}
                      />
                    </div>
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

