import { Bell, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, customers..."
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm"
          />
        </div>
      </div>
      <button className="relative rounded-full p-2 hover:bg-accent">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
      </button>
    </header>
  )
}
