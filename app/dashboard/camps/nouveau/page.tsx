import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import CampCreationForm from '@/components/forms/CampCreationForm'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tent } from 'lucide-react'

export default async function NouveauCampPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Récupérer tous les animateurs pour le formulaire
  const animateurs = await prisma.animateur.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      section: true,
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' },
    ],
  })

  // Récupérer les settings des deux sections
  const settingsGarcons = await prisma.settings.findUnique({
    where: { section: 'GARCONS' },
    select: {
      iban: true,
      beneficiaire: true,
    },
  })

  const settingsFilles = await prisma.settings.findUnique({
    where: { section: 'FILLES' },
    select: {
      iban: true,
      beneficiaire: true,
    },
  })

  return (
    <DashboardLayout user={session.user}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-100 rounded-lg">
              <Tent className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau camp</h1>
              <p className="text-gray-600">Remplissez les informations du camp</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <CampCreationForm 
              userPatroGroup={session.user.patroGroup} 
              animateurs={animateurs}
              settingsGarcons={settingsGarcons}
              settingsFilles={settingsFilles}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}