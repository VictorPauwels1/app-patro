import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function PatroCards() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Nos sections
          </h2>
          <p className="text-lg text-gray-600">
            Decouvrez nos deux patros : un pour les filles, un pour les garcons !
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Link href="/filles" className="group">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-8 text-green-900 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <h3 className="text-3xl font-bold mb-4">Patro des Filles</h3>
              <p className="text-green-800 mb-6">
                De 4 a 17 ans : Poussins, Benjamines, Etincelles, Alpines, Grandes
              </p>
              <div className="flex items-center gap-2 text-green-900 font-semibold group-hover:gap-3 transition-all">
                Decouvrir
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          <Link href="/garcons" className="group">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <h3 className="text-3xl font-bold mb-4">Patro des Garcons</h3>
              <p className="text-green-100 mb-6">
                De 4 a 17 ans : Poussins, Benjamins, Chevaliers, Conquerants, Brothers
              </p>
              <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                Decouvrir
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}