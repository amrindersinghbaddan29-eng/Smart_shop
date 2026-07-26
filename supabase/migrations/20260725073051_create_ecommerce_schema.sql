/*
# SmartShop E-Commerce Schema

1. Purpose
- Full e-commerce platform with admin + customer roles, products, categories, cart, orders, payments, reviews, coupons, wishlist, addresses, contact messages, notifications.

2. Tables
- categories: product categories (id, name, slug, image_url, created_at)
- products: products with sku, price, discount, stock, brand, image, category_id
- customers: profile data linked to auth.users (auth-driven)
- addresses: customer shipping/billing addresses
- cart: customer cart items
- wishlist: customer wishlist
- orders: customer orders with status + total
- order_items: line items per order
- payments: payment records per order
- reviews: product reviews + ratings
- coupons: discount codes
- contact_messages: contact form submissions
- notifications: in-app notifications

3. Security
- RLS enabled on every table.
- Owner-scoped policies for customer-facing tables (cart, wishlist, orders, addresses, reviews, notifications) using auth.uid().
- Public read on products, categories, coupons (visible to browse).
- Admin-only write on products, categories, coupons (any authenticated user may insert for demo; owner check via user_id on products not enforced to keep admin flow simple — admin role is app-side).
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_manage_categories" ON categories;
CREATE POLICY "auth_manage_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  discount numeric(5,2) DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  brand text,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  availability boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_manage_products" ON products;
CREATE POLICY "auth_manage_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Customer profiles
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_customers" ON customers;
CREATE POLICY "owner_read_customers" ON customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_insert_customers" ON customers;
CREATE POLICY "owner_insert_customers" ON customers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_update_customers" ON customers;
CREATE POLICY "owner_update_customers" ON customers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_addresses" ON addresses;
CREATE POLICY "owner_read_addresses" ON addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_insert_addresses" ON addresses;
CREATE POLICY "owner_insert_addresses" ON addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_update_addresses" ON addresses;
CREATE POLICY "owner_update_addresses" ON addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_addresses" ON addresses;
CREATE POLICY "owner_delete_addresses" ON addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Cart
CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_cart" ON cart;
CREATE POLICY "owner_read_cart" ON cart FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_insert_cart" ON cart;
CREATE POLICY "owner_insert_cart" ON cart FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_update_cart" ON cart;
CREATE POLICY "owner_update_cart" ON cart FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_cart" ON cart;
CREATE POLICY "owner_delete_cart" ON cart FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_wishlist" ON wishlist;
CREATE POLICY "owner_read_wishlist" ON wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_insert_wishlist" ON wishlist;
CREATE POLICY "owner_insert_wishlist" ON wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_wishlist" ON wishlist;
CREATE POLICY "owner_delete_wishlist" ON wishlist FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  total numeric(12,2) NOT NULL,
  tax numeric(12,2) DEFAULT 0,
  shipping numeric(12,2) DEFAULT 0,
  grand_total numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  payment_method text,
  shipping_address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_orders" ON orders;
CREATE POLICY "owner_read_orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_insert_orders" ON orders;
CREATE POLICY "owner_insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_update_orders" ON orders;
CREATE POLICY "owner_update_orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  image_url text
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_order_items" ON order_items;
CREATE POLICY "owner_read_order_items" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "owner_insert_order_items" ON order_items;
CREATE POLICY "owner_insert_order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'Success',
  transaction_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_payments" ON payments;
CREATE POLICY "owner_read_payments" ON payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "owner_insert_payments" ON payments;
CREATE POLICY "owner_insert_payments" ON payments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "owner_insert_reviews" ON reviews;
CREATE POLICY "owner_insert_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_reviews" ON reviews;
CREATE POLICY "owner_delete_reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'percentage',
  value numeric(10,2) NOT NULL,
  min_order numeric(10,2) DEFAULT 0,
  expiry_date date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_manage_coupons" ON coupons;
CREATE POLICY "auth_manage_coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  replied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_contact" ON contact_messages;
CREATE POLICY "public_insert_contact" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_contact" ON contact_messages;
CREATE POLICY "auth_read_contact" ON contact_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_contact" ON contact_messages;
CREATE POLICY "auth_update_contact" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_notifications" ON notifications;
CREATE POLICY "owner_read_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "owner_insert_notifications" ON notifications;
CREATE POLICY "owner_insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "owner_update_notifications" ON notifications;
CREATE POLICY "owner_update_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
