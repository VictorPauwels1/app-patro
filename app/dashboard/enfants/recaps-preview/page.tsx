'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { AlertTriangle, Utensils, Pill } from 'lucide-react'
import { getSectionLabel } from '@/lib/utils'
import { Section } from '@prisma/client'

interface RecapData {
  allergies: any[]
  regimes: any[]
  medicaments: any[]
}

export default function RecapsPreviewPage() {
  const [activeTab, setActiveTab] = useState<'allergies' | 'regimes' | 'medicaments'>('allergies')
  const [data, setData] = useState<RecapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const animateurs = searchParams.get('animateurs') === 'true'

  useEffect(() => {
    fetchUser()
    fetchData()
  }, [section, animateurs])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      setUser(session?.user || { name: 'Utilisateur' })
    } catch (error) {
      console.error('Erreur session:', error)
      setUser({ name: 'Utilisateur' })
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      let url = '/api/recaps'
      const params = []
      if (section) params.push(`section=${section}`)
      if (animateurs) params.push('animateurs=true')
      if (params.length > 0) url += `?${params.join('&')}`
      
      const response = await fetch(url)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !user) {
    return (
      <DashboardLayout user={user || { name: 'Chargement...' }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center text-red-600">
          Erreur lors du chargement des données
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Fiches Récapitulatives
          </h1>
          <p className="text-gray-600 mt-1">
            {animateurs 
              ? 'Animateurs' 
              : section 
                ? `Section: ${getSectionLabel(section as Section)}` 
                : 'Toutes les sections'}
          </p>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('allergies')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'allergies'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Allergies ({data.allergies.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('regimes')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'regimes'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  <span>Régimes ({data.regimes.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('medicaments')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'medicaments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  <span>Médicaments ({data.medicaments.length})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {/* ALLERGIES */}
            {activeTab === 'allergies' && (
              <div className="space-y-4">
                {data.allergies.length === 0 ? (
                  <p className="text-center text-green-600 py-8">
                    ✓ Aucune allergie déclarée
                  </p>
                ) : (
                  data.allergies.map((item: any) => (
                    <div key={item.id} className="border-l-4 border-red-600 bg-red-50 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">
                            {item.firstName} {item.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.age} ans • {item.section}
                          </p>
                          <div className="mt-2">
                            <span className="font-semibold text-red-900">Allergènes: </span>
                            <span className="text-red-800">{item.allergyList}</span>
                          </div>
                          {item.allergyConsequences && (
                            <div className="mt-1">
                              <span className="font-semibold text-red-900">Conséquences: </span>
                              <span className="text-red-800">{item.allergyConsequences}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="font-medium">{item.parentName}</div>
                          <div>{item.parentPhone}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* RÉGIMES */}
            {activeTab === 'regimes' && (
              <div className="space-y-4">
                {data.regimes.length === 0 ? (
                  <p className="text-center text-green-600 py-8">
                    ✓ Aucun régime spécifique
                  </p>
                ) : (
                  data.regimes.map((item: any) => (
                    <div key={item.id} className="border-l-4 border-yellow-600 bg-yellow-50 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">
                            {item.firstName} {item.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.age} ans • {item.section}
                          </p>
                          <div className="mt-2">
                            <span className="font-semibold text-yellow-900">Régime: </span>
                            <span className="text-yellow-800">{item.dietDetails}</span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="font-medium">{item.parentName}</div>
                          <div>{item.parentPhone}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MÉDICAMENTS */}
            {activeTab === 'medicaments' && (
              <div className="space-y-4">
                {data.medicaments.length === 0 ? (
                  <p className="text-center text-green-600 py-8">
                    ✓ Aucun médicament
                  </p>
                ) : (
                  data.medicaments.map((item: any) => (
                    <div key={item.id} className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">
                            {item.firstName} {item.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.age} ans • {item.section}
                          </p>
                          <div className="mt-2">
                            <span className="font-semibold text-blue-900">Médicament(s): </span>
                            <span className="text-blue-800">{item.medicationDetails}</span>
                          </div>
                          <div className="mt-1 flex gap-4">
                            <div>
                              <span className="font-semibold text-blue-900">Autonomie: </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.isAutonomous 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {item.isAutonomous ? '✓ Autonome' : '⚠ Aide nécessaire'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="font-medium">{item.parentName}</div>
                          <div>{item.parentPhone}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}