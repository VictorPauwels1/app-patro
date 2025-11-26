import { Clock, MapPin, Mail } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function InfoSection() {
  // Récupérer les settings des deux sections
  const settingsGarcons = await prisma.settings.findUnique({ 
    where: { section: 'GARCONS' } 
  })
  const settingsFilles = await prisma.settings.findUnique({ 
    where: { section: 'FILLES' } 
  })

  // Récupérer les animateurs à afficher
  const animateurs = await prisma.animateur.findMany({
    where: {
      afficherContact: true,
    },
    orderBy: [
      { section: 'asc' }, // Présidents en premier
      { fonction: 'desc' },     // Puis par fonction
      { nom: 'asc' },
    ],
  })

  const animateursFilles = animateurs.filter(a => a.section === 'FILLES')
  const animateursGarcons = animateurs.filter(a => a.section === 'GARCONS')

  const getFonctionDisplay = (fonction: string) => {
    if (fonction === 'PRESIDENT') return 'Président'
    if (fonction === 'CO_PRESIDENT') return 'Président'
    if (fonction === 'VICE_PRESIDENT') return 'Vice-Président'
    return 'Animateur'
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Infos pratiques
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FILLES - Gauche */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
              Patro Filles
            </h3>

            {/* Horaires Filles */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-gray-900">Horaires</h4>
              </div>
              <p className="text-sm text-gray-600 ml-9">
                {settingsFilles?.horaires || 'Dimanches 14h00 - 17h00'}
              </p>
            </div>

            {/* Lieu Filles */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-yellow-600" />
                <h4 className="font-semibold text-gray-900">Lieu</h4>
              </div>
              <p className="text-sm text-gray-600 ml-9 whitespace-pre-line">
                {settingsFilles?.adresse || 'À définir'}
              </p>
            </div>

            {/* Contacts Filles */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-gray-900">Contacts</h4>
              </div>
              <div className="ml-9 space-y-3">
                {animateursFilles.length > 0 ? (
                  animateursFilles.map(anim => (
                    <div key={anim.id} className="pb-2 border-b border-gray-200 last:border-0">
                      <p className="font-semibold text-gray-900">
                        {anim.prenom} {anim.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getFonctionDisplay(anim.fonction)}
                      </p>
                      <p className="text-sm text-gray-600">📞 {anim.telephone}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Contacts à venir</p>
                )}
                <div className="pt-2 border-t-2 border-green-200">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {settingsFilles?.emailContact || 'filles@patro.be'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GARÇONS - Droite */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
              Patro Garçons
            </h3>

            {/* Horaires Garçons */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-gray-900">Horaires</h4>
              </div>
              <p className="text-sm text-gray-600 ml-9">
                {settingsGarcons?.horaires || 'Dimanches 14h00 - 17h00'}
              </p>
            </div>

            {/* Lieu Garçons */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-yellow-600" />
                <h4 className="font-semibold text-gray-900">Lieu</h4>
              </div>
              <p className="text-sm text-gray-600 ml-9 whitespace-pre-line">
                {settingsGarcons?.adresse || 'À définir'}
              </p>
            </div>

            {/* Contacts Garçons */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-gray-900">Contacts</h4>
              </div>
              <div className="ml-9 space-y-3">
                {animateursGarcons.length > 0 ? (
                  animateursGarcons.map(anim => (
                    <div key={anim.id} className="pb-2 border-b border-gray-200 last:border-0">
                      <p className="font-semibold text-gray-900">
                        {anim.prenom} {anim.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getFonctionDisplay(anim.fonction)}
                      </p>
                      <p className="text-sm text-gray-600">📞 {anim.telephone}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Contacts à venir</p>
                )}
                <div className="pt-2 border-t-2 border-green-200">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {settingsGarcons?.emailContact || 'garcons@patro.be'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}