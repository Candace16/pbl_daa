"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MovieSection } from "@/components/movie-section"
import { LiveEventsSection } from "@/components/live-events-section"
import { PremieresSection } from "@/components/premieres-section"
import { MusicStudioSection } from "@/components/music-studio-section"
import { OutdoorEventsSection } from "@/components/outdoor-events-section"
import { LaughterTherapySection } from "@/components/laughter-therapy-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`)
      const data = await response.json()
      setMovies(data.movies || [])
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <MovieSection movies={movies} loading={loading} />
        <div className="bg-slate-800 py-4">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Endless Entertainment Anytime, Anywhere!</h2>
            </div>
          </div>
        </div>
        <LiveEventsSection />
        <PremieresSection />
        <MusicStudioSection />
        <OutdoorEventsSection />
        <LaughterTherapySection />
      </main>
      <Footer />
    </div>
  )
}
