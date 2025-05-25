const express = require("express")
const { body, validationResult } = require("express-validator")
const Theater = require("../models/Theater")
const { protect, theaterOwner } = require("../middlewares/auth")

const router = express.Router()

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { city, page = 1, limit = 10 } = req.query

    const filter = { isActive: true }
    if (city) {
      filter["location.city"] = new RegExp(city, "i")
    }

    const skip = (page - 1) * limit

    const theaters = await Theater.find(filter)
      .populate("owner", "name email")
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ name: 1 })

    const total = await Theater.countDocuments(filter)

    res.json({
      theaters,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Get single theater
// @route   GET /api/theaters/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id).populate("owner", "name email")

    if (!theater || !theater.isActive) {
      return res.status(404).json({ message: "Theater not found" })
    }

    res.json({ theater })
  } catch (error) {
    console.error(error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Theater not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// @desc    Create theater
// @route   POST /api/theaters
// @access  Private/Theater Owner
router.post(
  "/",
  protect,
  theaterOwner,
  [
    body("name").trim().isLength({ min: 1 }).withMessage("Theater name is required"),
    body("location.address").trim().isLength({ min: 1 }).withMessage("Address is required"),
    body("location.city").trim().isLength({ min: 1 }).withMessage("City is required"),
    body("location.state").trim().isLength({ min: 1 }).withMessage("State is required"),
    body("location.pincode")
      .matches(/^[0-9]{6}$/)
      .withMessage("Valid pincode is required"),
    body("contact.phone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Valid phone number is required"),
    body("contact.email").isEmail().withMessage("Valid email is required"),
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

      const theaterData = {
        ...req.body,
        owner: req.user._id,
      }

      const theater = await Theater.create(theaterData)
      res.status(201).json({ theater })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Update theater
// @route   PUT /api/theaters/:id
// @access  Private/Theater Owner
router.put("/:id", protect, theaterOwner, async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id)

    if (!theater) {
      return res.status(404).json({ message: "Theater not found" })
    }

    // Check ownership
    if (theater.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this theater" })
    }

    const updatedTheater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.json({ theater: updatedTheater })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
