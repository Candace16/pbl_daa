const express = require("express")
const Showtime = require("../models/Showtime")
const Theater = require("../models/Theater")
const Movie = require("../models/Movie")
const { protect } = require("../middlewares/auth")
const { publishToKafka } = require("../utils/kafka")
const { getRedisClient } = require("../utils/redis")

const router = express.Router()

// @desc    Get seat layout for a showtime
// @route   GET /api/seats/:showtimeId
// @access  Public
router.get("/:showtimeId", async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId)
      .populate("movie", "title")
      .populate("theater", "name location screens")

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" })
    }

    const theater = showtime.theater
    const screen = theater.screens.id(showtime.screen)

    if (!screen) {
      return res.status(404).json({ message: "Screen not found" })
    }

    // Build seat layout with current status
    const seatLayout = {}

    screen.seatLayout.forEach((seat) => {
      if (!seatLayout[seat.row]) {
        seatLayout[seat.row] = []
      }

      // Check if seat is booked/held
      const bookedSeat = showtime.bookedSeats.find((bs) => bs.seatId.toString() === seat._id.toString())

      let status = "available"
      if (bookedSeat) {
        if (bookedSeat.status === "booked") {
          status = "occupied"
        } else if (bookedSeat.status === "held" && bookedSeat.holdExpiry > new Date()) {
          status = "blocked"
        } else if (bookedSeat.status === "blocked") {
          status = "blocked"
        }
      }

      seatLayout[seat.row].push({
        _id: seat._id,
        row: seat.row,
        number: seat.number,
        type: seat.type,
        price: showtime.pricing[seat.type],
        status,
      })
    })

    res.json({
      seatLayout,
      showtime: {
        _id: showtime._id,
        date: showtime.date,
        time: showtime.time,
        language: showtime.language,
        format: showtime.format,
      },
      movie: showtime.movie,
      theater: {
        _id: theater._id,
        name: theater.name,
        location: theater.location,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Hold a seat temporarily
// @route   POST /api/seats/hold
// @access  Private
router.post("/hold", protect, async (req, res) => {
  try {
    const { showtimeId, seatId } = req.body
    const userId = req.user._id

    const redisClient = getRedisClient()
    const lockKey = `seat_lock:${showtimeId}:${seatId}`

    // Acquire lock with 30 second expiry
    const lockAcquired = await redisClient.set(lockKey, userId.toString(), "PX", 30000, "NX")

    if (!lockAcquired) {
      return res.status(409).json({ message: "Seat is being processed by another user" })
    }

    try {
      const showtime = await Showtime.findById(showtimeId)

      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" })
      }

      // Check if seat is available
      if (!showtime.isSeatAvailable(seatId)) {
        return res.status(409).json({ message: "Seat is not available" })
      }

      // Remove any existing hold for this seat
      showtime.bookedSeats = showtime.bookedSeats.filter((seat) => seat.seatId.toString() !== seatId.toString())

      // Add new hold
      const holdExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      showtime.bookedSeats.push({
        seatId,
        userId,
        status: "held",
        holdExpiry,
      })

      await showtime.save()

      // Publish to Kafka for real-time updates
      await publishToKafka("seat-updates", {
        showtimeId,
        seatId,
        status: "blocked",
        userId: userId.toString(),
        timestamp: new Date(),
      })

      // Broadcast to connected clients
      const io = req.app.get("io")
      io.to(`showtime-${showtimeId}`).emit("seat-status-update", {
        seatId,
        status: "blocked",
        row: req.body.row,
      })

      res.json({ message: "Seat held successfully", holdExpiry })
    } finally {
      // Release lock
      await redisClient.del(lockKey)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Release a held seat
// @route   POST /api/seats/release
// @access  Private
router.post("/release", protect, async (req, res) => {
  try {
    const { showtimeId, seatId } = req.body
    const userId = req.user._id

    const showtime = await Showtime.findById(showtimeId)

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" })
    }

    // Remove hold if it belongs to the user
    const initialLength = showtime.bookedSeats.length
    showtime.bookedSeats = showtime.bookedSeats.filter(
      (seat) =>
        !(
          seat.seatId.toString() === seatId.toString() &&
          seat.userId.toString() === userId.toString() &&
          seat.status === "held"
        ),
    )

    if (showtime.bookedSeats.length < initialLength) {
      await showtime.save()

      // Publish to Kafka
      await publishToKafka("seat-updates", {
        showtimeId,
        seatId,
        status: "available",
        userId: userId.toString(),
        timestamp: new Date(),
      })

      // Broadcast to connected clients
      const io = req.app.get("io")
      io.to(`showtime-${showtimeId}`).emit("seat-status-update", {
        seatId,
        status: "available",
        row: req.body.row,
      })

      res.json({ message: "Seat released successfully" })
    } else {
      res.status(404).json({ message: "Held seat not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
