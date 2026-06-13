import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage, writeStorage } from '~/shared/lib/storage'

type SidebarContextValue = {
  isCollapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setCollapsedState] = useState<boolean>(false)
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

  const toggleSidebar = useCallback(() => {
    setCollapsedState((prev) => !prev)
  }, [])

  const setCollapsed = useCallback((collapsed: boolean) => {
    setCollapsedState(collapsed)
  }, [])

  const value = useMemo<SidebarContextValue>(
    () => ({
      isCollapsed,
      toggleSidebar,
      setCollapsed
    }),
    [isCollapsed, toggleSidebar, setCollapsed]
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
