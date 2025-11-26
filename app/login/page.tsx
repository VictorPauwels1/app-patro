'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">
            Accédez au dashboard du Patro
          </p>
        </div>

        {/* Identifiants de test */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
          <p className="text-lg font-bold text-green-800 mb-4 text-center">
            🔑 Identifiants de test
          </p>
          <div className="space-y-2 text-xs">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <strong className="text-green-700">👑 Admin</strong><br />
              📧 admin@patro.be<br />
              🔒 AdminPatro2024
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <strong className="text-yellow-600">👤 Président Filles</strong><br />
              📧 president.filles@patro.be<br />
              🔒 PatroFilles2024
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <strong className="text-green-600">👤 Président Garçons</strong><br />
              📧 president.garcons@patro.be<br />
              🔒 PatroGarcons2024
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <strong className="text-blue-600">👨‍🏫 Animateur Filles</strong><br />
              📧 animateur.filles@patro.be<br />
              🔒 AnimFilles2024
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <strong className="text-blue-600">👨‍🏫 Animateur Garçons</strong><br />
              📧 animateur.garcons@patro.be<br />
              🔒 AnimGarcons2024
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="votre@email.com"
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            Se connecter
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-green-600 hover:text-green-700 transition"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}