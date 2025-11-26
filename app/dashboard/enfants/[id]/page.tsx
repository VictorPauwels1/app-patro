import { redirect, notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewGroup } from '@/lib/permissions'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  calculateSchoolAge, 
  getSectionLabel,
  formatPhoneNumber,
  formatDate
} from '@/lib/utils'
import { Printer, User, Phone, Mail, MapPin, Heart, FileText } from 'lucide-react'
import PrintButton from '@/components/PrintButton'

export default async function EnfantDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await requireAuth().catch(() => redirect('/login'))
  const params = await props.params  // ← Ajouter cette ligne
  
  // Recuperer l'enfant avec toutes ses relations
  const child = await prisma.child.findUnique({
    where: { id: params.id },  // ← Maintenant params.id existe
    include: {
      primaryParent: true,
      secondaryParent: true,
      registrations: {
        orderBy: { year: 'desc' }
      }
    }
  })

  if (!child) {
    notFound()
  }

  // Verifier les permissions
  if (!canViewGroup(session.user, child.patroGroup)) {
    redirect('/dashboard')
  }

  const currentRegistration = child.registrations[0]
  const medicalInfo = currentRegistration?.medicalInfo as any

  const age = calculateSchoolAge(child.birthDate)

  return (
    <>
      <DashboardLayout user={session.user}>
        <div className="space-y-6">
          {/* Header avec bouton imprimer */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {child.firstName} {child.lastName}
              </h1>
              <p className="text-gray-600 mt-1">
                {age} ans • {age >= 18 ? 'Animateur' : (child.section ? getSectionLabel(child.section) : 'Section non définie')}
              </p>
            </div>
            <PrintButton 
  childId={child.id}
  fileName={`fiche-${child.lastName}-${child.firstName}.pdf`}
/>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Informations générales</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Date de naissance :</span> {formatDate(child.birthDate)}
                </div>
                <div>
                  <span className="font-semibold">Groupe :</span>{' '}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    child.patroGroup === 'GARCONS' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {child.patroGroup === 'GARCONS' ? 'Garçons' : 'Filles'}
                  </span>
                </div>
                {currentRegistration && (
                  <>
                    <div>
                      <span className="font-semibold">Poids :</span> {currentRegistration.weight} kg
                    </div>
                    <div>
                      <span className="font-semibold">Paiement :</span>{' '}
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        currentRegistration.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentRegistration.isPaid ? 'Payé' : 'En attente'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Responsables */}
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Responsables</h2>
              </div>
              <div className="space-y-4">
                {/* Responsable 1 */}
                <div className="border-l-4 border-green-500 pl-3">
                  <div className="font-semibold text-gray-900">
                    {child.primaryParent.firstName} {child.primaryParent.lastName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{child.primaryParent.relationship}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {formatPhoneNumber(child.primaryParent.phone)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {child.primaryParent.email}
                    </div>
                  </div>
                </div>

                {/* Responsable 2 */}
                <div className="border-l-4 border-blue-500 pl-3">
                  <div className="font-semibold text-gray-900">
                    {child.secondaryParent.firstName} {child.secondaryParent.lastName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{child.secondaryParent.relationship}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {formatPhoneNumber(child.secondaryParent.phone)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold">Adresse</h2>
              </div>
              <div className="text-sm space-y-1">
                <div>{child.address}</div>
                <div>{child.postalCode} {child.city}</div>
                {child.secondaryEmail && (
                  <div className="mt-3 flex items-center gap-2 text-gray-600">
                    <Mail className="w-3 h-3" />
                    {child.secondaryEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Droits à l'image */}
            {currentRegistration && (
              <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold">Droits à l'image</h2>
                </div>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Autorisation :</span>{' '}
                    {currentRegistration.photoConsent === 'full' && 'Premier et second plan'}
                    {currentRegistration.photoConsent === 'background' && 'Second plan uniquement'}
                    {currentRegistration.photoConsent === 'none' && 'Aucune autorisation'}
                  </div>
                  <div>
                    <span className="font-semibold">Usage communication :</span>{' '}
                    {currentRegistration.photoUsage ? 'Oui' : 'Non'}
                  </div>
                  <div>
                    <span className="font-semibold">Archives FNP :</span>{' '}
                    {currentRegistration.photoArchive ? 'Oui' : 'Non'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fiche médicale complète */}
          {medicalInfo && (
            <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold">Fiche médicale</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Médecin */}
                <div className="print:break-inside-avoid">
                  <h3 className="font-semibold text-gray-900 mb-2">Médecin de famille</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Nom :</strong> {medicalInfo.doctorName}</div>
                    <div><strong>Tél :</strong> {formatPhoneNumber(medicalInfo.doctorPhone)}</div>
                  </div>
                </div>

                {/* Participation */}
                <div className="print:break-inside-avoid">
                  <h3 className="font-semibold text-gray-900 mb-2">Participation aux activités</h3>
                  <div className="text-sm">
                    {medicalInfo.canParticipate ? (
                      <span className="text-green-600 font-semibold">✓ Peut participer</span>
                    ) : (
                      <div>
                        <span className="text-red-600 font-semibold">✗ Restrictions</span>
                        <p className="mt-1 text-gray-700">{medicalInfo.participationRestrictions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Natation */}
                <div className="print:break-inside-avoid">
                  <h3 className="font-semibold text-gray-900 mb-2">Natation</h3>
                  <div className="text-sm">
                    {medicalInfo.canSwim === 'yes' && '✓ Sait nager'}
                    {medicalInfo.canSwim === 'no' && '✗ Ne sait pas nager'}
                    {medicalInfo.canSwim === 'alittle' && '~ Sait un peu nager'}
                  </div>
                </div>

                {/* Vaccin tétanos */}
                <div className="print:break-inside-avoid">
                  <h3 className="font-semibold text-gray-900 mb-2">Vaccin tétanos</h3>
                  <div className="text-sm">
                    {medicalInfo.tetanusVaccine ? (
                      <span className="text-green-600">✓ En ordre</span>
                    ) : (
                      <span className="text-red-600">✗ Pas en ordre</span>
                    )}
                  </div>
                </div>

                {/* Allergies */}
                {medicalInfo.allergies?.hasAllergies && (
                  <div className="md:col-span-2 bg-red-50 border-l-4 border-red-500 p-4 print:break-inside-avoid">
                    <h3 className="font-semibold text-red-900 mb-2">⚠️ ALLERGIES</h3>
                    <div className="text-sm space-y-1">
                      <div><strong>Allergènes :</strong> {medicalInfo.allergies.allergyList}</div>
                      {medicalInfo.allergies.allergyConsequences && (
                        <div><strong>Conséquences :</strong> {medicalInfo.allergies.allergyConsequences}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Régime */}
                {medicalInfo.diet?.hasDiet && (
                  <div className="md:col-span-2 bg-yellow-50 border-l-4 border-yellow-500 p-4 print:break-inside-avoid">
                    <h3 className="font-semibold text-yellow-900 mb-2">Régime alimentaire</h3>
                    <div className="text-sm">{medicalInfo.diet.dietDetails}</div>
                  </div>
                )}

                {/* Médicaments */}
                {medicalInfo.medications?.takesMedication && (
                  <div className="md:col-span-2 bg-blue-50 border-l-4 border-blue-500 p-4 print:break-inside-avoid">
                    <h3 className="font-semibold text-blue-900 mb-2">💊 Médicaments</h3>
                    <div className="text-sm space-y-1">
                      <div>{medicalInfo.medications.medicationDetails}</div>
                      <div className="mt-2">
                        <strong>Autonomie :</strong>{' '}
                        {medicalInfo.medications.isAutonomous ? 'Autonome' : 'Non autonome (aide nécessaire)'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Informations importantes */}
                {medicalInfo.importantMedicalInfo && (
                  <div className="md:col-span-2 print:break-inside-avoid">
                    <h3 className="font-semibold text-gray-900 mb-2">Données médicales importantes</h3>
                    <div className="text-sm bg-gray-50 p-3 rounded">{medicalInfo.importantMedicalInfo}</div>
                  </div>
                )}

                {/* Historique médical */}
                {medicalInfo.medicalHistory && (
                  <div className="md:col-span-2 print:break-inside-avoid">
                    <h3 className="font-semibold text-gray-900 mb-2">Historique médical</h3>
                    <div className="text-sm bg-gray-50 p-3 rounded">{medicalInfo.medicalHistory}</div>
                  </div>
                )}

                {/* Autres informations */}
                {medicalInfo.otherInfo && (
                  <div className="md:col-span-2 print:break-inside-avoid">
                    <h3 className="font-semibold text-gray-900 mb-2">Autres informations</h3>
                    <div className="text-sm bg-gray-50 p-3 rounded">{medicalInfo.otherInfo}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>

      
    </>
  )
}