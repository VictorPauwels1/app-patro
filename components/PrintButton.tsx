'use client'

import Button from '@/components/ui/Button'
import { Download } from 'lucide-react'
import { useState } from 'react'

interface PrintButtonProps {
  childId: string
  fileName?: string
}

export default function PrintButton({ childId, fileName }: PrintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/pdf?type=single&childId=${childId}`)
      
      if (!response.ok) {
        throw new Error('Erreur de téléchargement')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'fiche-medicale.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du téléchargement du PDF')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      isLoading={isLoading}
    >
      <Download className="w-4 h-4 mr-2" />
      {isLoading ? 'Génération...' : 'Télécharger PDF'}
    </Button>
  )
}