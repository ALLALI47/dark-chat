"use client"

import * as React from "react"
import { toast } from "@/hooks/use-toast"

export type CartItem = {
  id: string
  name: string
  price: number
  img?: string
  qty: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  removeItem: (id: string) => void
  clear: () => void
  updateQty: (id: string, qty: number) => void
  total: number
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'darkChatCart'

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CartItem[]
  } catch (e) {
    return []
  }
}

function writeStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    // ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    return readStorage()
  })

  React.useEffect(() => {
    writeStorage(items)
  }, [items])

  const addItem = (item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((s) => {
      const found = s.find((x) => x.id === item.id)
      let next: CartItem[]
      if (found) {
        next = s.map((x) => (x.id === item.id ? { ...x, qty: x.qty + qty } : x))
      } else {
        next = [...s, { ...item, qty }]
      }
      toast({ title: 'Added to cart', description: `${item.name} x${qty}` })
      return next
    })
  }

  const removeItem = (id: string) => {
    setItems((s) => s.filter((x) => x.id !== id))
  }

  const clear = () => {
    setItems([])
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id)
    setItems((s) => s.map((x) => (x.id === id ? { ...x, qty } : x)))
  }

  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, updateQty, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
