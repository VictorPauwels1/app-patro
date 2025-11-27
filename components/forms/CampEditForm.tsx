'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PatroGroup, Section } from '@prisma/client'
import { Calendar, MapPin, Clock, Euro, Users, Trash2 } from 'lucide-react'

interface CampEditFormProps {
  camp: {
    id: string
    name: string
    description: string | null
    location: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    price: number
    iban: string
    beneficiaire: string
    patroGroup: PatroGroup
    sections: Section[]
    maxParticipants: number | null
    animatorIds: string[]
  }
  userPatroGroup: PatroGroup | null
  animateurs: { id: string; nom: string; prenom: string; section: PatroGroup }[]
}

export default function CampEditForm({ camp, userPatroGroup, animateurs }: CampEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  // Sections par groupe
  const sectionsGarcons: Section[] = ['POUSSINS_G', 'BENJAMINS', 'CHEVALIERS', 'CONQUERANTS', 'BROTHERS']
  const sectionsFilles: Section[] = ['POUSSINS_F', 'BENJAMINES', 'ETINCELLES', 'ALPINES', 'GRANDES']

  const [formData, setFormData] = useState({
    name: camp.name,
    description: camp.description || '',
    location: camp.location,
    startDate: camp.startDate,
    endDate: camp.endDate,
    startTime: camp.startTime,
    endTime: camp.endTime,
    price: camp.price.toString(),
    iban: camp.iban,
    beneficiaire: camp.beneficiaire,
    sections: camp.sections,
    animatorIds: camp.animatorIds,
    maxParticipants: camp.maxParticipants?.toString() || '',
  })

  const availableSections = camp.patroGroup === 'GARCONS' ? sectionsGarcons : sectionsFilles
  const availableAnimateurs = animateurs.filter(a => a.section === camp.patroGroup)

  const handleSectionToggle = (section: Section) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }))
  }

  const handleAnimatorToggle = (animatorId: string) => {
    setFormData(prev => ({
      ...prev,
      animatorIds: prev.animatorIds.includes(animatorId)
        ? prev.animatorIds.filter(id => id !== animatorId)
        : [...prev.animatorIds, animatorId]
    }))
  }

  const handleSelectAllSections = () => {
    setFormData(prev => ({
      ...prev,
      sections: availableSections
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (formData.sections.length === 0) {
      setError('Veuillez sélectionner au moins une section')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/camps/${camp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la modification du camp')
      }

      router.push(`/dashboard/camps/${camp.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce camp ? Cette action est irréversible.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/camps/${camp.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression du camp')
      }

      router.push('/dashboard/camps')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsDeleting(false)
    }
  }

  const getSectionLabel = (section: Section): string => {
    const labels: Record<Section, string> = {
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
    return labels[section]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Nom du camp */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du camp <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Lieu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline w-4 h-4 mr-1" />
          Lieu <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date de début <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date de fin <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Heures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Heure de début <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Heure de fin <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Prix et max participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Euro className="inline w-4 h-4 mr-1" />
            Prix (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline w-4 h-4 mr-1" />
            Nombre max de participants (optionnel)
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* IBAN et Bénéficiaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IBAN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="BE00 0000 0000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bénéficiaire <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.beneficiaire}
            onChange={(e) => setFormData({ ...formData, beneficiaire: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nom du bénéficiaire"
          />
        </div>
      </div>

      {/* Sections */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Sections concernées <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleSelectAllSections}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Sélectionner toutes les sections
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {availableSections.map((section) => (
            <label
              key={section}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                formData.sections.includes(section)
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-gray-300 hover:border-green-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.sections.includes(section)}
                onChange={() => handleSectionToggle(section)}
                className="mr-2"
              />
              <span className="text-sm">{getSectionLabel(section)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Animateurs présents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Animateurs présents au camp
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4">
          {availableAnimateurs.map((animateur) => (
            <label
              key={animateur.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.animatorIds.includes(animateur.id)}
                onChange={() => handleAnimatorToggle(animateur.id)}
                className="mr-2"
              />
              <span className="text-sm">{animateur.prenom} {animateur.nom}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Annuler
        </button>
      </div>

      {/* Zone de danger */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-red-600 mb-3">Zone de danger</h3>
        <p className="text-sm text-gray-600 mb-4">
          La suppression du camp est définitive et supprimera également toutes les inscriptions associées.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Suppression...' : 'Supprimer le camp'}
        </button>
      </div>
    </form>
  )
}