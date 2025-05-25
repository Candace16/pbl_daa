"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"

interface Booking {
  _id: string
  bookingId: string
  showtime: {
    date: string
    time: string
    movie: {
      title: string
      poster: string
    }
    theater: {
      name: string
      location: {
        address: string
        city: string
      }
    }
  }
  seats: Array<{
    row: string
    number: number
  }>
  finalAmount: number
  status: string
  createdAt: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/auth/login"
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-300 rounded-lg"></div>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your movie bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Users className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h2>
            <p className="text-gray-600 mb-6">You haven't booked any movies yet</p>
            <Link href="/">
              <Button className="bg-red-500 hover:bg-red-600">Book Your First Movie</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Movie Poster */}
                    <div className="md:w-32 h-48 md:h-auto relative">
                      <Image
                        src={booking.showtime.movie.poster || "/placeholder.svg?height=200&width=150"}
                        alt={booking.showtime.movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.showtime.movie.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">Booking ID: {booking.bookingId}</p>
                          <Badge className={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Badge>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                          <p className="text-2xl font-bold text-gray-900">₹{booking.finalAmount}</p>
                          <p className="text-sm text-gray-600">{booking.seats.length} tickets</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(booking.showtime.date).toLocaleDateString()} at {booking.showtime.time}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{booking.showtime.theater.name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Seats: {booking.seats.map((s) => `${s.row}${s.number}`).join(", ")}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Ticket
                        </Button>
                        {booking.status === "confirmed" && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                            Cancel Booking
                          </Button>
                        )}
                        <Link href={`/booking-details/${booking._id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
