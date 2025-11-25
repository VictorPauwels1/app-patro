import Link from 'next/link'
import { Facebook, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Patro</h3>
            <p className="text-sm">
              Un mouvement de jeunesse ou chaque enfant compte.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition">Accueil</Link></li>
              <li><Link href="/inscription" className="hover:text-white transition">Inscription</Link></li>
              <li><Link href="/camps" className="hover:text-white transition">Camps</Link></li>
              <li><Link href="/calendrier" className="hover:text-white transition">Calendrier</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Nos patros</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/filles" className="hover:text-white transition">Patro des Filles</Link></li>
              <li><Link href="/garcons" className="hover:text-white transition">Patro des Garcons</Link></li>
              <li><Link href="/albums" className="hover:text-white transition">Albums photos</Link></li>
              <li><Link href="/journaux" className="hover:text-white transition">Journaux</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Nous suivre</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="mailto:contact@patro.be" className="hover:text-white transition">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 Patro. Tous droits reserves.</p>
          <p className="mt-2">
            <Link href="/login" className="text-gray-400 hover:text-white transition">
              Espace Animateurs
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}