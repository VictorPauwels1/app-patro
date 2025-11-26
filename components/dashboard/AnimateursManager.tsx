'use client'

import { useState } from 'react'
import { Animateur, PatroGroup, FonctionAnimateur } from '@prisma/client'
import Button from '@/components/ui/Button'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import Alert from '@/components/ui/Alert'

interface AnimateursManagerProps {
  animateurs: Animateur[]
  userRole: string
  userSection: PatroGroup | null
}

export default function AnimateursManager({ animateurs, userRole, userSection }: AnimateursManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Filtrer les animateurs selon le rôle
  const filteredAnimateurs = animateurs.filter(anim => {
    if (userRole === 'ADMIN') return true
    if (userRole === 'PRESIDENT_FILLES') return anim.section === 'FILLES'
    if (userRole === 'PRESIDENT_GARCONS') return anim.section === 'GARCONS'
    return false
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet animateur ?')) return

    try {
      const response = await fetch(`/api/animateurs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      setMessage({ type: 'success', text: 'Animateur supprimé avec succès' })
      window.location.reload()
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des animateurs</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un animateur
        </Button>
      </div>

      {message && (
        <Alert type={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      {showAddForm && (
        <AnimateurForm
          onClose={() => setShowAddForm(false)}
          userSection={userSection}
          userRole={userRole}
        />
      )}

      {/* Liste des animateurs par section */}
      <div className="space-y-8">
        {/* Filles */}
        {(userRole === 'ADMIN' || userRole === 'PRESIDENT_FILLES') && (
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Animateurs Filles</h3>
            <div className="space-y-2">
              {filteredAnimateurs
                .filter(a => a.section === 'FILLES')
                .map(animateur => (
                  <AnimateurCard
                    key={animateur.id}
                    animateur={animateur}
                    onDelete={handleDelete}
                    isEditing={editingId === animateur.id}
                    onEdit={() => setEditingId(animateur.id)}
                    onCancelEdit={() => setEditingId(null)}
                  />
                ))}
              {filteredAnimateurs.filter(a => a.section === 'FILLES').length === 0 && (
                <p className="text-gray-500 text-sm">Aucun animateur pour l'instant</p>
              )}
            </div>
          </div>
        )}

        {/* Garçons */}
        {(userRole === 'ADMIN' || userRole === 'PRESIDENT_GARCONS') && (
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Animateurs Garçons</h3>
            <div className="space-y-2">
              {filteredAnimateurs
                .filter(a => a.section === 'GARCONS')
                .map(animateur => (
                  <AnimateurCard
                    key={animateur.id}
                    animateur={animateur}
                    onDelete={handleDelete}
                    isEditing={editingId === animateur.id}
                    onEdit={() => setEditingId(animateur.id)}
                    onCancelEdit={() => setEditingId(null)}
                  />
                ))}
              {filteredAnimateurs.filter(a => a.section === 'GARCONS').length === 0 && (
                <p className="text-gray-500 text-sm">Aucun animateur pour l'instant</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant Card pour un animateur
function AnimateurCard({ 
  animateur, 
  onDelete, 
  isEditing, 
  onEdit, 
  onCancelEdit 
}: { 
  animateur: Animateur
  onDelete: (id: string) => void
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
}) {
  if (isEditing) {
    return <AnimateurEditForm animateur={animateur} onCancel={onCancelEdit} />
  }

  const fonctionLabel = {
    ANIMATEUR: 'Animateur',
    PRESIDENT: 'Président',
    VICE_PRESIDENT: 'Vice-Président',
    CO_PRESIDENT: 'Co-Président',
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">
            {animateur.prenom} {animateur.nom}
          </span>
          <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">
            {fonctionLabel[animateur.fonction]}
          </span>
          
          {animateur.afficherContact && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
              Affiché sur le site
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          📞 {animateur.telephone}
          {animateur.email && ` • 📧 ${animateur.email}`}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(animateur.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Formulaire d'ajout
function AnimateurForm({ 
  onClose, 
  userSection, 
  userRole 
}: { 
  onClose: () => void
  userSection: PatroGroup | null
  userRole: string
}) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    section: userRole === 'ADMIN' ? 'GARCONS' : (userSection || 'GARCONS'),
    fonction: 'ANIMATEUR' as FonctionAnimateur,
    afficherContact: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/animateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erreur lors de la création')

      window.location.reload()
    } catch (error) {
      alert('Erreur lors de la création de l\'animateur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-green-50 rounded-lg p-6 mb-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Nouvel animateur</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Prénom *"
          value={formData.prenom}
          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          placeholder="Nom *"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          type="tel"
          placeholder="Téléphone *"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        
        {userRole === 'ADMIN' && (
          <select
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value as PatroGroup })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="GARCONS">Garçons</option>
            <option value="FILLES">Filles</option>
          </select>
        )}
        
        <select
          value={formData.fonction}
          onChange={(e) => setFormData({ ...formData, fonction: e.target.value as FonctionAnimateur })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="ANIMATEUR">Animateur</option>
          <option value="VICE_PRESIDENT">Vice-Président</option>
          <option value="CO_PRESIDENT">Co-Président</option>
          <option value="PRESIDENT">Président</option>
        </select>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.afficherContact}
          onChange={(e) => setFormData({ ...formData, afficherContact: e.target.checked })}
          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
        />
        <span className="text-sm text-gray-700">Afficher dans les contacts sur la page d'accueil</span>
      </label>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isLoading}>
          <Check className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
      </div>
    </form>
  )
}

// Formulaire d'édition
function AnimateurEditForm({ animateur, onCancel }: { animateur: Animateur, onCancel: () => void }) {
  const [formData, setFormData] = useState(animateur)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/animateurs/${animateur.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      window.location.reload()
    } catch (error) {
      alert('Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={formData.prenom}
          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          required
        />
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          required
        />
        <input
          type="tel"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          required
        />
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <select
          value={formData.fonction}
          onChange={(e) => setFormData({ ...formData, fonction: e.target.value as FonctionAnimateur })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="ANIMATEUR">Animateur</option>
          <option value="VICE_PRESIDENT">Vice-Président</option>
          <option value="CO_PRESIDENT">Co-Président</option>
          <option value="PRESIDENT">Président</option>
        </select>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.afficherContact}
          onChange={(e) => setFormData({ ...formData, afficherContact: e.target.checked })}
          className="w-4 h-4 text-green-600 rounded"
        />
        <span className="text-sm text-gray-700">Afficher dans les contacts</span>
      </label>

      

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </form>
  )
}