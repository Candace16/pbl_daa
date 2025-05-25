const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" })
      }

      next()
    } catch (error) {
      console.error(error)
      return res.status(401).json({ message: "Not authorized, token failed" })
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }
}

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as admin" })
  }
}

// Theater owner middleware
const theaterOwner = (req, res, next) => {
  if (req.user && (req.user.role === "theater_owner" || req.user.role === "admin")) {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as theater owner" })
  }
}

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("Authentication error"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return next(new Error("User not found"))
    }

    socket.userId = user._id.toString()
    socket.user = user
    next()
  } catch (error) {
    next(new Error("Authentication error"))
  }
}

module.exports = { protect, admin, theaterOwner, authenticateSocket }
