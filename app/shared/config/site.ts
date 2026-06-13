/**
 * Hằng số cấp ứng dụng dùng chung. Thay đổi tên thương hiệu / link
 * mạng xã hội tại đây thay vì rải rác trong component.
 */

export const SITE = {
  name: 'PetBuddy',
  shortName: 'PetBuddy',
  description: 'Modern pet care commerce platform',
  url: 'https://petbuddy.example.com',
  defaultLocale: 'vi' as const
} as const

/** Các key dùng cho localStorage, gom một chỗ để tránh typo. */
export const STORAGE_KEYS = {
  theme: 'petbuddy-theme',
  language: 'petbuddy-lang',
  sidebarCollapsed: 'petbuddy-sidebar-collapsed'
} as const
