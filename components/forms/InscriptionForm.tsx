'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import { InscriptionFormData } from '@/lib/validations'
import { AlertCircle, User, MapPin, Mail, Heart, FileText, Euro } from 'lucide-react'

export default function InscriptionForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<Partial<InscriptionFormData>>({
    patroGroup: undefined,
    photoConsent: 'full',
    photoUsage: false,
    photoArchive: false,
    canParticipate: true,
    canSwim: 'yes',
    tetanusVaccine: true,
    hasAllergies: false,
    hasDiet: false,
    takesMedication: false,
    medicationAutonomous: false,
    emergencyMedicalConsent: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (err: any) {
      setError(err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert type="success" title="Inscription reussie !">
          <div className="space-y-2">
            <p>Merci ! L'inscription a bien ete enregistree.</p>
            <div className="bg-green-100 border border-green-200 rounded p-4 mt-4">
              <p className="font-semibold mb-2">Pour finaliser l'inscription :</p>
              <p className="text-sm">Merci de payer la cotisation de <strong>45€</strong> sur le compte</p>
              <p className="text-sm font-mono bg-white px-2 py-1 rounded mt-1">BE56 7755 9576 1388</p>
              <p className="text-sm mt-2">
                Communication : <strong>{formData.childLastName} {formData.childFirstName}</strong>
              </p>
            </div>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
      {error && (
        <Alert type="error" title="Erreur">
          {error}
        </Alert>
      )}

      {/* ============================================ */}
      {/* SECTION 1 : INFORMATIONS ENFANT */}
      {/* ============================================ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Informations de l'enfant
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de l'enfant"
            name="childLastName"
            value={formData.childLastName || ''}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Prenom de l'enfant"
            name="childFirstName"
            value={formData.childFirstName || ''}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Date de naissance"
            name="childBirthDate"
            type="date"
            value={formData.childBirthDate || ''}
            onChange={handleChange}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Groupe <span className="text-red-500">*</span>
            </label>
            <select
              name="patroGroup"
              value={formData.patroGroup || ''}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selectionnez un groupe</option>
              <option value="GARCONS">Garcons</option>
              <option value="FILLES">Filles</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              La section sera determinee automatiquement selon l'age
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 2 : 1ER RESPONSABLE */}
      {/* ============================================ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            1er responsable
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom"
            name="parent1LastName"
            value={formData.parent1LastName || ''}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Prenom"
            name="parent1FirstName"
            value={formData.parent1FirstName || ''}
            onChange={handleChange}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien de parente <span className="text-red-500">*</span>
            </label>
            <select
              name="parent1Relationship"
              value={formData.parent1Relationship || ''}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selectionnez</option>
              <option value="Pere">Pere</option>
              <option value="Mere">Mere</option>
              <option value="Tuteur legal">Tuteur legal</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          
          <Input
            label="Numero de telephone"
            name="parent1Phone"
            type="tel"
            value={formData.parent1Phone || ''}
            onChange={handleChange}
            placeholder="04XX XX XX XX"
            required
          />
          
          <Input
            label="Adresse email"
            name="parent1Email"
            type="email"
            value={formData.parent1Email || ''}
            onChange={handleChange}
            required
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 3 : 2EME RESPONSABLE */}
      {/* ============================================ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            2eme responsable
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom"
            name="parent2LastName"
            value={formData.parent2LastName || ''}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Prenom"
            name="parent2FirstName"
            value={formData.parent2FirstName || ''}
            onChange={handleChange}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien de parente <span className="text-red-500">*</span>
            </label>
            <select
              name="parent2Relationship"
              value={formData.parent2Relationship || ''}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selectionnez</option>
              <option value="Pere">Pere</option>
              <option value="Mere">Mere</option>
              <option value="Tuteur legal">Tuteur legal</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          
          <Input
            label="Numero de telephone"
            name="parent2Phone"
            type="tel"
            value={formData.parent2Phone || ''}
            onChange={handleChange}
            placeholder="04XX XX XX XX"
            required
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 4 : ADRESSE ET CONTACTS */}
      {/* ============================================ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MapPin className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Adresse et contacts
          </h2>
        </div>
        
        <div className="space-y-4">
          <Input
            label="Adresse complete (rue et numero)"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Code postal"
              name="postalCode"
              value={formData.postalCode || ''}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Ville"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              required
            />
          </div>
          
          <Input
            label="2eme adresse email (facultatif)"
            name="secondaryEmail"
            type="email"
            value={formData.secondaryEmail || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 5 : DROITS A L'IMAGE */}
      {/* ============================================ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Mail className="w-6 h-6 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Droits a l'image
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Autorisation photos/videos <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="photoConsent"
                  value="full"
                  checked={formData.photoConsent === 'full'}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  J'autorise mon enfant a apparaitre sur des photos et/ou videos au <strong>premier plan et/ou second plan</strong>
                </span>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="photoConsent"
                  value="background"
                  checked={formData.photoConsent === 'background'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  J'autorise mon enfant a apparaitre sur des photos et/ou videos <strong>uniquement au second plan</strong>
                </span>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="photoConsent"
                  value="none"
                  checked={formData.photoConsent === 'none'}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  Je <strong>n'autorise pas</strong> mon enfant a apparaitre sur les photos et/ou videos
                </span>
              </label>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="photoUsage"
                checked={formData.photoUsage || false}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                J'accepte que l'on puisse reproduire et exposer les photos et videos dans differents supports de communication
              </span>
            </label>
            
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="photoArchive"
                checked={formData.photoArchive || false}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                J'accepte que les photos et videos soient utilisees pour les archives du Mouvement et la creation de souvenirs pour la FNP
              </span>
            </label>
          </div>
        </div>
      </div>
      {/* ============================================ */}
      {/* SECTION 6 : FICHE MEDICALE */}
      {/* ============================================ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Heart className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Fiche medicale
          </h2>
        </div>
        
        <div className="space-y-6">
          {/* Medecin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du medecin de famille"
              name="doctorName"
              value={formData.doctorName || ''}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Numero de telephone du medecin"
              name="doctorPhone"
              type="tel"
              value={formData.doctorPhone || ''}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Participation aux activites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Le participant peut-il participer aux activites proposees ? (sport, excursion, jeux, ...) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="canParticipate"
                  value="true"
                  checked={formData.canParticipate === true}
                  onChange={(e) => setFormData(prev => ({ ...prev, canParticipate: true }))}
                  required
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="canParticipate"
                  value="false"
                  checked={formData.canParticipate === false}
                  onChange={(e) => setFormData(prev => ({ ...prev, canParticipate: false }))}
                />
                <span className="text-sm">Non</span>
              </label>
            </div>
          </div>
          
          {formData.canParticipate === false && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Si non, quelle(s) est(sont) la(les) raison(s) ?
              </label>
              <textarea
                name="participationRestrictions"
                value={formData.participationRestrictions || ''}
                onChange={handleChange}
                rows={2}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {/* Natation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Le participant sait-il nager ? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="canSwim"
                  value="yes"
                  checked={formData.canSwim === 'yes'}
                  onChange={handleChange}
                  required
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="canSwim"
                  value="no"
                  checked={formData.canSwim === 'no'}
                  onChange={handleChange}
                />
                <span className="text-sm">Non</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="canSwim"
                  value="alittle"
                  checked={formData.canSwim === 'alittle'}
                  onChange={handleChange}
                />
                <span className="text-sm">Un peu</span>
              </label>
            </div>
          </div>
          
          {/* Donnees medicales importantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y a-t-il des donnees medicales importantes a connaitre ?
            </label>
            <textarea
              name="importantMedicalInfo"
              value={formData.importantMedicalInfo || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Problemes cardiaques, epilepsie, asthme, diabete, mal des transports, rhumatisme, somnambulisme, affections cutanees, handicap moteur ou mental..."
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Merci d'indiquer la frequence, la gravite et les actions a mettre en oeuvre
            </p>
          </div>
          
          {/* Historique medical */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maladies ou interventions medicales
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory || ''}
              onChange={handleChange}
              rows={2}
              placeholder="Merci d'indiquer l'annee"
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Vaccin tetanos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Le participant est-il en ordre de vaccination contre le tetanos ? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tetanusVaccine"
                  value="true"
                  checked={formData.tetanusVaccine === true}
                  onChange={(e) => setFormData(prev => ({ ...prev, tetanusVaccine: true }))}
                  required
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tetanusVaccine"
                  value="false"
                  checked={formData.tetanusVaccine === false}
                  onChange={(e) => setFormData(prev => ({ ...prev, tetanusVaccine: false }))}
                />
                <span className="text-sm">Non</span>
              </label>
            </div>
          </div>
          
          {/* Allergies */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Le participant est-il allergique a certaines substances, aliments ou medicaments ? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasAllergies"
                  value="true"
                  checked={formData.hasAllergies === true}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasAllergies: true }))}
                  required
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasAllergies"
                  value="false"
                  checked={formData.hasAllergies === false}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasAllergies: false }))}
                />
                <span className="text-sm">Non</span>
              </label>
            </div>
            
            {formData.hasAllergies && (
              <div className="space-y-3 ml-6">
                <Input
                  label="Le(s)quel(s) ?"
                  name="allergyList"
                  value={formData.allergyList || ''}
                  onChange={handleChange}
                  placeholder="Arachides, pollen, penicilline..."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quelles en sont les consequences ?
                  </label>
                  <textarea
                    name="allergyConsequences"
                    value={formData.allergyConsequences || ''}
                    onChange={handleChange}
                    rows={2}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Regime alimentaire */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Le participant doit-il suivre un regime alimentaire ? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasDiet"
                  value="true"
                  checked={formData.hasDiet === true}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasDiet: true }))}
                  required
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasDiet"
                  value="false"
                  checked={formData.hasDiet === false}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasDiet: false }))}
                />
                <span className="text-sm">Non</span>
              </label>
            </div>
            
            {formData.hasDiet && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Si oui, lequel ?
                </label>
                <textarea
                  name="dietDetails"
                  value={formData.dietDetails || ''}
                  onChange={handleChange}
                  rows={2}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          
          {/* Medicaments */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Le participant doit-il prendre des medicaments ? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="takesMedication"
                  value="true"
                  checked={formData.takesMedication === true}
                  onChange={(e) => setFormData(prev => ({ ...prev, takesMedication: true }))}
                  required
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="takesMedication"
                  value="false"
                  checked={formData.takesMedication === false}
                  onChange={(e) => setFormData(prev => ({ ...prev, takesMedication: false }))}
                />
                <span className="text-sm">Non</span>
              </label>
            </div>
            
            {formData.takesMedication && (
              <div className="space-y-3 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Le(s)quel(s) ? En quelle quantite ? Et quand ?
                  </label>
                  <textarea
                    name="medicationDetails"
                    value={formData.medicationDetails || ''}
                    onChange={handleChange}
                    rows={3}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="medicationAutonomous"
                    checked={formData.medicationAutonomous || false}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Le participant est autonome dans la prise de ses medicaments
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-7">
                  Rappel : les medicaments ne peuvent pas etre partages entre les participants
                </p>
              </div>
            )}
          </div>
          
          {/* Autres informations */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autres renseignements importants
            </label>
            <textarea
              name="otherInfo"
              value={formData.otherInfo || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Insomnie, incontinence nocturne, troubles psychiques ou physiques, port de lunettes ou d'appareils auditifs..."
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Poids */}
          <div>
            <Input
              label="Poids du participant (en kg)"
              name="weight"
              type="number"
              step="0.1"
              value={formData.weight || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      {/* ============================================ */}
      {/* SECTION 7 : AUTORISATION MEDICALE D'URGENCE */}
      {/* ============================================ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Autorisation medicale d'urgence
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-semibold mb-2">
              Remarque importante :
            </p>
            <p className="text-sm text-gray-700">
              Les animateurs disposent d'une boite de premiers soins. Dans le cas de situations ponctuelles ou dans l'attente de l'arrivee du medecin, ils peuvent administrer les medicaments suivants : du paracetamol ; du loperamide (aux plus de 6 ans) ; de la creme a l'arnica ; de la creme Euceta ou Calendeel ; du desinfectant (Cedium ou Isobetadine) ; du Flamigel.
            </p>
          </div>
          
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="emergencyMedicalConsent"
                checked={formData.emergencyMedicalConsent || false}
                onChange={handleChange}
                required
                className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Autorisation medicale d'urgence <span className="text-red-600">*</span>
                </p>
                <p className="text-sm text-gray-700">
                  Je marque mon accord pour que la prise en charge ou les traitements estimes necessaires soient entrepris durant le sejour de mon enfant par le responsable de centre de vacances ou par le service medical qui y est associe. J'autorise le medecin local a prendre les decisions qu'il juge urgentes et indispensables pour assurer l'etat de sante de l'enfant, meme s'il s'agit d'une intervention chirurgicale.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 8 : PAIEMENT */}
      {/* ============================================ */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Euro className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Paiement
          </h2>
        </div>
        
        <div className="bg-white rounded-lg p-4 space-y-3">
          <p className="text-gray-700">
            Pour confirmer votre inscription, merci de bien vouloir payer la cotisation de <strong className="text-green-600 text-lg">45€</strong> sur le compte :
          </p>
          
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Numero de compte IBAN :</p>
            <p className="text-xl font-mono font-bold text-gray-900">
              BE56 7755 9576 1388
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>Communication :</strong> {formData.childLastName || '[NOM]'} {formData.childFirstName || '[Prenom]'} {formData.patroGroup ? `(${formData.patroGroup === 'GARCONS' ? 'Garcons' : 'Filles'})` : '([Section])'}
            </p>
          </div>
          
          <p className="text-xs text-gray-600 text-center">
            L'inscription ne sera validee qu'apres reception du paiement
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* BOUTON DE SOUMISSION */}
      {/* ============================================ */}
      <div className="flex flex-col items-center gap-4 py-6">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full md:w-auto px-12"
        >
          {isLoading ? 'Envoi en cours...' : 'Valider l\'inscription'}
        </Button>
        
        <p className="text-sm text-gray-600 text-center max-w-2xl">
          En validant ce formulaire, vous confirmez que toutes les informations fournies sont exactes et a jour.
        </p>
      </div>
    </form>
  )
}