const mongoose = require("mongoose")

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, "Please provide time in HH:MM AM/PM format"],
    },
    language: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
      enum: ["2D", "3D", "4DX", "IMAX", "MX4D"],
    },
    pricing: {
      classic: {
        type: Number,
        required: true,
      },
      premium: {
        type: Number,
        required: true,
      },
      recliner: {
        type: Number,
        required: true,
      },
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    bookedSeats: [
      {
        seatId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["booked", "held", "blocked"],
          default: "booked",
        },
        holdExpiry: Date,
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient queries
showtimeSchema.index({ movie: 1, theater: 1, date: 1, time: 1 })
showtimeSchema.index({ date: 1, status: 1, isActive: 1 })

// Method to check seat availability
showtimeSchema.methods.isSeatAvailable = function (seatId) {
  const bookedSeat = this.bookedSeats.find((seat) => seat.seatId.toString() === seatId.toString())

  if (!bookedSeat) return true

  // Check if held seat has expired
  if (bookedSeat.status === "held" && bookedSeat.holdExpiry < new Date()) {
    return true
  }

  return bookedSeat.status !== "booked" && bookedSeat.status !== "blocked"
}

module.exports = mongoose.model("Showtime", showtimeSchema)
