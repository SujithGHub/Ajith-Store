import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Scan,
  Trash2,
  Plus,
  Minus,
  User,
  Percent,
  Printer,
  DollarSign,
  CreditCard,
  Smartphone,
  Landmark,
  X,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/utils'

interface CartItem {
  id: string
  name: string
  color: string
  size: string
  barcode: string
  price: number
  quantity: number
}

const dummyProducts = [
  { id: '1', name: 'Oxford Shirt', color: 'White', size: 'M', barcode: '890123456789', price: 1299 },
  { id: '2', name: 'Oxford Shirt', color: 'Blue', size: 'L', barcode: '890123456790', price: 1299 },
  { id: '3', name: 'Casual Jeans', color: 'Blue', size: '32', barcode: '890123456791', price: 1899 },
  { id: '4', name: 'Formal Trousers', color: 'Black', size: '34', barcode: '890123456792', price: 1599 },
  { id: '5', name: 'Printed Kurti', color: 'Pink', size: 'M', barcode: '890123456793', price: 899 },
  { id: '6', name: 'Silk Saree', color: 'Red', size: 'Free', barcode: '890123456794', price: 3499 },
  { id: '7', name: 'Casual Shirt', color: 'Grey', size: 'XL', barcode: '890123456795', price: 999 },
  { id: '8', name: 'T-Shirt', color: 'Black', size: 'L', barcode: '890123456796', price: 599 },
]

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: DollarSign },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'credit', label: 'Credit', icon: Landmark },
]

export default function BillingPage() {
  const [search, setSearch] = useState('')
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')

  const filteredProducts = dummyProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  )

  const addToCart = (product: typeof dummyProducts[0]) => {
    const existing = cart.find((item) => item.barcode === product.barcode)
    if (existing) {
      setCart(cart.map((item) =>
        item.barcode === product.barcode
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, id: crypto.randomUUID(), quantity: 1 }])
    }
  }

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter((item) => item.quantity > 0))
  }

  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = dummyProducts.find((p) => p.barcode === barcode)
    if (found) addToCart(found)
    setBarcode('')
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 -m-6 lg:-m-8">
      {/* Left - Product selection */}
      <div className="flex w-[400px] flex-col border-r bg-card p-4">
        <div className="space-y-3">
          {/* Barcode input */}
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <Scan className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan barcode..."
              className="h-12 pl-10 text-lg font-mono"
              autoFocus
            />
          </form>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-10 pl-10"
            />
          </div>
        </div>

        {/* Product grid */}
        <ScrollArea className="flex-1 mt-4">
          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="rounded-xl border bg-background p-3 text-left transition-colors hover:border-foreground/30"
              >
                <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium leading-tight">{product.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">{product.color}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{product.size}</span>
                </div>
                <p className="text-sm font-semibold mt-1">{formatCurrency(product.price)}</p>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center - Cart */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Sale Invoice <span className="text-muted-foreground font-normal">#1001</span>
            </h2>
          </div>
          {cart.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCart([])}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4">
          <AnimatePresence>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="rounded-2xl bg-muted p-6 mb-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Cart is empty</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Scan barcode or search products to add items
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 rounded-xl border bg-card p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.color}</span>
                        <span>·</span>
                        <span>{item.size}</span>
                        <span>·</span>
                        <span className="font-mono">{item.barcode.slice(-6)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="rounded-lg border p-1 hover:bg-accent"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="rounded-lg border p-1 hover:bg-accent"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold w-20 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg p-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>

      {/* Right - Summary */}
      <div className="flex w-[320px] flex-col border-l bg-card p-4">
        {/* Customer */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            Customer
          </div>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Walk-in Customer</option>
            <option value="1">Rajesh Kumar</option>
            <option value="2">Priya Sharma</option>
            <option value="3">Amit Singh</option>
          </select>
        </div>

        <Separator className="my-4" />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-emerald-600">—</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Payment */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                    selectedPayment === method.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'hover:border-foreground/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {method.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-auto space-y-2 pt-4">
          <Button
            size="xl"
            className="w-full gap-2 text-base"
            disabled={cart.length === 0}
          >
            <DollarSign className="h-5 w-5" />
            Pay {formatCurrency(total)}
          </Button>
          <Button variant="outline" size="lg" className="w-full gap-2" disabled={cart.length === 0}>
            <Printer className="h-4 w-4" />
            Hold for Later
          </Button>
        </div>
      </div>
    </div>
  )
}
