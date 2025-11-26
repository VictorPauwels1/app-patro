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
    <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Titre */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <img 
              src="/images/patro-logo.webp" 
              alt="Logo Patro" 
              className="h-12 w-auto"
            />
            
          </Link>

          {/* Desktop Navigation - Partie 1 : Navigation principale au centre */}
          <div className="hidden md:flex items-center flex-1 justify-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-yellow-300 transition font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Navigation - Partie 2 : Boutons connecte/deconnecte a droite */}
          <div className="hidden md:flex items-center gap-3">
            {/* Separateur vertical */}
            <div className="h-8 w-px bg-white/30 mr-3"></div>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-yellow-400 text-green-800 px-4 py-2 rounded-lg hover:bg-yellow-500 transition font-semibold shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  Deconnexion
                </button>
                <span className="text-sm text-white/90">
                  Connecté : <strong>{session.user.name}</strong>
                </span>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-yellow-400 text-green-800 px-6 py-2 rounded-lg hover:bg-yellow-500 transition font-semibold shadow-md"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:text-yellow-300 transition"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/20">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-white hover:text-yellow-300 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Si connecte (mobile) */}
            {session ? (
              <div className="pt-2 border-t border-white/20 space-y-2">
                <div className="py-2 text-sm text-white/90">
                  Connecte : <strong>{session.user.name}</strong>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 py-2 text-yellow-300 font-semibold"
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
                  className="flex items-center gap-2 py-2 text-red-300 font-semibold w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Deconnexion
                </button>
              </div>
            ) : (
              /* Si non connecte (mobile) */
              <Link
                href="/login"
                className="block py-2 text-yellow-300 font-semibold"
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