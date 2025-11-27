import { prisma } from '@/lib/prisma'
import InscriptionFormClient from '@/components/forms/InscriptionFormClient'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Inscription - Patro Enghien',
  description: 'Formulaire d\'inscription au Patro',
}

export default async function InscriptionPage() {
  // Récupérer les settings des deux sections
  const settingsGarcons = await prisma.settings.findUnique({
    where: { section: 'GARCONS' }
  })
  
  const settingsFilles = await prisma.settings.findUnique({
    where: { section: 'FILLES' }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Retour à l'accueil
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Inscription au Patro
          </h1>
          <p className="text-lg text-gray-600">
            Remplissez ce formulaire pour inscrire votre enfant
          </p>
        </div>
        
        <InscriptionFormClient 
          settingsGarcons={settingsGarcons}
          settingsFilles={settingsFilles}
        />
      </div>
    </div>
  )
}