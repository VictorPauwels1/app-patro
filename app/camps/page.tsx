import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Tent, Calendar, MapPin, Euro, Users, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const metadata = {
  title: 'Camps - Patro Saint-Nicolas Enghien',
  description: 'Découvrez nos camps et inscrivez votre enfant',
}

export default async function CampsPage() {
  const now = new Date()
  
  const campsGarcons = await prisma.camp.findMany({
    where: {
      patroGroup: 'GARCONS',
      isPublic: true,
      endDate: { gte: now },
    },
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: 'asc' },
  })

  const campsFilles = await prisma.camp.findMany({
    where: {
      patroGroup: 'FILLES',
      isPublic: true,
      endDate: { gte: now },
    },
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: 'asc' },
  })

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

  const CampCard = ({ camp }: { camp: any }) => {
    const placesRestantes = camp.maxParticipants ? camp.maxParticipants - camp._count.registrations : null
    const isComplet = placesRestantes !== null && placesRestantes <= 0

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{camp.name}</h3>
            {camp.description && <p className="text-gray-600 text-sm">{camp.description}</p>}
          </div>
          {isComplet && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Complet</span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Du {format(new Date(camp.startDate), 'dd MMMM', { locale: fr })} au {format(new Date(camp.endDate), 'dd MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{camp.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            <span>{camp.price.toFixed(2)} €</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{camp._count.registrations} inscrit{camp._count.registrations !== 1 && 's'}{camp.maxParticipants && ` / ${camp.maxParticipants} places`}</span>
          </div>
        </div>

        <div className="border-t pt-3 mb-4">
          <p className="text-xs text-gray-500"><strong>Sections :</strong> {getSectionLabels(camp.sections)}</p>
        </div>

        <Link href={`/camps/${camp.id}`} className={`block text-center px-4 py-3 rounded-lg transition ${isComplet ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
          {isComplet ? 'Camp complet' : 'Voir les détails et s\'inscrire'}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Retour à l'accueil
          </Link>
          <div className="text-center">
          <Tent className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos camps</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">Découvrez nos camps et vivez des aventures inoubliables !</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <a href="#camps-garcons" className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <h2 className="text-3xl font-bold mb-4">Camps Garçons</h2>
              <p className="text-green-100 mb-6">{campsGarcons.length} camp{campsGarcons.length !== 1 && 's'} disponible{campsGarcons.length !== 1 && 's'}</p>
              <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                Découvrir <ArrowRight className="w-5 h-5" />
              </div>
            </a>
            <a href="#camps-filles" className="group bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-8 text-green-900 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <h2 className="text-3xl font-bold mb-4">Camps Filles</h2>
              <p className="text-green-800 mb-6">{campsFilles.length} camp{campsFilles.length !== 1 && 's'} disponible{campsFilles.length !== 1 && 's'}</p>
              <div className="flex items-center gap-2 text-green-900 font-semibold group-hover:gap-3 transition-all">
                Découvrir <ArrowRight className="w-5 h-5" />
              </div>
            </a>
          </div>
        </div>
      </section>

      <section id="camps-garcons" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            Camps Garçons
          </h2>
          {campsGarcons.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Tent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun camp disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campsGarcons.map((camp) => <CampCard key={camp.id} camp={camp} />)}
            </div>
          )}
        </div>
      </section>

      <section id="camps-filles" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            Camps Filles
          </h2>
          {campsFilles.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <Tent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun camp disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campsFilles.map((camp) => <CampCard key={camp.id} camp={camp} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}