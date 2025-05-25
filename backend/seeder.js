const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("./models/User")
const Movie = require("./models/Movie")
const Theater = require("./models/Theater")
const Showtime = require("./models/Showtime")

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bookmyshow")

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Movie.deleteMany({})
    await Theater.deleteMany({})
    await Showtime.deleteMany({})

    console.log("Cleared existing data")

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@bookmyshow.com",
      phone: "9999999999",
      password: "admin123",
      role: "admin",
    })

    // Create theater owner
    const theaterOwner = await User.create({
      name: "Theater Owner",
      email: "owner@pvr.com",
      phone: "8888888888",
      password: "owner123",
      role: "theater_owner",
    })

    console.log("Created users")

    // Create movies - FIXED VERSION
    const movies = await Movie.create([
      {
        title: "Lilo & Stitch",
        description:
          "He is crazy... he is cute... he is adorable and he is everyone's bestie... Stitch is here to bring the house down with his infectious energy.",
        genre: ["Adventure", "Comedy", "Family", "Sci-Fi"],
        language: ["English", "Hindi"],
        duration: 107,
        rating: 8.9,
        votes: 410,
        certification: "U",
        releaseDate: new Date("2025-05-23"),
        poster: "/placeholder.svg?height=300&width=200",
        backdrop: "/placeholder.svg?height=400&width=800",
        cast: [
          { name: "Mia Kealoha", role: "as Lilo", image: "/placeholder.svg?height=100&width=100" },
          { name: "Chris Sanders", role: "as Stitch (Voice)", image: "/placeholder.svg?height=100&width=100" },
        ],
        crew: [{ name: "Dean Fleischer Camp", role: "Director", image: "/placeholder.svg?height=100&width=100" }],
        formats: ["2D", "3D", "4DX"],
        status: "now_showing",
      },
      {
        title: "Mission: Impossible - The Final Reckoning",
        description: "Ethan Hunt and his team face their most dangerous mission yet.",
        genre: ["Action", "Adventure", "Thriller"],
        language: ["English", "Hindi"],
        duration: 163,
        rating: 8.7,
        votes: 3000,
        certification: "U/A",
        releaseDate: new Date("2025-05-25"),
        poster: "/placeholder.svg?height=300&width=200",
        backdrop: "/placeholder.svg?height=400&width=800",
        cast: [
          { name: "Tom Cruise", role: "Ethan Hunt", image: "/placeholder.svg?height=100&width=100" },
          { name: "Hayley Atwell", role: "Grace", image: "/placeholder.svg?height=100&width=100" },
        ],
        crew: [{ name: "Christopher McQuarrie", role: "Director", image: "/placeholder.svg?height=100&width=100" }],
        formats: ["2D", "3D", "IMAX"],
        status: "now_showing",
      },
      {
        title: "Bhool Chuk Maaf",
        description: "A heartwarming comedy-romantic film that will make you laugh and cry.",
        genre: ["Comedy", "Romance"],
        language: ["Hindi", "English"],
        duration: 125,
        rating: 8.1,
        votes: 5300,
        certification: "U/A",
        releaseDate: new Date("2025-05-20"),
        poster: "/placeholder.svg?height=300&width=200",
        backdrop: "/placeholder.svg?height=400&width=800",
        cast: [
          { name: "Rajkummar Rao", role: "Lead Actor", image: "/placeholder.svg?height=100&width=100" },
          { name: "Kriti Sanon", role: "Lead Actress", image: "/placeholder.svg?height=100&width=100" },
        ],
        crew: [{ name: "Aanand L. Rai", role: "Director", image: "/placeholder.svg?height=100&width=100" }],
        formats: ["2D"],
        status: "now_showing",
      },
      {
        title: "Final Destination Bloodlines",
        description: "Death is back with a vengeance in this terrifying new installment.",
        genre: ["Horror", "Thriller"],
        language: ["English", "Hindi"],
        duration: 98,
        rating: 8.6,
        votes: 24300,
        certification: "A",
        releaseDate: new Date("2025-05-30"),
        poster: "/placeholder.svg?height=300&width=200",
        backdrop: "/placeholder.svg?height=400&width=800",
        cast: [
          { name: "Brec Bassinger", role: "Lead", image: "/placeholder.svg?height=100&width=100" },
          { name: "Teo Briones", role: "Supporting", image: "/placeholder.svg?height=100&width=100" },
        ],
        crew: [{ name: "Zach Lipovsky", role: "Director", image: "/placeholder.svg?height=100&width=100" }],
        formats: ["2D", "3D"],
        status: "upcoming",
      },
      {
        title: "Raid 2",
        description: "The sequel to the blockbuster action thriller returns with more intensity.",
        genre: ["Action", "Thriller"],
        language: ["Hindi", "English"],
        duration: 140,
        rating: 8.3,
        votes: 61300,
        certification: "U/A",
        releaseDate: new Date("2025-06-15"),
        poster: "/placeholder.svg?height=300&width=200",
        backdrop: "/placeholder.svg?height=400&width=800",
        cast: [
          { name: "Ajay Devgn", role: "Amay Patnaik", image: "/placeholder.svg?height=100&width=100" },
          { name: "Ileana D'Cruz", role: "Supporting", image: "/placeholder.svg?height=100&width=100" },
        ],
        crew: [{ name: "Raj Kumar Gupta", role: "Director", image: "/placeholder.svg?height=100&width=100" }],
        formats: ["2D"],
        status: "upcoming",
      },
    ])

    console.log("Created movies")

    // Create theaters
    const theaters = await Theater.create([
      {
        name: "PVR: Elante, Chandigarh",
        location: {
          address: "Elante Mall, Industrial Area Phase I",
          city: "Chandigarh",
          state: "Chandigarh",
          pincode: "160002",
        },
        contact: {
          phone: "0172508888",
          email: "elante@pvr.co.in",
        },
        screens: [
          {
            name: "AUDI 7",
            capacity: 200,
            seatLayout: generateSeatLayout(),
            features: ["Dolby Atmos", "4K Projection"],
          },
        ],
        facilities: ["M-Ticket", "Food & Beverage", "Parking", "Air Conditioning"],
        owner: theaterOwner._id,
      },
      {
        name: "PVR: CP67 Mall, Mohali",
        location: {
          address: "CP67 Mall, Phase 7, Mohali",
          city: "Mohali",
          state: "Punjab",
          pincode: "160062",
        },
        contact: {
          phone: "0172508889",
          email: "cp67@pvr.co.in",
        },
        screens: [
          {
            name: "AUDI 1",
            capacity: 180,
            seatLayout: generateSeatLayout(),
            features: ["Premium Sound", "3D Capable"],
          },
        ],
        facilities: ["M-Ticket", "Food & Beverage", "Wheelchair Accessible"],
        owner: theaterOwner._id,
      },
    ])

    console.log("Created theaters")

    // Create showtimes
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const showtimes = []

    for (const movie of movies) {
      for (const theater of theaters) {
        const screen = theater.screens[0]

        // Create showtimes for today and tomorrow
        for (const date of [today, tomorrow]) {
          const times = ["03:00 PM", "08:00 PM"]

          for (const time of times) {
            showtimes.push({
              movie: movie._id,
              theater: theater._id,
              screen: screen._id,
              date: date,
              time: time,
              language: "English",
              format: "3D",
              pricing: {
                classic: 280,
                premium: 450,
                recliner: 650,
              },
              totalSeats: screen.capacity,
              availableSeats: screen.capacity,
              bookedSeats: [],
            })
          }
        }
      }
    }

    await Showtime.create(showtimes)
    console.log("Created showtimes")

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

function generateSeatLayout() {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L"]
  const seatLayout = []

  rows.forEach((row, rowIndex) => {
    const seatsInRow = row === "L" ? 1 : rowIndex < 3 ? 17 : 17

    for (let seatNum = 1; seatNum <= seatsInRow; seatNum++) {
      let seatType = "classic"
      let price = 280

      if (rowIndex >= 8) {
        // Rows J, K, L
        seatType = "recliner"
        price = 650
      } else if (rowIndex >= 5) {
        // Rows F, G, H
        seatType = "premium"
        price = 450
      }

      seatLayout.push({
        row: row,
        number: seatNum,
        type: seatType,
        price: price,
      })
    }
  })

  return seatLayout
}

seedData()
