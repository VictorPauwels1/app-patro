import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Check, Calendar, Euro, Phone, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import QRCodePayment from '@/components/QRCodePayment'

export default async function CampConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const camp = await prisma.camp.findUnique({
    where: { id: id },
  })

  if (!camp) {
    redirect('/camps')
  }

  // Récupérer les settings pour l'email de contact
  const settings = await prisma.settings.findUnique({
    where: { section: camp.patroGroup },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Inscription confirmée !
                </h1>
                <p className="text-gray-600">
                  Votre enfant est bien inscrit au camp
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{camp.name}</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>
                      Du {format(new Date(camp.startDate), 'dd MMMM', { locale: fr })} au{' '}
                      {format(new Date(camp.endDate), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span>{camp.price.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Paiement
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Pour finaliser l'inscription, veuillez effectuer le paiement de <strong>{camp.price.toFixed(2)} €</strong> en scannant le QR code ci-dessous :
                </p>

                <QRCodePayment
                  montant={camp.price}
                  reference={`Camp ${camp.name}`}
                  message={`Inscription camp ${camp.name}`}
                  showAccountInfo={true}
                  iban={camp.iban}
                  bic=""
                  beneficiaire={camp.beneficiaire}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Prochaines étapes
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600">1</span>
                    </div>
                    <span>Effectuez le paiement via le QR code ci-dessus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-600">2</span>
                    </div>
                    <span>Les détails pratiques vous seront communiqués quelques jours avant le camp</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 flex gap-4">
                <Link
                  href="/camps"
                  className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Voir les autres camps
                </Link>
                <Link
                  href="/"
                  className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Une question ?</p>
                  <p>
                    N'hésitez pas à nous contacter pour toute information complémentaire.
                  </p>
                  {settings && (
                    <p className="mt-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      {settings.emailContact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}