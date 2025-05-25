const express = require("express")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const { body, validationResult } = require("express-validator")
const Booking = require("../models/Booking")
const { protect } = require("../middlewares/auth")
const { publishToKafka } = require("../utils/kafka")

const router = express.Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
router.post(
  "/create-order",
  protect,
  [body("bookingId").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { bookingId } = req.body

      const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id,
      })

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" })
      }

      if (booking.status !== "pending") {
        return res.status(400).json({ message: "Booking is not in pending state" })
      }

      // Create Razorpay order
      const options = {
        amount: booking.finalAmount * 100, // Amount in paise
        currency: "INR",
        receipt: booking.bookingId,
        notes: {
          bookingId: booking._id.toString(),
          userId: req.user._id.toString(),
        },
      }

      const order = await razorpay.orders.create(options)

      // Update booking with payment details
      booking.paymentDetails.paymentId = order.id
      await booking.save()

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking._id,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
router.post(
  "/verify",
  protect,
  [
    body("razorpay_order_id").notEmpty().withMessage("Order ID is required"),
    body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required"),
    body("razorpay_signature").notEmpty().withMessage("Signature is required"),
    body("bookingId").isMongoId().withMessage("Invalid booking ID"),
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

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex")

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" })
      }

      // Update booking
      const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id,
      })

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" })
      }

      booking.paymentDetails.paymentId = razorpay_payment_id
      booking.paymentDetails.paymentMethod = "razorpay"
      booking.paymentDetails.paymentStatus = "completed"
      booking.paymentDetails.transactionId = razorpay_order_id
      booking.paymentDetails.paidAt = new Date()
      booking.status = "confirmed"

      await booking.save()

      // Publish to Kafka
      await publishToKafka("payment-updates", {
        bookingId: booking._id,
        userId: req.user._id.toString(),
        paymentId: razorpay_payment_id,
        amount: booking.finalAmount,
        status: "completed",
        timestamp: new Date(),
      })

      res.json({
        message: "Payment verified successfully",
        booking: {
          _id: booking._id,
          bookingId: booking.bookingId,
          status: booking.status,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @desc    Handle payment failure
// @route   POST /api/payments/failure
// @access  Private
router.post(
  "/failure",
  protect,
  [body("bookingId").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { bookingId, error } = req.body

      const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id,
      })

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" })
      }

      booking.paymentDetails.paymentStatus = "failed"
      booking.status = "cancelled"
      await booking.save()

      // Publish to Kafka
      await publishToKafka("payment-updates", {
        bookingId: booking._id,
        userId: req.user._id.toString(),
        status: "failed",
        error: error,
        timestamp: new Date(),
      })

      res.json({ message: "Payment failure recorded" })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
