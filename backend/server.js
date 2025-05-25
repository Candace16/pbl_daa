const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const socketIo = require("socket.io")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const movieRoutes = require("./routes/movies")
const showtimeRoutes = require("./routes/showtimes")
const seatRoutes = require("./routes/seats")
const bookingRoutes = require("./routes/bookings")

const { authenticateSocket } = require("./middlewares/auth")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bookmyshow")
  .then(() => {
    console.log("✅ MongoDB connected successfully")
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    console.log("💡 Make sure MongoDB is running on your computer!")
  })

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.id}`)

  socket.on("join-showtime", (showtimeId) => {
    socket.join(`showtime-${showtimeId}`)
    console.log(`🎬 User joined showtime ${showtimeId}`)
  })

  socket.on("leave-showtime", (showtimeId) => {
    socket.leave(`showtime-${showtimeId}`)
    console.log(`🚪 User left showtime ${showtimeId}`)
  })

  socket.on("disconnect", () => {
    console.log(`👋 User disconnected: ${socket.id}`)
  })
})

// Make io available to routes
app.set("io", io)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/movies", movieRoutes)
app.use("/api/showtimes", showtimeRoutes)
app.use("/api/seats", seatRoutes)
app.use("/api/bookings", bookingRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

module.exports = { app, io }
