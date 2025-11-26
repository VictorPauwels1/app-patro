'use client'

import { useState } from 'react'
import DashboardNav from './DashboardNav'
import { Menu, X } from 'lucide-react'
import { getRoleLabel, getGroupLabel } from '@/lib/permissions'
import { Role, PatroGroup } from '@prisma/client'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
    role: Role
    patroGroup: PatroGroup | null
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-bold text-lg">Patro Dashboard</h1>
            <p className="text-xs text-gray-600">{user.name}</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r min-h-screen sticky top-0">
          {/* Header sidebar */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Patro</h1>
            <p className="text-sm text-gray-600 mt-1">Dashboard</p>
          </div>

          {/* Info utilisateur */}
          <div className="px-4 py-4 border-b bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {getRoleLabel(user.role)}
              </span>
              {user.patroGroup && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  {getGroupLabel(user.patroGroup)}
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <DashboardNav user={user} />
        </aside>

        {/* Sidebar Mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <aside className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Patro</h1>
                  <p className="text-sm text-gray-600 mt-1">Dashboard</p>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Info utilisateur */}
              <div className="px-4 py-4 border-b bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {getRoleLabel(user.role)}
                  </span>
                  {user.patroGroup && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      {getGroupLabel(user.patroGroup)}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <DashboardNav user={user} />
              </div>
            </aside>
          </div>
        )}

        {/* Contenu principal */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}