const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Movie description is required"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    genre: [
      {
        type: String,
        required: true,
        enum: [
          "Action",
          "Adventure",
          "Comedy",
          "Drama",
          "Fantasy",
          "Horror",
          "Mystery",
          "Romance",
          "Thriller",
          "Sci-Fi",
          "Family",
          "Animation",
        ],
      },
    ],
    language: [
      {
        type: String,
        required: true,
      },
    ],
    duration: {
      type: Number,
      required: [true, "Movie duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    votes: {
      type: Number,
      default: 0,
    },
    certification: {
      type: String,
      required: true,
      enum: ["U", "U/A", "A", "S"],
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    poster: {
      type: String,
      required: [true, "Movie poster is required"],
    },
    backdrop: {
      type: String,
    },
    trailer: {
      type: String,
    },
    cast: [
      {
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
        image: String,
      },
    ],
    crew: [
      {
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
          enum: ["Director", "Producer", "Writer", "Music Director", "Cinematographer", "Editor"],
        },
        image: String,
      },
    ],
    formats: [
      {
        type: String,
        enum: ["2D", "3D", "4DX", "IMAX", "MX4D"],
        default: ["2D"],
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "now_showing", "ended"],
      default: "upcoming",
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

// Simple indexes without text search to avoid language conflicts
movieSchema.index({ genre: 1, status: 1 })
movieSchema.index({ language: 1, status: 1 })
movieSchema.index({ title: 1 })

module.exports = mongoose.model("Movie", movieSchema)
