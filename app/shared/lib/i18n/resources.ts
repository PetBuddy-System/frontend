import enAdmin from '~/locales/en/admin.json'
import enAuth from '~/locales/en/auth.json'
import enBlog from '~/locales/en/blog.json'
import enCommon from '~/locales/en/common.json'
import enLanding from '~/locales/en/landing.json'
import enManager from '~/locales/en/manager.json'
import enProducts from '~/locales/en/products.json'
import enProfile from '~/locales/en/profile.json'
import enServices from '~/locales/en/services.json'
import enStaff from '~/locales/en/staff.json'
import enWelcome from '~/locales/en/welcome.json'
import viAdmin from '~/locales/vi/admin.json'
import viAuth from '~/locales/vi/auth.json'
import viBlog from '~/locales/vi/blog.json'
import viCommon from '~/locales/vi/common.json'
import viLanding from '~/locales/vi/landing.json'
import viManager from '~/locales/vi/manager.json'
import viProducts from '~/locales/vi/products.json'
import viProfile from '~/locales/vi/profile.json'
import viServices from '~/locales/vi/services.json'
import viStaff from '~/locales/vi/staff.json'
import viWelcome from '~/locales/vi/welcome.json'

/**
 * Tập hợp tài nguyên i18n. Mỗi feature 1 namespace riêng để:
 * - Tránh đè key giữa các feature.
 * - Sau này dễ chuyển sang lazy-load (mỗi namespace 1 file riêng).
 *
 * Khi thêm namespace mới:
 *   1. Tạo locales/{en,vi}/<feature>.json
 *   2. Import + thêm vào object dưới
 *   3. Thêm tên namespace vào NAMESPACES
 */

export const NAMESPACES = [
  'blog',
  'common',
  'welcome',
  'landing',
  'auth',
  'products',
  'profile',
  'services',
  'staff',
  'manager',
  'admin'
] as const
export type Namespace = (typeof NAMESPACES)[number]

export const DEFAULT_NAMESPACE: Namespace = 'common'

export const resources = {
  en: {
    admin: enAdmin,
    auth: enAuth,
    blog: enBlog,
    common: enCommon,
    landing: enLanding,
    manager: enManager,
    products: enProducts,
    profile: enProfile,
    services: enServices,
    staff: enStaff,
    welcome: enWelcome
  },
  vi: {
    admin: viAdmin,
    auth: viAuth,
    blog: viBlog,
    common: viCommon,
    landing: viLanding,
    manager: viManager,
    products: viProducts,
    profile: viProfile,
    services: viServices,
    staff: viStaff,
    welcome: viWelcome
  }
} as const

export const SUPPORTED_LANGUAGES = ['en', 'vi'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const FALLBACK_LANGUAGE: Language = 'vi'
