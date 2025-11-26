'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodePaymentProps {
  montant: number
  reference: string
  message?: string
  showAccountInfo?: boolean
  iban?: string
  bic?: string
  beneficiaire?: string
}

export default function QRCodePayment({ 
  montant, 
  reference, 
  message = '', 
  showAccountInfo = false,
  iban = 'BE56 7755 9576 1388',
  bic = 'GKCCBEBB',
  beneficiaire = 'PATRO ST NICOLAS GARCONS ENGHIEN'
}: QRCodePaymentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Enlever les espaces de l'IBAN pour le format EPC
  const IBAN = iban.replace(/\s/g, '')
  const BIC = bic
  const BENEFICIAIRE = beneficiaire

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current) return

      try {
        // Format EPC (European Payments Council) pour les virements SEPA
        const epcData = [
          'BCD',                          // Service Tag
          '002',                          // Version
          '1',                            // Character set (UTF-8)
          'SCT',                          // Identification (SEPA Credit Transfer)
          BIC,                            // BIC du bénéficiaire
          BENEFICIAIRE,                   // Nom du bénéficiaire
          IBAN,                           // IBAN du bénéficiaire
          `EUR${montant.toFixed(2)}`,     // Montant (format: EUR12.34)
          '',                             // Purpose (vide)
          reference,                      // Structured reference
          message,                        // Unstructured remittance
        ].join('\n')

        await QRCode.toCanvas(canvasRef.current, epcData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      } catch (err) {
        console.error('Erreur génération QR code:', err)
        setError('Erreur lors de la génération du QR code')
      }
    }

    generateQRCode()
  }, [montant, reference, message, IBAN, BIC, BENEFICIAIRE])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Paiement de l'inscription
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* QR Code */}
        <div className="flex-shrink-0">
          {error ? (
            <div className="w-[300px] h-[300px] bg-red-50 rounded-lg flex items-center justify-center">
              <p className="text-red-600 text-sm text-center px-4">{error}</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <canvas ref={canvasRef} className="mx-auto" />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="flex-1 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              📱 Paiement rapide par QR code
            </h3>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Ouvrez votre application bancaire</li>
              <li>Scannez ce QR code</li>
              <li>Vérifiez les informations</li>
              <li>Confirmez le paiement</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              💳 Détails du paiement
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Montant :</strong> {montant.toFixed(2)}€</p>
              <p><strong>Communication :</strong> {reference}</p>
              {message && <p><strong>Message :</strong> {message}</p>}
            </div>
          </div>

          {showAccountInfo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                🏦 Coordonnées bancaires
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>IBAN :</strong> {iban}</p>
                <p><strong>BIC :</strong> {BIC}</p>
                <p><strong>Bénéficiaire :</strong> {BENEFICIAIRE}</p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Important :</strong> Merci de bien respecter la communication structurée pour que nous puissions identifier votre paiement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}