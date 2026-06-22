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
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production'
  readonly VITE_LOCALHOST_API_URL?: string
  /** "true" de bat MSW mock. Chi dung trong moi truong dev. */
  readonly VITE_ENABLE_MOCK?: string
}

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? '',
  LOCALHOST_API_URL: import.meta.env.VITE_LOCALHOST_API_URL ?? '',
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
  /** true khi VITE_ENABLE_MOCK=true. MSW chi khoi dong khi flag nay bat. */
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === 'true',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  IS_SSR: import.meta.env.SSR
} as const

export type Env = typeof env

