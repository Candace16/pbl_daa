"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SeatCountModalProps {
  isOpen: boolean
  onClose: () => void
  showtime: any
}

export function SeatCountModal({ isOpen, onClose, showtime }: SeatCountModalProps) {
  const [selectedSeats, setSelectedSeats] = useState(2)
  const router = useRouter()

  const handleSelectSeats = () => {
    if (!showtime) return

    onClose()
    router.push(
      `/seat-selection/${showtime._id}?seats=${selectedSeats}&movieId=${showtime.movieId}&language=${showtime.language}&format=${showtime.format}`,
    )
  }

  if (!showtime) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">How Many Seats?</DialogTitle>
        </DialogHeader>

        <div className="text-center py-6">
          <div className="mb-6">
            <Image
              src="/placeholder.svg?height=80&width=120"
              alt="Scooter illustration"
              width={120}
              height={80}
              className="mx-auto"
            />
          </div>

          <div className="flex justify-center space-x-2 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedSeats(num)}
                className={`w-10 h-10 rounded-full border-2 font-semibold ${
                  selectedSeats === num
                    ? "bg-red-500 text-white border-red-500"
                    : "border-gray-300 text-gray-700 hover:border-red-500"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="text-center">
              <div className="font-semibold">RECLINER</div>
              <div className="text-lg font-bold">Rs. {showtime.price?.recliner || 650}</div>
              <div className="text-orange-500">Almost Full</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">CLASSIC</div>
              <div className="text-lg font-bold">Rs. {showtime.price?.classic || 280}</div>
              <div className="text-green-500">Available</div>
            </div>
          </div>

          <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-3" onClick={handleSelectSeats}>
            Select Seats
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
