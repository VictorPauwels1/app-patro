'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Child, Camp } from '@prisma/client'
import { User, AlertCircle } from 'lucide-react'

interface CampInscriptionFormProps {
  camp: Camp & { _count: { registrations: number } }
}

export default function CampInscriptionForm({ camp }: CampInscriptionFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [medicalInfoChanged, setMedicalInfoChanged] = useState<boolean | null>(null)
  const [remarks, setRemarks] = useState('')

  const [birthDate, setBirthDate] = useState('')
  const [searchAttempted, setSearchAttempted] = useState(false)

  // Rechercher les enfants par date de naissance
  const handleSearchChildren = async () => {
    if (!birthDate) {
      setError('Veuillez entrer une date de naissance')
      return
    }

    setIsLoading(true)
    setError('')
    setSearchAttempted(true)

    try {
      const response = await fetch(`/api/children/search-by-birth?birthDate=${encodeURIComponent(birthDate)}`)
      
      if (!response.ok) {
        throw new Error('Aucun enfant trouvé avec cette date de naissance')
      }

      const data = await response.json()
      
      // Filtrer les enfants selon le genre du camp
      const filteredChildren = data.filter((child: Child) => child.patroGroup === camp.patroGroup)
      
      if (filteredChildren.length === 0) {
        setError(`Aucun enfant inscrit ${camp.patroGroup === 'GARCONS' ? 'garçons' : 'filles'} trouvé avec cette date de naissance`)
        setChildren([])
      } else {
        setChildren(filteredChildren)
        setStep(2)
      }
    } catch (err: any) {
      setError(err.message)
      setChildren([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedChildId) {
      setError('Veuillez sélectionner un enfant')
      return
    }

    if (medicalInfoChanged === null) {
      setError('Veuillez indiquer si les informations médicales ont changé')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/camp-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campId: camp.id,
          childId: selectedChildId,
          medicalInfoChanged,
          remarks,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      router.push(`/camps/${camp.id}/confirmation`)
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Étape 1 : Recherche par date de naissance */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rechercher votre enfant</h2>
          <p className="text-gray-600 mb-6">
            Entrez la date de naissance de votre enfant (celle utilisée lors de l'inscription générale au patro)
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="button"
              onClick={handleSearchChildren}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>

          {searchAttempted && children.length === 0 && !isLoading && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Votre enfant n'est pas encore inscrit au patro ?{' '}
                <a href="/inscription" className="font-semibold underline hover:text-blue-900">
                  Inscrivez-le d'abord ici
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Étape 2 : Sélection de l'enfant */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sélectionnez votre enfant</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {children.map((child) => (
                <label
                  key={child.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedChildId === child.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="childId"
                    value={child.id}
                    checked={selectedChildId === child.id}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="mr-4"
                  />
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {child.firstName} {child.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date().getFullYear() - new Date(child.birthDate).getFullYear()} ans
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedChildId && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations médicales
                </h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Important - RGPD</p>
                      <p>
                        Pour des raisons de confidentialité, nous ne pouvons pas afficher les informations médicales actuelles de votre enfant.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Les informations médicales de votre enfant ont-elles changé depuis l'inscription générale ?
                    <span className="text-red-500"> *</span>
                  </p>
                  
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="medicalInfoChanged"
                        checked={medicalInfoChanged === false}
                        onChange={() => setMedicalInfoChanged(false)}
                        className="mr-3"
                      />
                      <span className="text-sm">Non, les informations sont toujours à jour</span>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="medicalInfoChanged"
                        checked={medicalInfoChanged === true}
                        onChange={() => setMedicalInfoChanged(true)}
                        className="mr-3"
                      />
                      <span className="text-sm">Oui, il y a eu des changements</span>
                    </label>
                  </div>

                  {medicalInfoChanged === true && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Prochaine étape :</strong> Après validation de l'inscription, vous serez contacté pour mettre à jour les informations médicales de votre enfant.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarques ou informations complémentaires
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Informations importantes pour ce camp en particulier..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setSelectedChildId('')
                    setMedicalInfoChanged(null)
                    setRemarks('')
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading || medicalInfoChanged === null}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? 'Inscription en cours...' : 'Confirmer l\'inscription'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  )
}