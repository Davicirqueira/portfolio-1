"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Home, 
  User, 
  Brain, 
  Briefcase, 
  FolderOpen, 
  GraduationCap, 
  MessageSquare, 
  Mail, 
  BarChart3, 
  Image,
  X,
  Shield,
  Settings,
  Database,
  Activity,
  Accessibility
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"
import { useTranslation } from "@/lib/context/I18nContext"
import { useKeyboardNavigation } from "@/lib/context/AccessibilityContext"

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { tabIndex } = useKeyboardNavigation()

  const navigation = [
    { name: t('navigation.dashboard'), href: '/admin/dashboard', icon: Home },
    { name: t('navigation.home'), href: '/admin/dashboard/home', icon: Home },
    { name: t('navigation.about'), href: '/admin/dashboard/about', icon: User },
    { name: t('navigation.skills'), href: '/admin/dashboard/skills', icon: Brain },
    { name: t('navigation.experience'), href: '/admin/dashboard/experience', icon: Briefcase },
    { name: t('navigation.projects'), href: '/admin/dashboard/projects', icon: FolderOpen },
    { name: t('navigation.testimonials'), href: '/admin/dashboard/testimonials', icon: MessageSquare },
    { name: t('navigation.contact'), href: '/admin/dashboard/contact', icon: Mail },
    { name: t('navigation.statistics'), href: '/admin/dashboard/stats', icon: BarChart3 },
    { name: t('navigation.media'), href: '/admin/dashboard/media', icon: Image },
  ]

  const systemNavigation = [
    { name: t('navigation.performance'), href: '/admin/dashboard/performance', icon: Activity },
    { name: t('navigation.security'), href: '/admin/dashboard/security', icon: Shield },
    { name: 'Acessibilidade', href: '/admin/dashboard/accessibility', icon: Accessibility },
    { name: t('navigation.settings'), href: '/admin/dashboard/settings', icon: Settings },
    { name: t('navigation.backup'), href: '/admin/dashboard/backup', icon: Database },
  ]

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card/50 backdrop-blur-sm border-r border-border px-6 pb-4 shadow-lg">
      <div className="flex h-16 shrink-0 items-center justify-between">
        <h1 className="text-xl font-bold text-foreground gradient-text">
          Admin Dashboard
        </h1>
        {onClose && (
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            onClick={onClose}
            aria-label="Close navigation menu"
            tabIndex={tabIndex}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <nav className="flex flex-1 flex-col" id="navigation">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <div className="text-xs font-semibold leading-6 text-muted-foreground mb-2">
              CONTEÚDO
            </div>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                        'group flex gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium transition-colors duration-200'
                      )}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={tabIndex}
                    >
                      <item.icon
                        className={cn(
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          'h-5 w-5 shrink-0 transition-colors duration-200'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          
          <li>
            <div className="text-xs font-semibold leading-6 text-muted-foreground mb-2">
              SISTEMA
            </div>
            <ul role="list" className="-mx-2 space-y-1">
              {systemNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                        'group flex gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium transition-colors duration-200'
                      )}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={tabIndex}
                    >
                      <item.icon
                        className={cn(
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          'h-5 w-5 shrink-0 transition-colors duration-200'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}