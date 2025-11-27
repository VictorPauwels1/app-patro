import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Tent, Calendar, MapPin, Clock, Euro, Users, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function CampPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const camp = await prisma.camp.findUnique({
    where: { id: id },
    include: {
      _count: { select: { registrations: true } },
    },
  })

  if (!camp || !camp.isPublic) {
    redirect('/camps')
  }

  const getSectionLabels = (sections: string[]) => {
    const labels: Record<string, string> = {
      POUSSINS_G: 'Poussins', BENJAMINS: 'Benjamins', CHEVALIERS: 'Chevaliers',
      CONQUERANTS: 'Conquérants', BROTHERS: 'Brothers', POUSSINS_F: 'Poussins',
      BENJAMINES: 'Benjamines', ETINCELLES: 'Étincelles', ALPINES: 'Alpines',
      GRANDES: 'Grandes',
    }
    if (sections.length === 5) return 'Toutes les sections'
    return sections.map(s => labels[s] || s).join(', ')
  }

  const placesRestantes = camp.maxParticipants ? camp.maxParticipants - camp._count.registrations : null
  const isComplet = placesRestantes !== null && placesRestantes <= 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/camps" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Retour aux camps
          </Link>
          <div className="flex items-center gap-4">
            <Tent className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold mb-2">{camp.name}</h1>
              <p className="text-green-100">
                {camp.patroGroup === 'GARCONS' ? 'Camp Garçons' : 'Camp Filles'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {camp.description && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{camp.description}</p>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations pratiques</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Dates</div>
                        <div className="text-gray-600">
                          Du {format(new Date(camp.startDate), 'dd MMMM yyyy', { locale: fr })} au {format(new Date(camp.endDate), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Horaires</div>
                        <div className="text-gray-600">De {camp.startTime} à {camp.endTime}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Lieu</div>
                        <div className="text-gray-600">{camp.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Sections</div>
                        <div className="text-gray-600">{getSectionLabels(camp.sections)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{camp.price.toFixed(2)} €</div>
                    <p className="text-gray-600">par participant</p>
                  </div>

                  <div className="border-t border-b py-4 mb-6">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">Places disponibles</span>
                      <span className="font-semibold text-gray-900">
                        {camp.maxParticipants ? `${placesRestantes} / ${camp.maxParticipants}` : 'Illimitées'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Inscrits actuellement</span>
                      <span className="font-semibold text-gray-900">{camp._count.registrations}</span>
                    </div>
                  </div>

                  {isComplet ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center font-semibold">
                      Camp complet
                    </div>
                  ) : (
                    <Link href={`/camps/${camp.id}/inscription`} className="block w-full bg-green-600 text-white text-center py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold">
                      S'inscrire maintenant
                    </Link>
                  )}

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Vous devez avoir un enfant inscrit au patro pour participer aux camps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}