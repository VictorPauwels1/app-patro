import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  Tent, 
  Calendar, 
  MapPin, 
  Clock, 
  Euro, 
  Users, 
  Settings,
  ArrowLeft,
  Phone,
  Mail,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { calculateSchoolAge } from '@/lib/utils'
import DownloadMenuButton from '@/components/DownloadMenuButton'

export default async function CampDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const camp = await prisma.camp.findUnique({
    where: { id: id },
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
      registrations: {
        include: {
          child: {
            include: {
              primaryParent: true,
              secondaryParent: true,
            },
          },
        },
        orderBy: {
          child: {
            lastName: 'asc',
          },
        },
      },
    },
  })

  if (!camp) {
    redirect('/dashboard/camps')
  }

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

  const inscritsPayes = camp.registrations.filter(r => r.isPaid).length
  const inscritsNonPayes = camp.registrations.filter(r => !r.isPaid).length

  return (
    <DashboardLayout user={session.user}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/camps"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux camps
          </Link>

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Tent className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{camp.name}</h1>
                  <span className={`px-3 py-1 text-sm font-semibold rounded ${
                    camp.patroGroup === 'GARCONS' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {camp.patroGroup === 'GARCONS' ? 'Garçons' : 'Filles'}
                  </span>
                </div>
                <p className="text-gray-600">
                  {camp.registrations.length} inscrit{camp.registrations.length > 1 ? 's' : ''}
                  {camp.maxParticipants && ` / ${camp.maxParticipants} places`}
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/camps/${camp.id}/parametres`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations du camp */}
          <div className="lg:col-span-1 space-y-6">
            {/* Détails */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Détails du camp</h2>
              
              {camp.description && (
                <p className="text-gray-600 mb-4 pb-4 border-b">{camp.description}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Dates</div>
                    <div className="text-gray-600">
                      Du {format(new Date(camp.startDate), 'dd MMMM yyyy', { locale: fr })}
                      <br />
                      au {format(new Date(camp.endDate), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Horaires</div>
                    <div className="text-gray-600">
                      De {camp.startTime} à {camp.endTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Lieu</div>
                    <div className="text-gray-600">{camp.location}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Prix</div>
                    <div className="text-gray-600">{camp.price.toFixed(2)} €</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Sections</div>
                    <div className="text-gray-600">{getSectionLabels(camp.sections)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animateurs */}
            {camp.animators.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Animateurs présents
                </h2>
                <div className="space-y-2">
                  {camp.animators.map((animateur) => (
                    <div
                      key={animateur.id}
                      className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded"
                    >
                      <Users className="w-4 h-4 text-gray-400" />
                      {animateur.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques paiement */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Paiements</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payés</span>
                  <span className="font-semibold text-green-600">{inscritsPayes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Non payés</span>
                  <span className="font-semibold text-orange-600">{inscritsNonPayes}</span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{camp.registrations.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des inscrits */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Liste des inscrits ({camp.registrations.length})
                </h2>
                <div className="flex gap-2">
                  <DownloadMenuButton 
                    type="camp"
                    campId={camp.id}
                    label="Télécharger les fiches"
                  />
                  <Link
                    href={`/dashboard/camps/${camp.id}/recaps-preview`}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Récaps
                  </Link>
                </div>
              </div>

              {camp.registrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun inscrit pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {camp.registrations.map((registration) => {
                    const age = calculateSchoolAge(registration.child.birthDate)
                    return (
                      <div
                        key={registration.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {registration.child.firstName} {registration.child.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{age} ans</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              registration.isPaid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {registration.isPaid ? 'Payé' : 'Non payé'}
                            </span>
                            {registration.medicalInfoUpdated && (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                Infos médicales mises à jour
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{registration.child.primaryParent.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{registration.child.primaryParent.email}</span>
                          </div>
                        </div>

                        {registration.remarks && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              <strong>Remarques :</strong> {registration.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}