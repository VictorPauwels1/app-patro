'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'

interface DownloadMenuButtonProps {
  type: 'all' | 'section' | 'animateurs' | 'camp'
  section?: string
  campId?: string
  label: string
}

export default function DownloadMenuButton({ type, section, campId, label }: DownloadMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDownload = async (mode: 'combined' | 'individual') => {
    setIsLoading(true)
    setIsOpen(false)
    
    try {
      let url = `/api/pdf?type=${type}&mode=${mode}`
      if (section) {
        url += `&section=${section}`
      }
      if (campId) {
        url += `&campId=${campId}`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur de téléchargement')
      }

      if (mode === 'combined') {
        // Un seul PDF
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `fiches-${type === 'camp' ? `camp-${campId}` : type === 'section' ? section : type}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      } else {
        // Plusieurs PDF en ZIP
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `fiches-${type === 'camp' ? `camp-${campId}` : type === 'section' ? section : type}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      }
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
            : 'bg-blue-600 hover:bg-blue-700 text-white'
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
              onClick={() => handleDownload('combined')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3"
            >
              <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Un seul PDF</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Toutes les fiches dans un document (idéal pour imprimer)
                </div>
              </div>
            </button>
            <button
              onClick={() => handleDownload('individual')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 border-t border-gray-100"
            >
              <Download className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Fiches séparées (ZIP)</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Un PDF par enfant dans un fichier ZIP
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}