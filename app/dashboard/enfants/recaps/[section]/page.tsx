import { redirect, notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewGroup } from '@/lib/permissions'
import PrintTrigger from '@/components/PrintTrigger'
import { 
  getCurrentSchoolYear, 
  calculateSchoolAge, 
  getSectionLabel,
  formatPhoneNumber,
  getSectionAgeRange
} from '@/lib/utils'
import { AlertTriangle, Utensils, Pill } from 'lucide-react'
import { Section } from '@prisma/client'

export default async function RecapsSectionPage(props: { params: Promise<{ section: string }> }) {
  const session = await requireAuth().catch(() => redirect('/login'))
  const params = await props.params  // ← Ajouter
  const currentYear = getCurrentSchoolYear()
  const section = params.section as Section

  const registrations = await prisma.registration.findMany({
    where: {
      year: currentYear,
      child: {
        section: section
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
    orderBy: {
      child: {
        lastName: 'asc'
      }
    }
  })

  // Vérifier les permissions
  if (registrations.length > 0) {
    const firstChild = registrations[0].child
    if (!canViewGroup(session.user, firstChild.patroGroup)) {
      redirect('/dashboard')
    }
  }

  if (registrations.length === 0) {
    notFound()
  }

  // Filtrer par type
  const allergies = registrations.filter(r => {
    const medicalInfo = r.medicalInfo as any
    return medicalInfo?.allergies?.hasAllergies === true
  })

  const regimes = registrations.filter(r => {
    const medicalInfo = r.medicalInfo as any
    return medicalInfo?.diet?.hasDiet === true
  })

  const medicaments = registrations.filter(r => {
    const medicalInfo = r.medicalInfo as any
    return medicalInfo?.medications?.takesMedication === true
  })

  return (
    <>
      <div className="print-container">
        {/* Page de garde */}
        <div className="recap-cover">
          <h1 className="text-4xl font-bold text-center mb-4">
            Fiches Récapitulatives
          </h1>
          <h2 className="text-3xl text-center text-blue-600 mb-4">
            {getSectionLabel(section)}
          </h2>
          <p className="text-xl text-center text-gray-600 mb-2">
            {getSectionAgeRange(section)}
          </p>
          <p className="text-xl text-center text-gray-600 mb-2">
            Année scolaire {currentYear}
          </p>
          <div className="mt-8 space-y-2 text-center">
            <p className="text-lg">
              <span className="font-semibold text-red-600">{allergies.length}</span> enfant(s) avec allergies
            </p>
            <p className="text-lg">
              <span className="font-semibold text-yellow-600">{regimes.length}</span> enfant(s) avec régime
            </p>
            <p className="text-lg">
              <span className="font-semibold text-blue-600">{medicaments.length}</span> enfant(s) avec médicaments
            </p>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            Document confidentiel - À usage exclusif des animateurs
          </div>
        </div>

        {/* FICHE 1 : ALLERGIES */}
        <div className="recap-page">
          <div className="recap-header allergies-header">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h2 className="text-3xl font-bold">⚠️ ALLERGIES - {getSectionLabel(section)}</h2>
              <p className="text-lg mt-1">{allergies.length} enfant(s) concerné(s)</p>
            </div>
          </div>

          {allergies.length === 0 ? (
            <div className="empty-message">
              ✓ Aucun enfant avec allergie déclarée dans cette section
            </div>
          ) : (
            <div className="recap-list">
              {allergies.map((registration) => {
                const child = registration.child
                const parent1 = child.primaryParent
                const medicalInfo = registration.medicalInfo as any
                const age = calculateSchoolAge(child.birthDate)

                return (
                  <div key={registration.id} className="recap-card allergies-card">
                    <div className="recap-card-header">
                      <div>
                        <div className="child-name">
                          {child.firstName} {child.lastName}
                        </div>
                        <div className="child-info">
                          {age} ans
                        </div>
                      </div>
                      <div className="contact-info">
                        <div className="contact-name">{parent1.firstName} {parent1.lastName}</div>
                        <div className="contact-phone">{formatPhoneNumber(parent1.phone)}</div>
                      </div>
                    </div>
                    <div className="recap-card-content">
                      <div className="recap-detail-item">
                        <span className="recap-label">Allergènes :</span>
                        <span className="recap-value highlight-danger">
                          {medicalInfo.allergies.allergyList}
                        </span>
                      </div>
                      {medicalInfo.allergies.allergyConsequences && (
                        <div className="recap-detail-item">
                          <span className="recap-label">Conséquences :</span>
                          <span className="recap-value">{medicalInfo.allergies.allergyConsequences}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* FICHE 2 : RÉGIMES */}
        <div className="recap-page">
          <div className="recap-header regimes-header">
            <Utensils className="w-8 h-8" />
            <div>
              <h2 className="text-3xl font-bold">Régimes Alimentaires - {getSectionLabel(section)}</h2>
              <p className="text-lg mt-1">{regimes.length} enfant(s) concerné(s)</p>
            </div>
          </div>

          {regimes.length === 0 ? (
            <div className="empty-message">
              ✓ Aucun enfant avec régime spécifique dans cette section
            </div>
          ) : (
            <div className="recap-list">
              {regimes.map((registration) => {
                const child = registration.child
                const parent1 = child.primaryParent
                const medicalInfo = registration.medicalInfo as any
                const age = calculateSchoolAge(child.birthDate)

                return (
                  <div key={registration.id} className="recap-card regimes-card">
                    <div className="recap-card-header">
                      <div>
                        <div className="child-name">
                          {child.firstName} {child.lastName}
                        </div>
                        <div className="child-info">
                          {age} ans
                        </div>
                      </div>
                      <div className="contact-info">
                        <div className="contact-name">{parent1.firstName} {parent1.lastName}</div>
                        <div className="contact-phone">{formatPhoneNumber(parent1.phone)}</div>
                      </div>
                    </div>
                    <div className="recap-card-content">
                      <div className="recap-detail-item">
                        <span className="recap-label">Régime :</span>
                        <span className="recap-value highlight-warning">
                          {medicalInfo.diet.dietDetails}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* FICHE 3 : MÉDICAMENTS */}
        <div className="recap-page">
          <div className="recap-header medicaments-header">
            <Pill className="w-8 h-8" />
            <div>
              <h2 className="text-3xl font-bold">💊 Médicaments - {getSectionLabel(section)}</h2>
              <p className="text-lg mt-1">{medicaments.length} enfant(s) concerné(s)</p>
            </div>
          </div>

          {medicaments.length === 0 ? (
            <div className="empty-message">
              ✓ Aucun enfant avec prise de médicaments dans cette section
            </div>
          ) : (
            <div className="recap-list">
              {medicaments.map((registration) => {
                const child = registration.child
                const parent1 = child.primaryParent
                const medicalInfo = registration.medicalInfo as any
                const age = calculateSchoolAge(child.birthDate)

                return (
                  <div key={registration.id} className="recap-card medicaments-card">
                    <div className="recap-card-header">
                      <div>
                        <div className="child-name">
                          {child.firstName} {child.lastName}
                        </div>
                        <div className="child-info">
                          {age} ans
                        </div>
                      </div>
                      <div className="contact-info">
                        <div className="contact-name">{parent1.firstName} {parent1.lastName}</div>
                        <div className="contact-phone">{formatPhoneNumber(parent1.phone)}</div>
                      </div>
                    </div>
                    <div className="recap-card-content">
                      <div className="recap-detail-item">
                        <span className="recap-label">Médicament(s) :</span>
                        <span className="recap-value highlight-info">
                          {medicalInfo.medications.medicationDetails}
                        </span>
                      </div>
                      <div className="recap-detail-item">
                        <span className="recap-label">Autonomie :</span>
                        <span className="recap-value">
                          {medicalInfo.medications.isAutonomous ? (
                            <span className="badge-success">✓ Autonome</span>
                          ) : (
                            <span className="badge-warning">⚠ Aide nécessaire</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      return (
    <>
      <PrintTrigger />
      <div className="print-container">
        {/* ... */}
      </div>
    </>
  )
    </>
  )
}