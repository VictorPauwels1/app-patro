import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import InfoSection from '@/components/home/InfoSection'
import PatroCards from '@/components/home/PatroCards'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <InfoSection />
        <PatroCards />
      </main>
      <Footer />
    </>
  )
}