import { AuthProvider } from './auth-provider'
import { I18nProvider } from './i18n-provider'
import { ThemeProvider } from './theme-provider'
import { SidebarProvider } from './sidebar-provider'

/**
 * Compose tất cả provider cấp ứng dụng. Dùng đúng 1 lần ở root.tsx.
 * Khi thêm provider mới (vd: QueryClientProvider, ToastProvider)
 * gắn ở đây — KHÔNG gắn rải rác ở route con.
 *
 * Thứ tự lồng provider quan trọng: provider phụ thuộc vào cái nào thì
 * đặt cái đó ra ngoài. AuthProvider bọc ngoài cùng để các provider
 * con có thể dùng useAuth() nếu cần.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export { themeInitScript } from './theme-provider'
