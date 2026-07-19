import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage, writeStorage } from '~/shared/lib/storage'

type SidebarContextValue = {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleMobileSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setCollapsedState] = useState<boolean>(false)
  const [isMobileOpen, setMobileOpenState] = useState<boolean>(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStorage(STORAGE_KEYS.sidebarCollapsed)
    setCollapsedState(stored === 'true')
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeStorage(STORAGE_KEYS.sidebarCollapsed, String(isCollapsed))
  }, [hydrated, isCollapsed])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const toggleSidebar = useCallback(() => {
    setCollapsedState((prev) => !prev)
  }, [])

  const setCollapsed = useCallback((collapsed: boolean) => {
    setCollapsedState(collapsed)
  }, [])

  const openMobileSidebar = useCallback(() => {
    setMobileOpenState(true)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setMobileOpenState(false)
  }, [])

  const toggleMobileSidebar = useCallback(() => {
    setMobileOpenState((prev) => !prev)
  }, [])

  const value = useMemo<SidebarContextValue>(
    () => ({
      isCollapsed,
      isMobileOpen,
      toggleSidebar,
      setCollapsed,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar
    }),
    [isCollapsed, isMobileOpen, toggleSidebar, setCollapsed, openMobileSidebar, closeMobileSidebar, toggleMobileSidebar]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
