"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

interface Movie {
  _id: string
  title: string
  genre: string[]
  rating: number
  votes: number
  poster: string
  language: string[]
}

interface MovieSectionProps {
  movies: Movie[]
  loading: boolean
}

export function MovieSection({ movies, loading }: MovieSectionProps) {
  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recommended Movies</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gray-300"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recommended Movies</h2>
          <Link href="/movies" className="text-red-500 hover:text-red-600 font-medium">
            See All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {movies.slice(0, 5).map((movie) => (
            <Link key={movie._id} href={`/movie/${movie._id}`} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={movie.poster || "/placeholder.svg?height=300&width=200"}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm flex items-center">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {movie.rating}/10 {movie.votes} Votes
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{movie.title}</h3>
                  <p className="text-sm text-gray-600">{movie.genre.join(", ")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
