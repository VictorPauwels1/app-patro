'use client'

import Button from '@/components/ui/Button'
import { Download } from 'lucide-react'
import { useState } from 'react'

interface DownloadMultipleButtonProps {
  type: 'all' | 'section' | 'animateurs'
  section?: string
  label: string
}

export default function DownloadMultipleButton({ type, section, label }: DownloadMultipleButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      let url = `/api/pdf?type=${type}`
      if (section) {
        url += `&section=${section}`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur de téléchargement')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `fiches-${type === 'section' ? section : 'toutes'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Erreur:', error)
      alert(error.message || 'Erreur lors du téléchargement du PDF')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      isLoading={isLoading}
      className="text-sm"
    >
      <Download className="w-4 h-4 mr-2" />
      {isLoading ? 'Génération...' : label}
    </Button>
  )
}