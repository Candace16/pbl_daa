"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Share, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { LanguageFormatModal } from "@/components/language-format-modal"

interface Movie {
  _id: string
  title: string
  description: string
  genre: string[]
  language: string[]
  duration: number
  rating: number
  votes: number
  certification: string
  releaseDate: string
  poster: string
  backdrop: string
  cast: Array<{
    name: string
    role: string
    image: string
  }>
  crew: Array<{
    name: string
    role: string
    image: string
  }>
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  useEffect(() => {
    fetchMovie()
  }, [params.id])

  const fetchMovie = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMovie(data.movie)
      }
    } catch (error) {
      console.error("Error fetching movie:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Movie not found</h1>
          <Link href="/" className="text-red-500 hover:text-red-600 mt-4 inline-block">
            Go back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Movie Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-slate-900 to-slate-700">
        <div className="absolute inset-0">
          <Image
            src={movie.backdrop || "/placeholder.svg?height=400&width=800"}
            alt={movie.title}
            fill
            className="object-cover opacity-30"
          />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="flex items-start space-x-6 text-white">
            <div className="relative">
              <Image
                src={movie.poster || "/placeholder.svg?height=300&width=200"}
                alt={movie.title}
                width={200}
                height={300}
                className="rounded-lg shadow-lg"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                In cinemas
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <Link href="/" className="text-white hover:text-gray-300">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-4xl font-bold">{movie.title}</h1>
                <Button variant="ghost" size="sm" className="text-white">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-xl font-bold">{movie.rating}/10</span>
                  <span className="text-sm ml-2">({movie.votes} Votes)</span>
                </div>
                <Button variant="outline" size="sm" className="text-white border-white">
                  Rate now
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.language.map((lang) => (
                  <Badge key={lang} variant="secondary">
                    {lang}
                  </Badge>
                ))}
              </div>

              <div className="text-lg mb-6">
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m • {movie.genre.join(", ")} •{" "}
                {movie.certification} • {new Date(movie.releaseDate).toLocaleDateString()}
              </div>

              <Button
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
                onClick={() => setShowLanguageModal(true)}
              >
                Book tickets
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* About the movie */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About the movie</h2>
              <p className="text-gray-700">{movie.description}</p>
            </section>

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {movie.cast.map((actor, index) => (
                    <div key={index} className="text-center">
                      <Image
                        src={actor.image || "/placeholder.svg?height=80&width=80"}
                        alt={actor.name}
                        width={80}
                        height={80}
                        className="rounded-full mx-auto mb-2"
                      />
                      <h3 className="font-semibold text-sm">{actor.name}</h3>
                      <p className="text-xs text-gray-600">{actor.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Crew */}
            {movie.crew && movie.crew.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Crew</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {movie.crew.map((member, index) => (
                    <div key={index} className="text-center">
                      <Image
                        src={member.image || "/placeholder.svg?height=80&width=80"}
                        alt={member.name}
                        width={80}
                        height={80}
                        className="rounded-full mx-auto mb-2"
                      />
                      <h3 className="font-semibold text-sm">{member.name}</h3>
                      <p className="text-xs text-gray-600">{member.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">{movie.title}</h3>
                <Button
                  className="w-full bg-red-500 hover:bg-red-600 text-white mb-4"
                  onClick={() => setShowLanguageModal(true)}
                >
                  Book tickets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LanguageFormatModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        movieId={movie._id}
        movieTitle={movie.title}
        languages={movie.language}
      />
    </div>
  )
}
