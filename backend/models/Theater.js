const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema({
  row: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["classic", "premium", "recliner"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
})

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  seatLayout: [seatSchema],
  features: [
    {
      type: String,
      enum: ["Dolby Atmos", "4K Projection", "Recliner Seats", "Premium Sound", "3D Capable"],
    },
  ],
})

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Theater name is required"],
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
        match: [/^[0-9]{6}$/, "Please add a valid pincode"],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Please add a valid phone number"],
      },
      email: {
        type: String,
        required: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
      },
    },
    screens: [screenSchema],
    facilities: [
      {
        type: String,
        enum: [
          "Parking",
          "Food Court",
          "Food & Beverage",
          "M-Ticket",
          "Wheelchair Accessible",
          "Air Conditioning",
          "Online Booking",
        ],
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for location-based queries
theaterSchema.index({ "location.city": 1, isActive: 1 })

module.exports = mongoose.model("Theater", theaterSchema)
