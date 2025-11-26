'use client'

import { useState } from 'react'
import { Settings, PatroGroup } from '@prisma/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'


interface SettingsFormProps {
  settings: Settings | null
  section: 'GARCONS' | 'FILLES'
}

export default function SettingsForm({ settings, section }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    section: section,
    prixInscription: settings?.prixInscription || 45,
    emailContact: settings?.emailContact || 'contact@patro.be',
    adresse: settings?.adresse || '',
    horaires: settings?.horaires || '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('prix') ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès !' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des paramètres' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres généraux</h2>

      {message && (
        <Alert type={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prix */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Prix inscription annuelle (€)"
              name="prixInscription"
              type="number"
              step="0.01"
              value={formData.prixInscription}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-gray-500">
              Les prix des camps seront définis lors de la création de chaque camp par les animateurs.
            </p>
          </div>
        </div>

        {/* Infos de contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
          <div className="space-y-4">
            <Input
              label="Email général"
              name="emailContact"
              type="email"
              value={formData.emailContact}
              onChange={handleChange}
              required
            />
            <Input
              label="Adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              required
            />
            <Input
              label="Horaires"
              name="horaires"
              value={formData.horaires}
              onChange={handleChange}
              placeholder="Ex: Dimanches 14h00 - 17h00"
              required
            />
          </div>
        </div>

        <Button type="submit" isLoading={isLoading}>
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  )
}