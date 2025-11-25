import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import LoginForm from '@/components/forms/LoginForm'
import { Lock } from 'lucide-react'

export const metadata = {
  title: 'Connexion - Espace Animateurs',
  description: 'Connexion réservée aux animateurs et administrateurs du Patro'
}

export default async function LoginPage() {
  // Si déjà connecté, rediriger vers le dashboard
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Espace Animateurs
            </h1>
            <p className="text-gray-600 text-sm">
              Connectez-vous pour accéder au tableau de bord
            </p>
          </div>

          {/* Formulaire */}
          <LoginForm />

          {/* Lien retour accueil */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Retour à l'accueil
            </a>
          </div>
        </div>

        {/* Message info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            🔒 Cette page est réservée aux animateurs.
          </p>
          <p className="mt-1">
            Pas de compte ? Contactez l'administrateur.
          </p>
        </div>
      </div>
    </div>
  )
}