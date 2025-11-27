'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'

interface DownloadRecapsButtonProps {
  type: 'enfants' | 'camp'
  section?: string
  animateurs?: boolean
  campId?: string
  label?: string
}

export default function DownloadRecapsButton({ 
  type, 
  section, 
  animateurs, 
  campId,
  label = "Télécharger PDF" 
}: DownloadRecapsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDownload = async (recapType: 'all' | 'allergies' | 'regimes' | 'medicaments') => {
    setIsLoading(true)
    setIsOpen(false)
    
    try {
      let url = `/api/pdf-recaps?type=${type}&recapType=${recapType}`
      if (section) url += `&section=${section}`
      if (animateurs) url += '&animateurs=true'
      if (campId) url += `&campId=${campId}`

      const response = await fetch(url)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur de téléchargement')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      
      // Nom du fichier selon le type
      let filename = 'recaps'
      if (type === 'camp' && campId) {
        filename = `recaps-camp-${campId}`
      } else if (section) {
        filename = `recaps-${section}`
      } else if (animateurs) {
        filename = 'recaps-animateurs'
      }
      
      if (recapType !== 'all') {
        filename += `-${recapType}`
      }
      
      a.download = `${filename}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Erreur:', error)
      alert(error.message || 'Erreur lors du téléchargement')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        <Download className="w-4 h-4" />
        {isLoading ? 'Génération...' : label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !isLoading && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => handleDownload('all')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3"
            >
              <Download className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Tout télécharger</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Allergies + Régimes + Médicaments
                </div>
              </div>
            </button>
            <button
              onClick={() => handleDownload('allergies')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 border-t border-gray-100"
            >
              <Download className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Allergies uniquement</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Liste des allergies
                </div>
              </div>
            </button>
            <button
              onClick={() => handleDownload('regimes')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 border-t border-gray-100"
            >
              <Download className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Régimes uniquement</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Liste des régimes alimentaires
                </div>
              </div>
            </button>
            <button
              onClick={() => handleDownload('medicaments')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 border-t border-gray-100"
            >
              <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Médicaments uniquement</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Liste des médicaments
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}