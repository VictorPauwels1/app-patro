'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Tent, 
  Calendar, 
  Images, 
  MessageSquare, 
  Newspaper,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Enfants inscrits', href: '/dashboard/enfants', icon: Users },
  { label: 'Camps', href: '/dashboard/camps', icon: Tent },
  { label: 'Événements', href: '/dashboard/evenements', icon: Calendar },
  { label: 'Albums photos', href: '/dashboard/albums', icon: Images },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Journaux', href: '/dashboard/journaux', icon: Newspaper },
]

export default function DashboardNav() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="flex flex-col h-full">
      {/* Navigation principale */}
      <div className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Bouton déconnexion */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </nav>
  )
}