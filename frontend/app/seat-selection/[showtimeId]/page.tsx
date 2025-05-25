"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { useWebSocket } from "@/hooks/use-websocket"

interface Seat {
  _id: string
  row: string
  number: number
  type: "classic" | "premium" | "recliner"
  status: "available" | "occupied" | "selected" | "blocked"
  price: number
}

interface SeatLayout {
  [key: string]: Seat[]
}

export default function SeatSelectionPage({ params }: { params: { showtimeId: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestedSeats = Number.parseInt(searchParams.get("seats") || "2")
  const movieId = searchParams.get("movieId")
  const language = searchParams.get("language")
  const format = searchParams.get("format")

  const [seatLayout, setSeatLayout] = useState<SeatLayout>({})
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showtime, setShowtime] = useState<any>(null)
  const [movie, setMovie] = useState<any>(null)
  const [theater, setTheater] = useState<any>(null)

  // WebSocket for real-time seat updates
  const { socket, isConnected } = useWebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`)

  useEffect(() => {
    fetchSeatLayout()

    if (socket) {
      socket.emit("join-showtime", params.showtimeId)

      socket.on("seat-status-update", (data) => {
        setSeatLayout((prev) => {
          const newLayout = { ...prev }
          if (newLayout[data.row]) {
            const seatIndex = newLayout[data.row].findIndex((seat) => seat._id === data.seatId)
            if (seatIndex !== -1) {
              newLayout[data.row][seatIndex].status = data.status
            }
          }
          return newLayout
        })
      })

      return () => {
        socket.off("seat-status-update")
        socket.emit("leave-showtime", params.showtimeId)
      }
    }
  }, [params.showtimeId, socket])

  const fetchSeatLayout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seats/${params.showtimeId}`)
      if (response.ok) {
        const data = await response.json()
        setSeatLayout(data.seatLayout)
        setShowtime(data.showtime)
        setMovie(data.movie)
        setTheater(data.theater)
      }
    } catch (error) {
      console.error("Error fetching seat layout:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === "occupied" || seat.status === "blocked") return

    const seatId = seat._id
    const isSelected = selectedSeats.includes(seatId)

    if (isSelected) {
      // Deselect seat
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId))

      // Release seat hold via API
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seats/release`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            showtimeId: params.showtimeId,
            seatId: seatId,
          }),
        })
      } catch (error) {
        console.error("Error releasing seat:", error)
      }
    } else {
      // Select seat (if under limit)
      if (selectedSeats.length < requestedSeats) {
        setSelectedSeats((prev) => [...prev, seatId])

        // Hold seat via API
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seats/hold`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              showtimeId: params.showtimeId,
              seatId: seatId,
            }),
          })
        } catch (error) {
          console.error("Error holding seat:", error)
        }
      }
    }
  }

  const handleContinue = () => {
    if (selectedSeats.length === requestedSeats) {
      router.push(`/payment?showtimeId=${params.showtimeId}&seats=${selectedSeats.join(",")}&movieId=${movieId}`)
    }
  }

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat._id)

    let seatClass = "w-8 h-8 text-xs font-semibold rounded border-2 cursor-pointer "

    if (seat.status === "occupied") {
      seatClass += "bg-gray-300 border-gray-400 cursor-not-allowed"
    } else if (seat.status === "blocked") {
      seatClass += "bg-red-300 border-red-400 cursor-not-allowed"
    } else if (isSelected) {
      seatClass += "bg-green-500 border-green-600 text-white"
    } else {
      seatClass += "bg-white border-gray-300 hover:border-green-500"
    }

    return (
      <button
        key={seat._id}
        className={seatClass}
        onClick={() => handleSeatClick(seat)}
        disabled={seat.status === "occupied" || seat.status === "blocked"}
        title={`${seat.row}${seat.number} - Rs. ${seat.price}`}
      >
        {seat.number}
      </button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const totalPrice = selectedSeats.reduce((total, seatId) => {
    for (const row of Object.values(seatLayout)) {
      const seat = row.find((s) => s._id === seatId)
      if (seat) total += seat.price
    }
    return total
  }, 0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href={`/showtimes/${movieId}`} className="mr-4">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">
                {movie?.title} ({format})
              </h1>
              <p className="text-sm text-gray-300">
                {theater?.name} | {new Date(showtime?.date).toLocaleDateString()} | {showtime?.time}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-red-500 text-white px-4 py-2 rounded">
              {selectedSeats.length}/{requestedSeats} Tickets
            </div>
            <div className="text-white">Rs. {totalPrice}</div>
            <Button variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Connection status */}
        <div className="mb-4 text-sm">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          ></span>
          {isConnected ? "Connected - Real-time updates active" : "Disconnected - Reconnecting..."}
        </div>

        {/* Screen */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gray-700 px-8 py-2 rounded-t-full">
            <span className="text-sm text-gray-300">SCREEN</span>
          </div>
        </div>

        {/* Seat map */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2">
            {Object.entries(seatLayout).map(([row, seats]) => (
              <div key={row} className="flex items-center justify-center space-x-1">
                <div className="w-8 text-center text-sm font-semibold text-gray-400">{row}</div>
                <div className="flex space-x-1">{seats.map((seat) => renderSeat(seat))}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-8 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-300 rounded mr-2"></div>
            <span>Blocked</span>
          </div>
        </div>

        {/* Continue button */}
        <div className="text-center mt-8">
          <Button
            className="bg-red-500 hover:bg-red-600 text-white px-12 py-3"
            onClick={handleContinue}
            disabled={selectedSeats.length !== requestedSeats}
          >
            Continue (Rs. {totalPrice})
          </Button>
        </div>
      </div>
    </div>
  )
}
