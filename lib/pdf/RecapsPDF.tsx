import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '2 solid #333',
  },
  itemAllergy: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderLeft: '4 solid #DC2626',
    borderRadius: 4,
  },
  itemDiet: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderLeft: '4 solid #D97706',
    borderRadius: 4,
  },
  itemMedication: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#DBEAFE',
    borderLeft: '4 solid #2563EB',
    borderRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemInfo: {
    fontSize: 9,
    color: '#666',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 10,
    marginBottom: 3,
  },
  itemContact: {
    fontSize: 8,
    color: '#666',
    marginTop: 5,
    paddingTop: 5,
    borderTop: '1 solid #999',
  },
  badge: {
    fontSize: 8,
    padding: '3 6',
    borderRadius: 10,
    backgroundColor: '#10B981',
    color: 'white',
  },
  badgeWarning: {
    backgroundColor: '#F59E0B',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#10B981',
    fontSize: 12,
    padding: 20,
  },
})

interface RecapsPDFProps {
  title: string
  allergies: any[]
  regimes: any[]
  medicaments: any[]
}

const RecapsPDF: React.FC<RecapsPDFProps> = ({ title, allergies, regimes, medicaments }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>

        {/* Section Allergies */}
        {(allergies.length > 0 || (regimes.length === 0 && medicaments.length === 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Allergies ({allergies.length})
            </Text>
            {allergies.length === 0 ? (
              <Text style={styles.emptyMessage}>✓ Aucune allergie déclarée</Text>
            ) : (
              allergies.map((item, index) => (
                <View key={index} style={styles.itemAllergy}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>
                      {item.firstName} {item.lastName}
                    </Text>
                  </View>
                  <Text style={styles.itemInfo}>
                    {item.age} ans • {item.section}
                  </Text>
                  <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Allergènes: </Text>
                    {item.allergyList}
                  </Text>
                  {item.allergyConsequences && (
                    <Text style={styles.itemDetails}>
                      <Text style={{ fontWeight: 'bold' }}>Conséquences: </Text>
                      {item.allergyConsequences}
                    </Text>
                  )}
                  <Text style={styles.itemContact}>
                    Contact: {item.parentName} - {item.parentPhone}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Section Régimes */}
        {(regimes.length > 0 || (allergies.length === 0 && medicaments.length === 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Régimes alimentaires ({regimes.length})
            </Text>
            {regimes.length === 0 ? (
              <Text style={styles.emptyMessage}>✓ Aucun régime spécifique</Text>
            ) : (
              regimes.map((item, index) => (
                <View key={index} style={styles.itemDiet}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>
                      {item.firstName} {item.lastName}
                    </Text>
                  </View>
                  <Text style={styles.itemInfo}>
                    {item.age} ans • {item.section}
                  </Text>
                  <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Régime: </Text>
                    {item.dietDetails}
                  </Text>
                  <Text style={styles.itemContact}>
                    Contact: {item.parentName} - {item.parentPhone}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Section Médicaments */}
        {(medicaments.length > 0 || (allergies.length === 0 && regimes.length === 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Médicaments ({medicaments.length})
            </Text>
            {medicaments.length === 0 ? (
              <Text style={styles.emptyMessage}>✓ Aucun médicament</Text>
            ) : (
              medicaments.map((item, index) => (
                <View key={index} style={styles.itemMedication}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>
                      {item.firstName} {item.lastName}
                    </Text>
                  </View>
                  <Text style={styles.itemInfo}>
                    {item.age} ans • {item.section}
                  </Text>
                  <Text style={styles.itemDetails}>
                    <Text style={{ fontWeight: 'bold' }}>Médicament(s): </Text>
                    {item.medicationDetails}
                  </Text>
                  <Text style={[styles.itemDetails, { marginTop: 3 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Autonomie: </Text>
                    {item.isAutonomous ? '✓ Autonome' : '⚠ Aide nécessaire'}
                  </Text>
                  <Text style={styles.itemContact}>
                    Contact: {item.parentName} - {item.parentPhone}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </Page>
    </Document>
  )
}

export default RecapsPDF