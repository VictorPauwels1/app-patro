import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SettingsForm from '@/components/dashboard/SettingsForm'
import AnimateursManager from '@/components/dashboard/AnimateursManager'

export const metadata = {
  title: 'Paramètres - Dashboard Patro',
}

export default async function ParametresPage() {
  const session = await requireAuth().catch(() => redirect('/login'))
  
  // Seuls les présidents et admin peuvent accéder aux paramètres
  const allowedRoles = ['ADMIN', 'PRESIDENT_FILLES', 'PRESIDENT_GARCONS']
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/dashboard')
  }

  // Déterminer la section à gérer
  let section: 'GARCONS' | 'FILLES' | null = null
  if (session.user.role === 'PRESIDENT_GARCONS') section = 'GARCONS'
  if (session.user.role === 'PRESIDENT_FILLES') section = 'FILLES'

  // Récupérer les paramètres selon la section
  let settingsGarcons = null
  let settingsFilles = null

  if (session.user.role === 'ADMIN') {
    settingsGarcons = await prisma.settings.findUnique({ where: { section: 'GARCONS' } })
    settingsFilles = await prisma.settings.findUnique({ where: { section: 'FILLES' } })
  } else if (section) {
    const settings = await prisma.settings.findUnique({ where: { section } })
    if (section === 'GARCONS') settingsGarcons = settings
    if (section === 'FILLES') settingsFilles = settings
  }
  
  // Récupérer les animateurs
  const animateurs = await prisma.animateur.findMany({
    orderBy: [
      { section: 'asc' },
      { fonction: 'desc' },
      { nom: 'asc' },
    ],
  })

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">
            Gérez les prix, les informations de contact et les animateurs
          </p>
        </div>

        {/* Paramètres Garçons */}
        {(session.user.role === 'ADMIN' || session.user.role === 'PRESIDENT_GARCONS') && (
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">Patro Garçons</h2>
            <SettingsForm settings={settingsGarcons} section={"GARCONS" as const} />
          </div>
        )}

        {/* Paramètres Filles */}
        {(session.user.role === 'ADMIN' || session.user.role === 'PRESIDENT_FILLES') && (
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-4">Patro Filles</h2>
            <SettingsForm settings={settingsFilles} section="FILLES" />
          </div>
        )}

        {/* Gestion des animateurs */}
        <AnimateursManager 
          animateurs={animateurs} 
          userRole={session.user.role}
          userSection={session.user.patroGroup}
        />
      </div>
    </DashboardLayout>
  )
}