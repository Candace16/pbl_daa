const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: [
      {
        seatId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        row: String,
        number: Number,
        type: String,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    paymentDetails: {
      paymentId: String,
      paymentMethod: String,
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
    },
    contactDetails: {
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "refunded"],
      default: "pending",
    },
    qrCode: String,
    cancellationDetails: {
      cancelledAt: Date,
      reason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
      },
    },
  },
  {
    timestamps: true,
  },
)

// Generate booking ID
bookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.bookingId = `BMS${timestamp.slice(-6)}${random}`
  }
  next()
})

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ bookingId: 1 })
bookingSchema.index({ showtime: 1, status: 1 })

module.exports = mongoose.model("Booking", bookingSchema)
