import { Users, Tent, Calendar, Images } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  stats: {
    enfants: number
    camps: number
    evenements: number
    albums: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Enfants inscrits"
        value={stats.enfants}
        icon={Users}
        color="bg-blue-500"
      />
      <StatCard
        title="Camps actifs"
        value={stats.camps}
        icon={Tent}
        color="bg-green-500"
      />
      <StatCard
        title="Événements"
        value={stats.evenements}
        icon={Calendar}
        color="bg-purple-500"
      />
      <StatCard
        title="Albums"
        value={stats.albums}
        icon={Images}
        color="bg-orange-500"
      />
    </div>
  )
}