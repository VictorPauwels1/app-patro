import { Clock, MapPin, Mail, Phone } from 'lucide-react'

export default function InfoSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Infos pratiques
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Horaires</h3>
            <p className="text-sm text-gray-600">
              Dimanches<br />
              14h00 - 17h00
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <MapPin className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Lieu</h3>
            <p className="text-sm text-gray-600">
              Salle du Patro<br />
              Rue Exemple 123<br />
              1000 Bruxelles
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Mail className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-sm text-gray-600">
              contact@patro.be
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Phone className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Telephone</h3>
            <p className="text-sm text-gray-600">
              +32 123 45 67 89
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}