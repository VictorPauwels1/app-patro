import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getVisibleGroups } from '@/lib/permissions'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  getCurrentSchoolYear, 
  calculateSchoolAge, 
  getSectionLabel, 
  getSectionAgeRange,
  isAnimateurAge,
  formatPhoneNumber
} from '@/lib/utils'
import { User, Phone, Mail, AlertCircle, FileText } from 'lucide-react'
import { Section } from '@prisma/client'
import DownloadMenuButton from '@/components/DownloadMenuButton'

export const metadata = {
  title: 'Enfants inscrits - Dashboard',
}

export default async function EnfantsPage() {
  const session = await requireAuth().catch(() => redirect('/login'))
  const visibleGroups = getVisibleGroups(session.user)
  const currentYear = getCurrentSchoolYear()

  // Recuperer les inscriptions de l'annee en cours
  const registrations = await prisma.registration.findMany({
    where: {
      year: currentYear,
      child: {
        patroGroup: { in: visibleGroups }
      }
    },
    include: {
      child: {
        include: {
          primaryParent: true,
          secondaryParent: true
        }
      }
    },
    orderBy: [
      {
        child: {
          patroGroup: 'asc'
        }
      },
      {
        child: {
          lastName: 'asc'
        }
      }
    ]
  })

  // Separer enfants et animateurs
  const enfants = registrations.filter(r => !isAnimateurAge(r.child.birthDate))
  const animateurs = registrations.filter(r => isAnimateurAge(r.child.birthDate))

  // Grouper les enfants par section
  const enfantsParSection: Record<string, typeof enfants> = {}
  
  enfants.forEach(registration => {
    const section = registration.child.section
    if (section) {
      if (!enfantsParSection[section]) {
        enfantsParSection[section] = []
      }
      enfantsParSection[section].push(registration)
    }
  })

  // Ordre des sections (garçons puis filles)
  const ordresSections: Section[] = [
    'POUSSINS_G',
    'BENJAMINS',
    'CHEVALIERS',
    'CONQUERANTS',
    'BROTHERS',
    'POUSSINS_F',
    'BENJAMINES',
    'ETINCELLES',
    'ALPINES',
    'GRANDES'
  ]

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        {/* En-tete avec boutons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Personnes inscrites
            </h1>
            <p className="text-gray-600 mt-1">
              Annee scolaire {currentYear}
            </p>
            <div className="flex gap-4 mt-2">
              <span className="text-sm text-gray-600">
                <strong>{enfants.length}</strong> enfant(s)
              </span>
              <span className="text-sm text-gray-600">
                <strong>{animateurs.length}</strong> animateur(s)
              </span>
            </div>
          </div>

          {/* Boutons globaux */}
          <div className="flex flex-wrap gap-2">
            <DownloadMenuButton 
              type="all"
              label="Télécharger toutes les fiches"
            />
            <Link
              href="/dashboard/enfants/recaps-preview"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
            >
              <FileText className="w-4 h-4" />
              Fiches récapitulatives
            </Link>
          </div>
        </div>

        {/* Section Animateurs */}
        {animateurs.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Animateurs ({animateurs.length})
              </h2>
              <div className="flex gap-2">
                <DownloadMenuButton 
                  type="animateurs"
                  label="Télécharger PDF"
                />
                <Link
                  href="/dashboard/enfants/recaps-preview?animateurs=true"
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Récaps
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Groupe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsable 1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsable 2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {animateurs.map((registration) => {
                    const child = registration.child
                    const parent1 = child.primaryParent
                    const parent2 = child.secondaryParent
                    const age = calculateSchoolAge(child.birthDate)

                    return (
                      <tr key={registration.id} className="hover:bg-purple-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/dashboard/enfants/${child.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {child.firstName} {child.lastName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {age} ans
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            child.patroGroup === 'GARCONS' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {child.patroGroup === 'GARCONS' ? 'Garcons' : 'Filles'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-medium">{parent1.firstName} {parent1.lastName}</div>
                          <div className="text-xs text-gray-500">{parent1.relationship}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {formatPhoneNumber(parent1.phone)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-medium">{parent2.firstName} {parent2.lastName}</div>
                          <div className="text-xs text-gray-500">{parent2.relationship}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {formatPhoneNumber(parent2.phone)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{child.address}</div>
                          <div className="text-xs text-gray-500">{child.postalCode} {child.city}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sections enfants */}
        {enfants.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Aucun enfant inscrit pour le moment.
            </p>
            <Link 
              href="/inscription"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Creer une inscription
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {ordresSections.map((section) => {
              const enfantsSection = enfantsParSection[section]
              if (!enfantsSection || enfantsSection.length === 0) return null

              return (
                <div key={section} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-blue-900">
                        {getSectionLabel(section)} ({enfantsSection.length})
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {getSectionAgeRange(section)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <DownloadMenuButton 
                        type="section"
                        section={section}
                        label="Télécharger PDF"
                      />
                      <Link
                        href={`/dashboard/enfants/recaps-preview?section=${section}`}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Récaps
                      </Link>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Age
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Groupe
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responsable 1
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responsable 2
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Adresse
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enfantsSection.map((registration) => {
                          const child = registration.child
                          const parent1 = child.primaryParent
                          const parent2 = child.secondaryParent
                          const age = calculateSchoolAge(child.birthDate)

                          return (
                            <tr key={registration.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link 
                                  href={`/dashboard/enfants/${child.id}`}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {child.firstName} {child.lastName}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {age} ans
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  child.patroGroup === 'GARCONS' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-pink-100 text-pink-800'
                                }`}>
                                  {child.patroGroup === 'GARCONS' ? 'Garcons' : 'Filles'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <div className="font-medium">{parent1.firstName} {parent1.lastName}</div>
                                <div className="text-xs text-gray-500">{parent1.relationship}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {formatPhoneNumber(parent1.phone)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  {parent1.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <div className="font-medium">{parent2.firstName} {parent2.lastName}</div>
                                <div className="text-xs text-gray-500">{parent2.relationship}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {formatPhoneNumber(parent2.phone)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <div>{child.address}</div>
                                <div className="text-xs text-gray-500">{child.postalCode} {child.city}</div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}