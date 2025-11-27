import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CampEditForm from '@/components/forms/CampEditForm'
import { ArrowLeft, Settings } from 'lucide-react'

export default async function CampParametresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const camp = await prisma.camp.findUnique({
    where: { id: id },
    include: {
      animators: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!camp) {
    redirect('/dashboard/camps')
  }

  // Récupérer les animateurs créés par les présidents/admin
  const animateurs = await prisma.animateur.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      section: true,
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' },
    ],
  })

  return (
    <DashboardLayout user={session.user}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/dashboard/camps/${camp.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux détails
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-100 rounded-lg">
              <Settings className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres du camp</h1>
              <p className="text-gray-600">{camp.name}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <CampEditForm 
              camp={{
                ...camp,
                startDate: camp.startDate.toISOString().split('T')[0],
                endDate: camp.endDate.toISOString().split('T')[0],
                animatorIds: camp.animators.map(a => a.id),
              }}
              userPatroGroup={session.user.patroGroup}
              animateurs={animateurs}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}