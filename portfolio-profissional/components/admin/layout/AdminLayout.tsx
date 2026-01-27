"use client"

import { useState, useEffect, Suspense } from "react"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { ThemeProvider } from "@/lib/context/ThemeContext"
import { AccessibilityProvider } from "@/lib/context/AccessibilityContext"
import { I18nProvider } from "@/lib/context/I18nContext"
import { KeyboardShortcutsModal } from "../KeyboardShortcutsModal"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { SkipLink } from "@/components/ui/skip-link"
import { useKeyboardShortcuts, createDashboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"
import { useDashboardAnalytics } from "@/lib/hooks/useDashboardAnalytics"
import { usePerformance } from "@/hooks/use-performance"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const router = useRouter()
  const { trackAction, refreshStats } = useDashboardAnalytics()
  const { measureInteraction } = usePerformance('AdminLayout')

  // Define keyboard shortcuts for the dashboard
  const shortcuts = createDashboardShortcuts({
    save: () => {
      const endMeasurement = measureInteraction('keyboard-save')
      // Trigger save action - this would be handled by individual components
      const saveEvent = new CustomEvent('dashboard-save')
      window.dispatchEvent(saveEvent)
      trackAction('Atalho usado', 'dashboard', 'Ctrl+S - Salvar')
      endMeasurement()
    },
    cancel: () => {
      const endMeasurement = measureInteraction('keyboard-cancel')
      // Trigger cancel action
      const cancelEvent = new CustomEvent('dashboard-cancel')
      window.dispatchEvent(cancelEvent)
      trackAction('Atalho usado', 'dashboard', 'Escape - Cancelar')
      endMeasurement()
    },
    preview: () => {
      const endMeasurement = measureInteraction('keyboard-preview')
      // Trigger preview action
      const previewEvent = new CustomEvent('dashboard-preview')
      window.dispatchEvent(previewEvent)
      trackAction('Atalho usado', 'dashboard', 'Ctrl+Shift+P - Preview')
      endMeasurement()
    },
    refresh: () => {
      const endMeasurement = measureInteraction('keyboard-refresh')
      refreshStats()
      trackAction('Atalho usado', 'dashboard', 'Ctrl+R - Atualizar')
      endMeasurement()
    },
    newItem: () => {
      const endMeasurement = measureInteraction('keyboard-new-item')
      // Trigger new item action
      const newItemEvent = new CustomEvent('dashboard-new-item')
      window.dispatchEvent(newItemEvent)
      trackAction('Atalho usado', 'dashboard', 'Ctrl+N - Novo item')
      endMeasurement()
    },
    search: () => {
      const endMeasurement = measureInteraction('keyboard-search')
      // Focus search input if available
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="buscar"], input[placeholder*="Buscar"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
        trackAction('Atalho usado', 'dashboard', 'Ctrl+F - Buscar')
      }
      endMeasurement()
    },
    help: () => {
      const endMeasurement = measureInteraction('keyboard-help')
      setShowShortcuts(true)
      trackAction('Atalho usado', 'dashboard', '? - Ajuda')
      endMeasurement()
    }
  })

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts,
    enabled: true
  })

  // Track page visits
  useEffect(() => {
    trackAction('Página visitada', 'dashboard', window.location.pathname)
  }, [trackAction])

  return (
    <I18nProvider>
      <AccessibilityProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Skip Links */}
            <SkipLink href="#main-content" />
            <SkipLink href="#navigation">Skip to navigation</SkipLink>

            {/* Sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
              <Suspense fallback={<LoadingSkeleton type="list" count={8} />}>
                <AdminSidebar />
              </Suspense>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div 
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col">
                  <Suspense fallback={<LoadingSkeleton type="list" count={8} />}>
                    <AdminSidebar onClose={() => setSidebarOpen(false)} />
                  </Suspense>
                </div>
              </div>
            )}

            {/* Main content */}
            <div className="lg:pl-64">
              <Suspense fallback={<LoadingSkeleton type="card" />}>
                <AdminHeader 
                  onMenuClick={() => setSidebarOpen(true)}
                  onShowShortcuts={() => setShowShortcuts(true)}
                />
              </Suspense>
              
              <main id="main-content" className="py-6" tabIndex={-1}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
                    {children}
                  </Suspense>
                </div>
              </main>
            </div>

            {/* Keyboard Shortcuts Modal */}
            <KeyboardShortcutsModal
              isOpen={showShortcuts}
              onClose={() => setShowShortcuts(false)}
              shortcuts={shortcuts}
            />
          </div>
        </ThemeProvider>
      </AccessibilityProvider>
    </I18nProvider>
  )
}