import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from './auth-provider'
import { I18nProvider } from './i18n-provider'
import { ThemeProvider } from './theme-provider'
import { SidebarProvider } from './sidebar-provider'
import { CartProvider } from './cart-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dữ liệu được coi là "fresh" trong 60 giây — tránh refetch liên tục
      staleTime: 60 * 1000,
      // Giữ cache 5 phút sau khi không còn subscriber
      gcTime: 5 * 60 * 1000,
      // Không retry khi lỗi auth (401/403)
      retry: false,
    },
  },
})

/**
 * Compose tất cả provider cấp ứng dụng. Dùng đúng 1 lần ở root.tsx.
 * Khi thêm provider mới (vd: ToastProvider)
 * gắn ở đây — KHÔNG gắn rải rác ở route con.
 *
 * Thứ tự lồng provider quan trọng: provider phụ thuộc vào cái nào thì
 * đặt cái đó ra ngoài. QueryClientProvider bọc ngoài cùng để AuthProvider
 * (và các provider khác) có thể dùng useQuery nếu cần.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <I18nProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </I18nProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}


export { themeInitScript } from './theme-provider'
