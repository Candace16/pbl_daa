const express = require("express")
const { body, validationResult } = require("express-validator")
const Booking = require("../models/Booking")
const Showtime = require("../models/Showtime")
const User = require("../models/User")
const { protect } = require("../middlewares/auth")
const { publishToKafka } = require("../utils/kafka")

const router = express.Router()

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
router.post(
  "/",
  protect,
  [
    body("showtimeId").isMongoId().withMessage("Invalid showtime ID"),
    body("seats").isArray({ min: 1 }).withMessage("At least one seat is required"),
    body("contactDetails.email").isEmail().withMessage("Valid email is required"),
    body("contactDetails.phone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Valid phone number is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { showtimeId, seats, contactDetails } = req.body
      const userId = req.user._id

      const showtime = await Showtime.findById(showtimeId)
        .populate("movie", "title")
        .populate("theater", "name location screens")

      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" })
      }

      // Verify all seats are held by this user
      const userHeldSeats = showtime.bookedSeats.filter(
        (seat) =>
          seat.userId.toString() === userId.toString() && seat.status === "held" && seat.holdExpiry > new Date(),
      )

      if (userHeldSeats.length !== seats.length) {
        return res.status(400).json({ message: "Some seats are not properly held" })
      }

      // Calculate total amount
      const screen = showtime.theater.screens.id(showtime.screen)
      let totalAmount = 0
      const seatDetails = []

      seats.forEach((seatId) => {
        const seat = screen.seatLayout.id(seatId)
        if (seat) {
          const price = showtime.pricing[seat.type]
          totalAmount += price
          seatDetails.push({
            seatId: seat._id,
            row: seat.row,
            number: seat.number,
            type: seat.type,
            price: price,
          })
        }
      })

      const convenienceFee = Math.round(totalAmount * 0.15) // 15% convenience fee
      const taxes = Math.round((totalAmount + convenienceFee) * 0.18) // 18% GST
      const finalAmount = totalAmount + convenienceFee + taxes

      // Create booking
      const booking = await Booking.create({
        user: userId,
        showtime: showtimeId,
        seats: seatDetails,
        totalAmount,
        convenienceFee,
        taxes,
        finalAmount,
        contactDetails,
        status: "pending",
      })

      // Update showtime - convert held seats to booked
      showtime.bookedSeats = showtime.bookedSeats.map((seat) => {
        if (
          seat.userId.toString() === userId.toString() &&
          seat.status === "held" &&
          seats.includes(seat.seatId.toString())
        ) {
          return {
            ...seat,
            status: "booked",
          }
        }
        return seat
      })

      showtime.availableSeats -= seats.length
      await showtime.save()

      // Add booking to user's history
      await User.findByIdAndUpdate(userId, {
        $push: { bookingHistory: booking._id },
      })

      // Publish to Kafka
      await publishToKafka("booking-updates", {
        bookingId: booking._id,
        userId: userId.toString(),
        showtimeId,
        seats,
        status: "created",
        timestamp: new Date(),
      })

      res.status(201).json({
        booking: {
          _id: booking._id,
          bookingId: booking.bookingId,
          finalAmount: booking.finalAmount,
          status: booking.status,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("showtime", "date time language format")
      .populate({
        path: "showtime",
        populate: [
          { path: "movie", select: "title poster" },
          { path: "theater", select: "name location" },
        ],
      })
      .sort({ createdAt: -1 })

    res.json({ bookings })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("showtime")
      .populate({
        path: "showtime",
        populate: [
          { path: "movie", select: "title poster certification" },
          { path: "theater", select: "name location" },
        ],
      })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.json({ booking })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const { reason } = req.body

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("showtime")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed bookings can be cancelled" })
    }

    // Check if cancellation is allowed (20 minutes before show)
    const showDateTime = new Date(`${booking.showtime.date.toDateString()} ${booking.showtime.time}`)
    const cancellationDeadline = new Date(showDateTime.getTime() - 20 * 60 * 1000)

    if (new Date() > cancellationDeadline) {
      return res.status(400).json({ message: "Cancellation not allowed. Too close to show time." })
    }

    // Update booking status
    booking.status = "cancelled"
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      reason: reason || "User cancellation",
      refundAmount: booking.finalAmount,
      refundStatus: "pending",
    }

    await booking.save()

    // Release seats in showtime
    const showtime = await Showtime.findById(booking.showtime._id)
    showtime.bookedSeats = showtime.bookedSeats.filter((seat) =>
      booking.seats.some((bookingSeat) => bookingSeat.seatId.toString() !== seat.seatId.toString()),
    )
    showtime.availableSeats += booking.seats.length
    await showtime.save()

    // Publish to Kafka
    await publishToKafka("booking-updates", {
      bookingId: booking._id,
      userId: req.user._id.toString(),
      showtimeId: booking.showtime._id,
      status: "cancelled",
      timestamp: new Date(),
    })

    res.json({ message: "Booking cancelled successfully", booking })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
