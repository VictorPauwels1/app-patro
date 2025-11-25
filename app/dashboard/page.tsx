import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getVisibleGroups } from '@/lib/permissions'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCards from '@/components/dashboard/StatsCards'
import { getCurrentSchoolYear } from '@/lib/utils'
import Link from 'next/link'
import { Users, Tent, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Dashboard - Patro',
}

export default async function DashboardPage() {
  const session = await requireAuth().catch(() => redirect('/login'))
  const visibleGroups = getVisibleGroups(session.user)
  const currentYear = getCurrentSchoolYear()

  const [enfantsCount, campsCount, evenementsCount, albumsCount] = await Promise.all([
    prisma.registration.count({
      where: {
        year: currentYear,
        child: { patroGroup: { in: visibleGroups } }
      }
    }),
    prisma.camp.count({
      where: {
        endDate: { gte: new Date() },
        OR: [
          { patroGroup: { in: visibleGroups } },
          { patroGroup: null }
        ]
      }
    }),
    prisma.event.count({
      where: {
        startDate: { gte: new Date() },
        OR: [
          { patroGroup: { in: visibleGroups } },
          { patroGroup: null }
        ]
      }
    }),
    prisma.album.count({
      where: {
        OR: [
          { patroGroup: { in: visibleGroups } },
          { patroGroup: null }
        ]
      }
    })
  ])

  const stats = {
    enfants: enfantsCount,
    camps: campsCount,
    evenements: evenementsCount,
    albums: albumsCount
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Bienvenue {session.user.name} !</p>
        </div>
        
        <StatsCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Prochains evenements
            </h2>
            <p className="text-sm text-gray-600">
              Aucun evenement a venir pour le moment.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/enfants"
                className="flex items-center gap-2 p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Users className="w-4 h-4" />
                Voir les enfants inscrits
              </Link>
              <Link
                href="/dashboard/camps"
                className="flex items-center gap-2 p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Tent className="w-4 h-4" />
                Gerer les camps
              </Link>
              <Link
                href="/dashboard/evenements"
                className="flex items-center gap-2 p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Calendar className="w-4 h-4" />
                Creer un evenement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}