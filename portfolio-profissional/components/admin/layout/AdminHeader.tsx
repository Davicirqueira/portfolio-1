"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Menu, LogOut, User, ChevronRight, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { motion } from "framer-motion"

interface AdminHeaderProps {
  onMenuClick: () => void
  onShowShortcuts?: () => void
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, string[]> = {
  '/admin/dashboard': ['Dashboard'],
  '/admin/dashboard/home': ['Dashboard', 'Home'],
  '/admin/dashboard/about': ['Dashboard', 'Sobre'],
  '/admin/dashboard/skills': ['Dashboard', 'Habilidades'],
  '/admin/dashboard/experience': ['Dashboard', 'Experiência'],
  '/admin/dashboard/projects': ['Dashboard', 'Projetos'],
  '/admin/dashboard/education': ['Dashboard', 'Formação'],
  '/admin/dashboard/testimonials': ['Dashboard', 'Depoimentos'],
  '/admin/dashboard/contact': ['Dashboard', 'Contato'],
  '/admin/dashboard/stats': ['Dashboard', 'Estatísticas'],
  '/admin/dashboard/media': ['Dashboard', 'Mídia'],
}

export function AdminHeader({ onMenuClick, onShowShortcuts }: AdminHeaderProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const breadcrumbs = breadcrumbMap[pathname] || ['Dashboard']

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <motion.div 
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/50 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mobile menu button */}
      <motion.button
        type="button"
        className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground lg:hidden rounded-lg hover:bg-muted transition-colors"
        onClick={onMenuClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="h-6 w-6" />
      </motion.button>

      {/* Separator */}
      <div className="h-6 w-px bg-border lg:hidden" />

      {/* Breadcrumbs */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-2">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <motion.li 
                  key={crumb} 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
                  )}
                  <span 
                    className={
                      index === breadcrumbs.length - 1
                        ? "text-sm font-medium text-foreground"
                        : "text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    }
                  >
                    {crumb}
                  </span>
                </motion.li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* User menu */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Keyboard shortcuts button */}
        {onShowShortcuts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowShortcuts}
              className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              title="Atalhos do teclado (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User info */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-2">
          <motion.div 
            className="flex items-center gap-x-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-muted-foreground text-xs">
                {session?.user?.email}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

        {/* Logout button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:ml-2 sm:inline">Sair</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}