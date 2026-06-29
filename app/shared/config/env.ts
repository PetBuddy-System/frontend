/**
 * Access environment variables in a type-safe way.
 * Convention: only variables prefixed with VITE_ are exposed to the client.
 *
 * When adding a new variable:
 *   1. Add it to .env.local (e.g., VITE_API_URL=http://...)
 *   2. Declare it in the ImportMetaEnv interface below
 *   3. Access it via `env.API_URL`
 */

export interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_LOCALHOST_API_URL?: string
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production'
  /** "true" de bat MSW mock. Chi dung trong moi truong dev. */
  readonly VITE_ENABLE_MOCK?: string
  // ─── API Paths ────────────────────────────────────────────────────────────
  readonly VITE_API_AUTH_PATH?: string
  readonly VITE_API_ORDERS_PATH?: string
  readonly VITE_API_PRODUCTS_PATH?: string
  readonly VITE_API_CATEGORIES_PATH?: string
  readonly VITE_API_CART_PATH?: string
  readonly VITE_API_BLOGS_PATH?: string
  readonly VITE_API_VOUCHERS_PATH?: string
  readonly VITE_API_SHIPPING_PATH?: string
  readonly VITE_API_BATCHES_PATH?: string
}

export const env = {
  // ─── Base URLs ────────────────────────────────────────────────────────────
  API_URL: import.meta.env.VITE_API_URL ?? '',
  LOCALHOST_API_URL: import.meta.env.VITE_LOCALHOST_API_URL ?? '',
  // ─── App Config ────────────────────────────────────────────────────────────
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
  /** true khi VITE_ENABLE_MOCK=true. MSW chi khoi dong khi flag nay bat. */
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === 'true',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  IS_SSR: import.meta.env.SSR,
  // ─── API Paths ─────────────────────────────────────────────────────────────
  API_AUTH_PATH: import.meta.env.VITE_API_AUTH_PATH ?? '/api/auth',
  API_ORDERS_PATH: import.meta.env.VITE_API_ORDERS_PATH ?? '/api/orders',
  API_PRODUCTS_PATH: import.meta.env.VITE_API_PRODUCTS_PATH ?? '/api/products',
  API_CATEGORIES_PATH: import.meta.env.VITE_API_CATEGORIES_PATH ?? '/api/categories',
  API_CART_PATH: import.meta.env.VITE_API_CART_PATH ?? '/api/cart',
  API_BLOGS_PATH: import.meta.env.VITE_API_BLOGS_PATH ?? '/api/blogs',
  API_VOUCHERS_PATH: import.meta.env.VITE_API_VOUCHERS_PATH ?? '/api/vouchers',
  API_SHIPPING_PATH: import.meta.env.VITE_API_SHIPPING_PATH ?? '/api/shipping-rules',
  API_BATCHES_PATH: import.meta.env.VITE_API_BATCHES_PATH ?? '/api/batches',
} as const

export type Env = typeof env

