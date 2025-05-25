"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Info, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { SeatCountModal } from "@/components/seat-count-modal"

interface Theater {
  _id: string
  name: string
  location: string
  facilities: string[]
  showtimes: Array<{
    _id: string
    time: string
    availableSeats: number
    totalSeats: number
    price: {
      classic: number
      premium: number
      recliner: number
    }
  }>
}

interface Movie {
  _id: string
  title: string
  genre: string[]
  certification: string
  language: string[]
}

export default function ShowtimesPage({ params }: { params: { movieId: string } }) {
  const searchParams = useSearchParams()
  const language = searchParams.get("language") || "English"
  const format = searchParams.get("format") || "3D"

  const [movie, setMovie] = useState<Movie | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [loading, setLoading] = useState(true)
  const [showSeatModal, setShowSeatModal] = useState(false)
  const [selectedShowtime, setSelectedShowtime] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: date.getDate().toString(),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      fullDate: date.toISOString().split("T")[0],
      active: i === 0,
    }
  })

  useEffect(() => {
    fetchMovieAndShowtimes()
  }, [params.movieId, selectedDate, language, format])

  const fetchMovieAndShowtimes = async () => {
    try {
      // Fetch movie details
      const movieResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${params.movieId}`)
      if (movieResponse.ok) {
        const movieData = await movieResponse.json()
        setMovie(movieData.movie)
      }

      // Fetch showtimes
      const showtimesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/showtimes/${params.movieId}?date=${selectedDate}&language=${language}&format=${format}`,
      )
      if (showtimesResponse.ok) {
        const showtimesData = await showtimesResponse.json()
        setTheaters(showtimesData.theaters)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShowtimeClick = (showtime: any, theater: Theater) => {
    setSelectedShowtime({ ...showtime, theater, movieId: params.movieId, language, format })
    setShowSeatModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-6 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href={`/movie/${params.movieId}`} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {movie?.title} - ({language})
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{movie?.certification}</Badge>
              {movie?.genre.map((g) => (
                <Badge key={g} variant="outline">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Subtitle info */}
        <div className="flex items-center mb-6 text-sm">
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">SUB</div>
          <span className="text-gray-600">indicates subtitle language, if subtitles are available</span>
          <Button variant="link" className="text-red-500 p-0 ml-2">
            Got it
          </Button>

          <div className="ml-auto flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>AVAILABLE</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>FAST FILLING</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-500 rounded-full mr-2"></div>
              <span>SUBTITLES LANGUAGE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Theater listings */}
          <div className="lg:col-span-3">
            {theaters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No showtimes available for the selected date and format.</p>
              </div>
            ) : (
              theaters.map((theater) => (
                <div key={theater._id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="font-semibold">{theater.name}</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Info className="w-4 h-4 mr-1" />
                      INFO
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    {theater.facilities.map((facility, idx) => (
                      <div key={idx} className="flex items-center text-sm text-green-600">
                        <div className="w-4 h-4 bg-green-100 rounded mr-1"></div>
                        {facility}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 mb-2">
                    {theater.showtimes.map((showtime) => (
                      <Button
                        key={showtime._id}
                        variant="outline"
                        className={`border-green-500 text-green-600 hover:bg-green-50 ${
                          showtime.availableSeats < 10 ? "border-yellow-500 text-yellow-600" : ""
                        } ${showtime.availableSeats === 0 ? "border-red-500 text-red-600 cursor-not-allowed" : ""}`}
                        onClick={() => handleShowtimeClick(showtime, theater)}
                        disabled={showtime.availableSeats === 0}
                      >
                        {showtime.time}
                      </Button>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500">Cancellation available</p>
                </div>
              ))
            )}

            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Unable to find what you are looking for?</p>
              <Button variant="outline" className="border-red-500 text-red-500">
                Change Location
              </Button>
            </div>
          </div>

          {/* Date selector sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <select className="border border-gray-300 rounded px-3 py-2 text-sm">
                    <option>
                      {language} - {format}
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  {dates.map((date, index) => (
                    <div
                      key={index}
                      className={`text-center p-3 rounded cursor-pointer ${
                        date.fullDate === selectedDate ? "bg-red-500 text-white" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedDate(date.fullDate)}
                    >
                      <div className="font-bold">{date.day}</div>
                      <div className="text-2xl font-bold">{date.date}</div>
                      <div className="text-sm">{date.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SeatCountModal isOpen={showSeatModal} onClose={() => setShowSeatModal(false)} showtime={selectedShowtime} />
    </div>
  )
}
