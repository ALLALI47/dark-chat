"use client"

import { Navigation } from "@/components/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"

const categories = [
  {
    id: 'drinks',
    title: 'مشروب غازي',
    items: [
      { id: 'coca', name: 'Coca-Cola', price: 1.5, img: '/placeholder.svg' },
      { id: 'pepsi', name: 'Pepsi', price: 1.4, img: '/placeholder.svg' },
      { id: 'fanta', name: 'Fanta', price: 1.3, img: '/placeholder.svg' },
    ],
  },
  {
    id: 'sweets',
    title: 'حلوى',
    items: [
      { id: 'choco', name: 'Chocolate Bar', price: 0.9, img: '/placeholder.svg' },
      { id: 'cookie', name: 'Cookie Pack', price: 1.2, img: '/placeholder.svg' },
      { id: 'gum', name: 'Gum Pack', price: 0.5, img: '/placeholder.svg' },
    ],
  },
  {
    id: 'global',
    title: 'International Picks',
    items: [
      { id: 'sushi', name: 'Sushi Box', price: 8.5, img: '/placeholder.svg' },
      { id: 'ramen', name: 'Ramen Bowl', price: 6.0, img: '/placeholder.svg' },
      { id: 'taco', name: 'Taco Set', price: 5.5, img: '/placeholder.svg' },
    ],
  },
]

export default function ShopPage() {
  const cart = useCart()
  const router = useRouter()

  const handleAdd = (it: { id: string; name: string; price: number; img?: string }) => {
    cart.addItem({ id: it.id, name: it.name, price: it.price, img: it.img })
  }

  const handleBuyNow = (it: { id: string; name: string; price: number; img?: string }) => {
    cart.addItem({ id: it.id, name: it.name, price: it.price, img: it.img })
    router.push('/cart')
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Shop</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <section key={cat.id} className="bg-card border border-border rounded-lg p-4">
              <h2 className="font-semibold mb-3">{cat.title}</h2>
              <div className="space-y-3">
                {cat.items.map((it) => (
                  <div key={it.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="w-full sm:w-16 h-40 sm:h-16 bg-muted rounded overflow-hidden relative flex-shrink-0">
                      <Image src={it.img} alt={it.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-semibold">{it.name}</div>
                          <div className="text-sm text-muted-foreground">{it.id}</div>
                        </div>
                        <div className="text-right mt-3 sm:mt-0">
                          <div className="font-semibold">${it.price.toFixed(2)}</div>
                          <div className="mt-2 flex flex-col sm:flex-row gap-2 justify-end">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleAdd(it)}>
                              Add to Cart
                            </Button>
                            <Button size="sm" className="w-full sm:w-auto" onClick={() => handleBuyNow(it)}>
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
