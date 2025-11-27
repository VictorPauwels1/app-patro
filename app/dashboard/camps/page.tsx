import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { getVisibleGroups } from '@/lib/permissions'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tent, Plus, Calendar, MapPin, Users, Euro, Settings } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const metadata = {
  title: 'Gestion des camps - Dashboard',
}

export default async function CampsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const visibleGroups = getVisibleGroups(session.user)

  // Récupérer tous les camps visibles
  const camps = await prisma.camp.findMany({
    where: {
      patroGroup: { in: visibleGroups },
    },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
      animators: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  })

  // Grouper les camps par statut
  const now = new Date()
  const campsAVenir = camps.filter(c => new Date(c.startDate) > now)
  const campsEnCours = camps.filter(c => new Date(c.startDate) <= now && new Date(c.endDate) >= now)
  const campsPasses = camps.filter(c => new Date(c.endDate) < now)

  const getSectionLabels = (sections: string[]) => {
    const labels: Record<string, string> = {
      POUSSINS_G: 'Poussins',
      BENJAMINS: 'Benjamins',
      CHEVALIERS: 'Chevaliers',
      CONQUERANTS: 'Conquérants',
      BROTHERS: 'Brothers',
      POUSSINS_F: 'Poussins',
      BENJAMINES: 'Benjamines',
      ETINCELLES: 'Étincelles',
      ALPINES: 'Alpines',
      GRANDES: 'Grandes',
    }
    
    if (sections.length === 5) {
      return 'Toutes les sections'
    }
    
    return sections.map(s => labels[s] || s).join(', ')
  }

  const CampCard = ({ camp, status }: { camp: any; status: 'avenir' | 'encours' | 'passe' }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${
      status === 'encours' ? 'border-2 border-green-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{camp.name}</h3>
            {status === 'encours' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                En cours
              </span>
            )}
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              camp.patroGroup === 'GARCONS' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-pink-100 text-pink-800'
            }`}>
              {camp.patroGroup === 'GARCONS' ? 'Garçons' : 'Filles'}
            </span>
          </div>
          {camp.description && (
            <p className="text-gray-600 text-sm mb-3">{camp.description}</p>
          )}
        </div>
        <Link
  href={`/dashboard/camps/${camp.id}/parametres`}
  className="p-2 hover:bg-gray-100 rounded-lg transition"
  title="Paramètres du camp"
>
  <Settings className="w-5 h-5 text-gray-600" />
</Link> 
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            Du {format(new Date(camp.startDate), 'dd MMMM yyyy', { locale: fr })} au{' '}
            {format(new Date(camp.endDate), 'dd MMMM yyyy', { locale: fr })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{camp.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>
            {camp._count.registrations} inscrit{camp._count.registrations > 1 ? 's' : ''}
            {camp.maxParticipants && ` / ${camp.maxParticipants} max`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Euro className="w-4 h-4" />
          <span>{camp.price.toFixed(2)} €</span>
        </div>
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="text-xs text-gray-500">
          <strong>Sections :</strong> {getSectionLabels(camp.sections)}
        </div>
        {camp.animators.length > 0 && (
          <div className="text-xs text-gray-500">
            <strong>Animateurs :</strong> {camp.animators.map((a: any) => a.name).join(', ')}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/dashboard/camps/${camp.id}`}
          className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
        >
          Voir les détails
        </Link>
      </div>
    </div>
  )

  return (
    <DashboardLayout user={session.user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Tent className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des camps</h1>
              <p className="text-gray-600">
                {camps.length} camp{camps.length > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/camps/nouveau"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            Créer un camp
          </Link>
        </div>

        {camps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Tent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun camp créé
            </h2>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier camp
            </p>
            <Link
              href="/dashboard/camps/nouveau"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Créer un camp
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Camps en cours */}
            {campsEnCours.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Camps en cours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campsEnCours.map((camp) => (
                    <CampCard key={camp.id} camp={camp} status="encours" />
                  ))}
                </div>
              </div>
            )}

            {/* Camps à venir */}
            {campsAVenir.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Camps à venir
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campsAVenir.map((camp) => (
                    <CampCard key={camp.id} camp={camp} status="avenir" />
                  ))}
                </div>
              </div>
            )}

            {/* Camps passés */}
            {campsPasses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Camps passés
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campsPasses.map((camp) => (
                    <CampCard key={camp.id} camp={camp} status="passe" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}