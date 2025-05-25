const cron = require("node-cron")
const Showtime = require("../models/Showtime")

// Clean up expired seat holds every minute
const startSeatCleanup = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Running seat cleanup job...")

      const showtimes = await Showtime.find({
        "bookedSeats.status": "held",
        "bookedSeats.holdExpiry": { $lt: new Date() },
      })

      for (const showtime of showtimes) {
        const initialLength = showtime.bookedSeats.length

        // Remove expired holds
        showtime.bookedSeats = showtime.bookedSeats.filter((seat) => {
          if (seat.status === "held" && seat.holdExpiry < new Date()) {
            return false
          }
          return true
        })

        if (showtime.bookedSeats.length < initialLength) {
          const releasedSeats = initialLength - showtime.bookedSeats.length
          showtime.availableSeats += releasedSeats
          await showtime.save()

          console.log(`Released ${releasedSeats} expired seat holds for showtime ${showtime._id}`)
        }
      }
    } catch (error) {
      console.error("Seat cleanup job failed:", error)
    }
  })

  console.log("Seat cleanup cron job started")
}

module.exports = { startSeatCleanup }
