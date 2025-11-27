import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CampInscriptionForm from '@/components/forms/CampInscriptionForm'
import { Tent, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function CampInscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const camp = await prisma.camp.findUnique({
    where: { id: id },
    include: {
      _count: { select: { registrations: true } },
    },
  })

  if (!camp || !camp.isPublic) {
    redirect('/camps')
  }

  const placesRestantes = camp.maxParticipants ? camp.maxParticipants - camp._count.registrations : null
  const isComplet = placesRestantes !== null && placesRestantes <= 0

  if (isComplet) {
    redirect(`/camps/${camp.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href={`/camps/${camp.id}`} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Retour au camp
          </Link>
          <div className="flex items-center gap-4">
            <Tent className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Inscription au camp</h1>
              <p className="text-green-100">{camp.name}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <CampInscriptionForm camp={camp} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}