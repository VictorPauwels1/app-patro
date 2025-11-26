import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Bienvenue au Patro
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
            Un mouvement de jeunesse ou chaque enfant grandit, s'amuse et developpe ses talents dans un esprit de partage et de respect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription">
              <Button size="lg" className="bg-yellow-400 text-green-800 hover:bg-yellow-500">
                Inscrire mon enfant
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/camps">
              <Button size="lg" variant="secondary" className="bg-white text-green-700 hover:bg-gray-100 border-0">
                Decouvrir nos camps
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12 sm:h-16 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="currentColor">
          <path d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"></path>
        </svg>
      </div>
    </section>
  )
}