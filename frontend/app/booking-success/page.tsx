"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking)
      }
    } catch (error) {
      console.error("Error fetching booking:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h1>
          <Link href="/" className="text-red-500 hover:text-red-600">
            Go back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your tickets have been booked successfully</p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <span className="text-sm font-normal text-gray-500">#{booking.bookingId}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Movie</p>
                  <p className="font-semibold">{booking.showtime?.movie?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Theater</p>
                  <p className="font-semibold">{booking.showtime?.theater?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">
                    {new Date(booking.showtime?.date).toLocaleDateString()} at {booking.showtime?.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seats</p>
                  <p className="font-semibold">{booking.seats?.map((s: any) => `${s.row}${s.number}`).join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-green-600">₹{booking.finalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-600 capitalize">{booking.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button className="flex-1 bg-red-500 hover:bg-red-600">
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
            <Button variant="outline" className="flex-1">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• Please arrive at the theater 30 minutes before the show time</p>
              <p>• Carry a valid ID proof for verification</p>
              <p>• Outside food and beverages are not allowed</p>
              <p>• Cancellation is allowed up to 20 minutes before the show time</p>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="text-center mt-8 space-x-4">
            <Link href="/bookings" className="text-red-500 hover:text-red-600">
              View All Bookings
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/" className="text-red-500 hover:text-red-600">
              Book More Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
