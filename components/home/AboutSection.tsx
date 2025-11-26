import { Heart, Users, Sparkles } from 'lucide-react'

export default function AboutSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Le Patro, c'est quoi ?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Un mouvement de jeunesse dynamique ou les enfants vivent des aventures inoubliables, nouent des amities sinceres et grandissent dans la joie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Des valeurs fortes
            </h3>
            <p className="text-gray-600">
              Respect, partage, entraide et bienveillance au coeur de toutes nos activites.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Une equipe passionnee
            </h3>
            <p className="text-gray-600">
              Des animateurs formes et motives pour accompagner vos enfants dans leurs aventures.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Des activites variees
            </h3>
            <p className="text-gray-600">
              Jeux, grands jeux, camps, sorties... chaque moment est une nouvelle decouverte !
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}