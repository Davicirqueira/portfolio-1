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
  X
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"

interface AdminSidebarProps {
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Home', href: '/admin/dashboard/home', icon: Home },
  { name: 'Sobre', href: '/admin/dashboard/about', icon: User },
  { name: 'Habilidades', href: '/admin/dashboard/skills', icon: Brain },
  { name: 'Experiência', href: '/admin/dashboard/experience', icon: Briefcase },
  { name: 'Projetos', href: '/admin/dashboard/projects', icon: FolderOpen },
  { name: 'Formação', href: '/admin/dashboard/education', icon: GraduationCap },
  { name: 'Depoimentos', href: '/admin/dashboard/testimonials', icon: MessageSquare },
  { name: 'Contato', href: '/admin/dashboard/contact', icon: Mail },
  { name: 'Estatísticas', href: '/admin/dashboard/stats', icon: BarChart3 },
  { name: 'Mídia', href: '/admin/dashboard/media', icon: Image },
]

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <motion.div 
      className="flex grow flex-col gap-y-5 overflow-y-auto bg-card/50 backdrop-blur-sm border-r border-border px-6 pb-4 shadow-lg"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between">
        <motion.h1 
          className="text-xl font-bold text-foreground gradient-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Admin Dashboard
        </motion.h1>
        {onClose && (
          <motion.button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-6 w-6" />
          </motion.button>
        )}
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <motion.li 
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                        'group flex gap-x-3 rounded-l-md p-3 text-sm leading-6 font-medium transition-all duration-200 hover-lift'
                      )}
                      onClick={onClose}
                    >
                      <item.icon
                        className={cn(
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground',
                          'h-5 w-5 shrink-0 transition-colors duration-200'
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <motion.div
                          className="ml-auto w-1 h-1 bg-primary rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </Link>
                  </motion.li>
                )
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </motion.div>
  )
}