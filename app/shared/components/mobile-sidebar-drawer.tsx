import { useEffect, useRef } from 'react'

import { useSidebar } from '~/providers/sidebar-provider'
import { cn } from '~/shared/lib/cn'

interface MobileSidebarDrawerProps {
  children: React.ReactNode
  className?: string
}

export function MobileSidebarDrawer({ children, className }: MobileSidebarDrawerProps) {
  const { isMobileOpen, closeMobileSidebar } = useSidebar()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobileSidebar()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileOpen, closeMobileSidebar])

  if (!isMobileOpen) return null

  return (
    <>
      <div
        className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden'
        onClick={closeMobileSidebar}
        aria-hidden='true'
      />
      <div
        ref={drawerRef}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-card shadow-2xl transition-transform duration-300 ease-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        role='dialog'
        aria-modal='true'
      >
        {children}
      </div>
    </>
  )
}
