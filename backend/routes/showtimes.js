const express = require("express")
const { query } = require("express-validator")
const Showtime = require("../models/Showtime")
const Theater = require("../models/Theater")
const Movie = require("../models/Movie")

const router = express.Router()

// @desc    Get showtimes for a movie
// @route   GET /api/showtimes/:movieId
// @access  Public
router.get(
  "/:movieId",
  [
    query("date").optional().isISO8601().withMessage("Invalid date format"),
    query("language").optional().isString(),
    query("format").optional().isString(),
  ],
  async (req, res) => {
    try {
      const { movieId } = req.params
      const { date, language, format } = req.query

      // Build filter
      const filter = {
        movie: movieId,
        isActive: true,
        status: "scheduled",
      }

      if (date) {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)

        filter.date = {
          $gte: startDate,
          $lt: endDate,
        }
      }

      if (language) {
        filter.language = language
      }

      if (format) {
        filter.format = format
      }

      const showtimes = await Showtime.find(filter)
        .populate("theater", "name location facilities")
        .populate("movie", "title")
        .sort({ "theater.name": 1, time: 1 })

      // Group by theater
      const theaterMap = new Map()

      showtimes.forEach((showtime) => {
        const theaterId = showtime.theater._id.toString()

        if (!theaterMap.has(theaterId)) {
          theaterMap.set(theaterId, {
            _id: showtime.theater._id,
            name: showtime.theater.name,
            location: showtime.theater.location,
            facilities: showtime.theater.facilities,
            showtimes: [],
          })
        }

        theaterMap.get(theaterId).showtimes.push({
          _id: showtime._id,
          time: showtime.time,
          availableSeats: showtime.availableSeats,
          totalSeats: showtime.totalSeats,
          price: showtime.pricing,
        })
      })

      const theaters = Array.from(theaterMap.values())

      res.json({ theaters })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
