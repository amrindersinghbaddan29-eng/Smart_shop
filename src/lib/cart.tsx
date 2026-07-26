import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type CartItem } from './supabase'
import { useAuth } from './auth'

type CartContextType = {
  items: CartItem[]
  loading: boolean
  refresh: () => Promise<void>
  add: (productId: string, quantity?: number) => Promise<void>
  update: (itemId: string, quantity: number) => Promise<void>
  remove: (itemId: string) => Promise<void>
  clear: () => Promise<void>
  count: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  refresh: async () => {},
  add: async () => {},
  update: async () => {},
  remove: async () => {},
  clear: async () => {},
  count: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    if (!user) { setItems([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('cart')
      .select('id, product_id, quantity, product:products(*)')
      .eq('user_id', user.id)
    setItems((data || []) as unknown as CartItem[])
    setLoading(false)
  }

  const add = async (productId: string, quantity = 1) => {
    if (!user) return
    const existing = items.find(i => i.product_id === productId)
    if (existing) {
      await supabase.from('cart').update({ quantity: existing.quantity + quantity }).eq('id', existing.id)
    } else {
      await supabase.from('cart').insert({ user_id: user.id, product_id: productId, quantity })
    }
    await refresh()
  }

  const update = async (itemId: string, quantity: number) => {
    if (quantity < 1) return
    await supabase.from('cart').update({ quantity }).eq('id', itemId)
    await refresh()
  }

  const remove = async (itemId: string) => {
    await supabase.from('cart').delete().eq('id', itemId)
    await refresh()
  }

  const clear = async () => {
    if (!user) return
    await supabase.from('cart').delete().eq('user_id', user.id)
    await refresh()
  }

  useEffect(() => {
    refresh()
  }, [user])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, refresh, add, update, remove, clear, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
