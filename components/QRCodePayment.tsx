'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Euro } from 'lucide-react'

interface QRCodePaymentProps {
  montant: number
  reference: string
  message?: string
  showAccountInfo?: boolean
}

export default function QRCodePayment({ 
  montant, 
  reference, 
  message = '',
  showAccountInfo = true 
}: QRCodePaymentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !montant || !reference) return

    // Informations du compte Patro
    const iban = 'BE56775595761388' // Sans espaces
    const bic = 'GKCCBEBB' // BIC Belfius
    const beneficiaire = 'PATRO ST NICOLAS GARCONS ENGHIEN'
    
    // Formater le montant
    const montantFormate = montant.toFixed(2)

    // Format EPC QR Code (standard européen)
    const epcData = [
      'BCD',                          // Service Tag
      '002',                          // Version
      '1',                            // Character set (1 = UTF-8)
      'SCT',                          // Identification
      bic,                            // BIC
      beneficiaire,                   // Nom du bénéficiaire
      iban,                           // IBAN
      'EUR' + montantFormate,         // Montant avec devise
      '',                             // Purpose (vide)
      reference,                      // Référence structurée ou libre
      message || ''                   // Message
    ].join('\n')

    // Générer le QR code sur le canvas
    QRCode.toCanvas(canvasRef.current, epcData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  }, [montant, reference, message])

  if (!montant || !reference) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Euro className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Paiement
        </h2>
      </div>
      
      <div className="bg-white rounded-lg p-4 space-y-4">
        <p className="text-gray-700">
          Pour confirmer votre inscription, merci de bien vouloir payer <strong className="text-green-600 text-lg">€{montant.toFixed(2)}</strong>
        </p>

        {showAccountInfo && (
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Numéro de compte IBAN :</p>
            <p className="text-xl font-mono font-bold text-gray-900">
              BE56 7755 9576 1388
            </p>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Communication :</strong> {reference}
          </p>
          {message && (
            <p className="text-sm text-gray-600 mt-1">
              {message}
            </p>
          )}
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm font-semibold text-gray-700">
            Scannez ce QR code avec l'app de votre banque :
          </p>
          <canvas 
            ref={canvasRef}
            className="inline-block p-4 bg-white rounded-lg shadow-sm"
          />
          <p className="text-xs text-gray-500 text-center max-w-md">
            Le QR code contient toutes les informations de paiement. 
            Scannez-le avec votre app bancaire pour effectuer le virement automatiquement.
          </p>
        </div>
        
        <p className="text-xs text-gray-600 text-center">
          L'inscription ne sera validée qu'après réception du paiement
        </p>
      </div>
    </div>
  )
}