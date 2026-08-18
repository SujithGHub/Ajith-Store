import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Store, Eye, EyeOff, Loader2, Package, FileText, BarChart3, Truck } from 'lucide-react'

const features = [
  { icon: Package, label: 'Inventory Management' },
  { icon: FileText, label: 'GST Billing' },
  { icon: Truck, label: 'Purchase Management' },
  { icon: BarChart3, label: 'Sales Analytics' },
]

const demoAccounts = [
  { role: 'Admin', user: 'admin', pass: 'admin123' },
  { role: 'Manager', user: 'manager', pass: 'admin123' },
  { role: 'Cashier', user: 'cashier', pass: 'admin123' },
]

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login({ username, password })
      navigate('/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.message
      if (message?.toLowerCase().includes('disabled')) {
        setError('This account has been disabled. Contact your administrator.')
      } else if (message?.toLowerCase().includes('locked')) {
        setError('Account is locked due to too many failed attempts. Try again later.')
      } else {
        setError(message || 'Invalid username or password')
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-zinc-950 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col justify-between p-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">Ajith Store</span>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold tracking-tight text-white">
                Textile retail,<br />
                <span className="text-zinc-400">simplified.</span>
              </h1>
              <p className="max-w-md text-base text-zinc-400 leading-relaxed">
                Complete clothing store management with inventory, billing, purchases,
                customers, GST, and analytics — all in one place.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm text-zinc-300"
                >
                  <f.icon className="h-3.5 w-3.5" />
                  {f.label}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-zinc-700"
          >
            &copy; 2026 Ajith Store. All rights reserved.
          </motion.p>
        </div>
      </motion.div>

      {/* Right — Login form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-1 items-center justify-center bg-white p-8"
      >
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Ajith Store</span>
          </motion.div>

          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold tracking-tight"
            >
              Welcome back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-muted-foreground"
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-11 transition-all focus:ring-2 focus:ring-foreground"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => toast('Password reset not available yet. Contact administrator.', { icon: '🔒' })}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 pr-10 transition-all focus:ring-2 focus:ring-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base transition-all"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Demo credentials</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => {
                    setUsername(d.user)
                    setPassword(d.pass)
                  }}
                  className="rounded-lg border bg-muted/30 p-2.5 text-center transition-all hover:border-foreground/30 hover:bg-muted/50 space-y-0.5"
                >
                  <p className="text-xs font-semibold">{d.role}</p>
                  <p className="text-xs text-muted-foreground font-mono">{d.user}</p>
                </button>
              ))}
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}
