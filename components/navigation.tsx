"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusSquare, MessageCircle, User, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const { items } = useCart()

  const links = [
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/shop", icon: PlusSquare, label: "Shop" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/cart", icon: ShoppingCart, label: "Cart" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:top-0 md:bottom-auto">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around md:justify-between h-20 md:h-16">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dark Chat
            </h1>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-around md:justify-end">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-colors relative",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-7 h-7 md:w-6 md:h-6" />
                  <span className="text-xs md:text-sm hidden sm:inline">{link.label}</span>
                  {link.href === '/cart' && items.length > 0 ? (
                    <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-primary rounded-full">
                      {items.reduce((s, it) => s + it.qty, 0)}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
