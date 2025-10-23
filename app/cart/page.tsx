"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { toast } from "@/hooks/use-toast"

export default function CartPage() {
  const { items, updateQty, removeItem, clear, total } = useCart()

  const handleCheckout = () => {
    // Simulate a checkout
    if (items.length === 0) {
      toast({ title: 'Cart is empty', description: 'Add items before checkout' })
      return
    }
    clear()
    toast({ title: 'Purchase complete', description: 'Thanks for your purchase!' })
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Cart</h1>

        {items.length === 0 ? (
          <div className="text-muted-foreground">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 bg-card p-3 rounded">
                <div className="w-20 h-20 bg-muted relative rounded overflow-hidden">
                  {it.img ? <Image src={it.img} alt={it.name} fill className="object-cover" /> : null}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-muted-foreground">${it.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={String(it.qty)}
                    onChange={(e) => updateQty(it.id, Math.max(0, Number(e.target.value) || 0))}
                    className="w-20"
                  />
                  <Button variant="destructive" size="sm" onClick={() => removeItem(it.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Total</div>
              <div className="text-xl font-bold">${total.toFixed(2)}</div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCheckout}>Checkout</Button>
              <Button variant="ghost" onClick={() => clear()}>
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
