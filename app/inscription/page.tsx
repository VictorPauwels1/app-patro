import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import InscriptionForm from '@/components/forms/InscriptionForm'

export const metadata = {
  title: 'Inscription - Patro',
  description: 'Inscrivez votre enfant au Patro'
}

export default function InscriptionPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Inscription au Patro
            </h1>
            <p className="text-lg text-gray-600">
              Remplissez ce formulaire pour inscrire votre enfant pour l'annee {new Date().getFullYear()}-{new Date().getFullYear() + 1}
            </p>
          </div>

          <InscriptionForm />
        </div>
      </main>
      <Footer />
    </>
  )
}