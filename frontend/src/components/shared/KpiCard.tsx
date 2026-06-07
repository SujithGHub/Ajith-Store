import { motion } from 'framer-motion'
import { cn } from '@/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down'
  icon?: React.ReactNode
  className?: string
  index?: number
}

export default function KpiCard({ title, value, change, trend, icon, className, index = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-200",
        "hover:shadow-lg hover:border-foreground/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' && "text-emerald-600",
                trend === 'down' && "text-red-600"
              )}>
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-muted p-2.5 text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
