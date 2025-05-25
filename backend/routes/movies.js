const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Movie = require("../models/Movie")
const { protect, admin } = require("../middlewares/auth")

const router = express.Router()

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("genre").optional().isString(),
    query("language").optional().isString(),
    query("status").optional().isIn(["upcoming", "now_showing", "ended"]),
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

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      // Build filter object
      const filter = { isActive: true }

      if (req.query.genre) {
        filter.genre = { $in: [req.query.genre] }
      }

      if (req.query.language) {
        filter.language = { $in: [req.query.language] }
      }

      if (req.query.status) {
        filter.status = req.query.status
      }

      // Search functionality
      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      const movies = await Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

      const total = await Movie.countDocuments(filter)

      res.json({
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie || !movie.isActive) {
      return res.status(404).json({ message: "Movie not found" })
    }

    res.json({ movie })
  } catch (error) {
    console.error(error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Movie not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Create movie
// @route   POST /api/movies
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  [
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("genre").isArray({ min: 1 }).withMessage("At least one genre is required"),
    body("language").isArray({ min: 1 }).withMessage("At least one language is required"),
    body("duration").isInt({ min: 1 }).withMessage("Duration must be a positive integer"),
    body("certification").isIn(["U", "U/A", "A", "S"]).withMessage("Invalid certification"),
    body("releaseDate").isISO8601().withMessage("Invalid release date"),
    body("poster").isURL().withMessage("Poster must be a valid URL"),
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

      const movie = await Movie.create(req.body)
      res.status(201).json({ movie })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" })
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    res.json({ movie: updatedMovie })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" })
    }

    // Soft delete
    movie.isActive = false
    await movie.save()

    res.json({ message: "Movie deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
