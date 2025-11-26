'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/inscription', label: 'Inscription' },
    { href: '/camps', label: 'Camps' },
    { href: '/calendrier', label: 'Calendrier' },
    { href: '/albums', label: 'Photos' },
    { href: '/messages', label: 'Actualites' },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-0.5">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Patro
          </Link>

          {/* Desktop Navigation - Partie 1 : Navigation principale au centre */}
          <div className="hidden md:flex items-center flex-1 justify-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Navigation - Partie 2 : Boutons connecte/deconnecte a droite */}
          <div className="hidden md:flex items-center gap-3">
            {/* Separateur vertical */}
            <div className="h-8 w-px bg-gray-300 mr-3"></div>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Deconnexion
                </button>
                <span className="text-sm text-gray-600">
                  Connecté en tant que : <strong>{session.user.name}</strong>
                </span>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Si connecte (mobile) */}
            {session ? (
              <div className="pt-2 border-t space-y-2">
                <div className="py-2 text-sm text-gray-600">
                  Connecte en tant que : <strong>{session.user.name}</strong>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 py-2 text-blue-600 font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 py-2 text-red-600 font-semibold w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Deconnexion
                </button>
              </div>
            ) : (
              /* Si non connecte (mobile) */
              <Link
                href="/login"
                className="block py-2 text-blue-600 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}