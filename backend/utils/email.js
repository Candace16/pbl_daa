const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendBookingConfirmation = async (booking, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.contactDetails.email,
      subject: `Booking Confirmation - ${booking.bookingId}`,
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
          <li><strong>Movie:</strong> ${booking.showtime.movie.title}</li>
          <li><strong>Theater:</strong> ${booking.showtime.theater.name}</li>
          <li><strong>Date & Time:</strong> ${booking.showtime.date} at ${booking.showtime.time}</li>
          <li><strong>Seats:</strong> ${booking.seats.map((s) => `${s.row}${s.number}`).join(", ")}</li>
          <li><strong>Total Amount:</strong> ₹${booking.finalAmount}</li>
        </ul>
        <p>Please arrive 30 minutes before the show time.</p>
        <p>Thank you for choosing BookMyShow!</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("Booking confirmation email sent")
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error)
  }
}

const sendCancellationEmail = async (booking, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.contactDetails.email,
      subject: `Booking Cancelled - ${booking.bookingId}`,
      html: `
        <h2>Booking Cancelled</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been cancelled. Here are the details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
          <li><strong>Movie:</strong> ${booking.showtime.movie.title}</li>
          <li><strong>Refund Amount:</strong> ₹${booking.cancellationDetails.refundAmount}</li>
        </ul>
        <p>Your refund will be processed within 5-7 business days.</p>
        <p>Thank you for choosing BookMyShow!</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log("Cancellation email sent")
  } catch (error) {
    console.error("Failed to send cancellation email:", error)
  }
}

module.exports = {
  sendBookingConfirmation,
  sendCancellationEmail,
}
