import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Styles optimisés pour A4
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '2 solid #2563eb',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 6,
    borderBottom: '1 solid #ddd',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#4b5563',
  },
  value: {
    width: '70%',
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  gridItem: {
    flex: 1,
  },
  alert: {
    padding: 8,
    marginTop: 6,
    borderRadius: 4,
    borderLeft: '4 solid #dc2626',
    backgroundColor: '#fee2e2',
  },
  alertTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 3,
  },
  alertText: {
    fontSize: 9,
    color: '#7f1d1d',
  },
  warning: {
    borderLeft: '4 solid #f59e0b',
    backgroundColor: '#fef3c7',
  },
  info: {
    borderLeft: '4 solid #3b82f6',
    backgroundColor: '#dbeafe',
  },
  contactBox: {
    flex: 1,
    padding: 6,
    backgroundColor: '#fff',
    border: '1 solid #e5e7eb',
    borderRadius: 3,
  },
  contactName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 1,
  },
})

interface FicheMedicaleData {
  child: {
    firstName: string
    lastName: string
    birthDate: Date
    section: string
    patroGroup: string
    address: string
    city: string
    postalCode: string
  }
  parent1: {
    firstName: string
    lastName: string
    relationship: string
    phone: string
    email: string
  }
  parent2: {
    firstName: string
    lastName: string
    relationship: string
    phone: string
  }
  registration: {
    weight: number
    medicalInfo: any
  }
  age: number
  sectionLabel: string
}

interface FicheMedicaleDocumentProps {
  data: FicheMedicaleData | FicheMedicaleData[]
}

// Composant pour une seule page/fiche
function FichePage({ data }: { data: FicheMedicaleData }) {
  const { child, parent1, parent2, registration, age, sectionLabel } = data
  const medicalInfo = registration.medicalInfo

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {child.firstName} {child.lastName}
          </Text>
          <Text style={styles.subtitle}>
            {age} ans • {age >= 18 ? 'Animateur' : sectionLabel}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 10, color: '#6b7280' }}>
            {child.patroGroup === 'GARCONS' ? 'Garçons' : 'Filles'}
          </Text>
        </View>
      </View>

      {/* Infos générales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations générales</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Date de naissance :</Text>
          <Text style={styles.value}>{new Date(child.birthDate).toLocaleDateString('fr-BE')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Poids :</Text>
          <Text style={styles.value}>{registration.weight} kg</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Adresse :</Text>
          <Text style={styles.value}>
            {child.address}, {child.postalCode} {child.city}
          </Text>
        </View>
      </View>

      {/* Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacts d'urgence</Text>
        <View style={styles.grid}>
          <View style={styles.contactBox}>
            <Text style={styles.contactName}>
              {parent1.firstName} {parent1.lastName}
            </Text>
            <Text style={styles.contactDetail}>{parent1.relationship}</Text>
            <Text style={styles.contactDetail}>Tel: {parent1.phone}</Text>
            <Text style={styles.contactDetail}>{parent1.email}</Text>
          </View>
          <View style={styles.contactBox}>
            <Text style={styles.contactName}>
              {parent2.firstName} {parent2.lastName}
            </Text>
            <Text style={styles.contactDetail}>{parent2.relationship}</Text>
            <Text style={styles.contactDetail}>Tel: {parent2.phone}</Text>
          </View>
        </View>
      </View>

      {/* Fiche médicale */}
      {medicalInfo && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fiche medicale</Text>
            
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Medecin :</Text>
                  <Text style={styles.value}>{medicalInfo.doctorName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Tel medecin :</Text>
                  <Text style={styles.value}>{medicalInfo.doctorPhone}</Text>
                </View>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Natation :</Text>
                  <Text style={styles.value}>
                    {medicalInfo.canSwim === 'yes' && 'Sait nager'}
                    {medicalInfo.canSwim === 'no' && 'Ne sait pas nager'}
                    {medicalInfo.canSwim === 'alittle' && 'Un peu'}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Tetanos :</Text>
                  <Text style={styles.value}>
                    {medicalInfo.tetanusVaccine ? 'En ordre' : 'Pas en ordre'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Allergies */}
          {medicalInfo.allergies?.hasAllergies && (
            <View style={[styles.alert]}>
              <Text style={styles.alertTitle}>ALLERGIES</Text>
              <Text style={styles.alertText}>
                Allergenes: {medicalInfo.allergies.allergyList}
              </Text>
              {medicalInfo.allergies.allergyConsequences && (
                <Text style={styles.alertText}>
                  Consequences: {medicalInfo.allergies.allergyConsequences}
                </Text>
              )}
            </View>
          )}

          {/* Régime */}
          {medicalInfo.diet?.hasDiet && (
            <View style={[styles.alert, styles.warning]}>
              <Text style={[styles.alertTitle, { color: '#92400e' }]}>
                Regime alimentaire
              </Text>
              <Text style={[styles.alertText, { color: '#78350f' }]}>
                {medicalInfo.diet.dietDetails}
              </Text>
            </View>
          )}

          {/* Médicaments */}
          {medicalInfo.medications?.takesMedication && (
            <View style={[styles.alert, styles.info]}>
              <Text style={[styles.alertTitle, { color: '#1e40af' }]}>
                Medicaments
              </Text>
              <Text style={[styles.alertText, { color: '#1e3a8a' }]}>
                {medicalInfo.medications.medicationDetails}
              </Text>
              <Text style={[styles.alertText, { color: '#1e3a8a', marginTop: 2 }]}>
                Autonomie: {medicalInfo.medications.isAutonomous ? 'Autonome' : 'Aide necessaire'}
              </Text>
            </View>
          )}

          {/* Infos importantes */}
          {medicalInfo.importantMedicalInfo && (
            <View style={styles.section}>
              <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>
                Donnees medicales importantes:
              </Text>
              <Text>{medicalInfo.importantMedicalInfo}</Text>
            </View>
          )}

          {/* Autres infos */}
          {medicalInfo.otherInfo && (
            <View style={styles.section}>
              <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>
                Autres informations:
              </Text>
              <Text>{medicalInfo.otherInfo}</Text>
            </View>
          )}
        </>
      )}
    </Page>
  )
}

// Document principal qui gère une ou plusieurs fiches
export default function FicheMedicaleDocument({ data }: FicheMedicaleDocumentProps) {
  const fiches = Array.isArray(data) ? data : [data]

  return (
    <Document>
      {fiches.map((fiche, index) => (
        <FichePage key={index} data={fiche} />
      ))}
    </Document>
  )
}