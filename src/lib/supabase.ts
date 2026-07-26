import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Product = {
  id: string
  name: string
  sku: string
  description: string
  price: number
  discount: number
  stock: number
  brand: string
  image_url: string
  category_id: string
  availability: boolean
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  image_url: string
  created_at: string
}

export type CartItem = {
  id: string
  product_id: string
  quantity: number
  product: Product
}

export type Order = {
  id: string
  order_number: string
  total: number
  tax: number
  shipping: number
  grand_total: number
  status: string
  payment_method: string
  shipping_address: string
  created_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
}

export type Address = {
  id: string
  full_name: string
  phone: string
  address_line: string
  city: string
  state: string
  pincode: string
  is_default: boolean
}

export type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  approved: boolean
  created_at: string
}

export type Coupon = {
  id: string
  code: string
  type: string
  value: number
  min_order: number
  expiry_date: string
  active: boolean
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  replied: boolean
  created_at: string
}

export type Notification = {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}
