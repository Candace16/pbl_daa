"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const showtimeId = searchParams.get("showtimeId")
  const seats = searchParams.get("seats")?.split(",") || []
  const movieId = searchParams.get("movieId")

  const [contactOpen, setContactOpen] = useState(true)
  const [promoOpen, setPromoOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState("googlepay")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookingData, setBookingData] = useState<any>(null)
  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (!showtimeId || !seats.length) {
      router.push("/")
      return
    }
    createBooking()
  }, [showtimeId, seats])

  const createBooking = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          showtimeId,
          seats,
          contactDetails: {
            email: contactDetails.email || "user@example.com",
            phone: contactDetails.phone || "9999999999",
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBookingData(data.booking)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create booking")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const handlePayment = async () => {
    if (!bookingData) return

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      // Create payment order
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingData._id,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order")
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_key",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BookMyShow",
        description: "Movie Ticket Booking",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingData._id,
              }),
            })

            if (verifyResponse.ok) {
              router.push(`/booking-success?bookingId=${bookingData._id}`)
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            setError("Payment verification failed")
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        theme: {
          color: "#ef4444",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      setError("Payment initialization failed")
    } finally {
      setLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Creating your booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold">
              book<span className="bg-red-500 text-white px-1 rounded">my</span>show
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Details */}
            <Collapsible open={contactOpen} onOpenChange={setContactOpen}>
              <CollapsibleTrigger className="w-full bg-red-500 text-white p-4 rounded-lg flex items-center justify-between">
                <span className="font-semibold">Share your Contact Details</span>
                {contactOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-white p-4 rounded-b-lg border border-t-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={contactDetails.email}
                    onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                  />
                  <div className="flex">
                    <div className="bg-gray-100 px-3 py-2 border border-r-0 rounded-l">+91</div>
                    <Input
                      placeholder="Mobile Number"
                      className="rounded-l-none"
                      value={contactDetails.phone}
                      onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white mt-4 px-8" onClick={createBooking}>
                  CONTINUE
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Promo Codes */}
            <Collapsible open={promoOpen} onOpenChange={setPromoOpen}>
              <CollapsibleTrigger className="w-full bg-gray-100 p-4 rounded-lg flex items-center justify-between">
                <span className="font-semibold">Unlock offers or Apply Promocodes</span>
                {promoOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-white p-4 rounded-b-lg border border-t-0">
                <Input placeholder="Enter promocode" />
              </CollapsibleContent>
            </Collapsible>

            {/* Payment Options */}
            <Collapsible open={paymentOpen} onOpenChange={setPaymentOpen}>
              <CollapsibleTrigger className="w-full bg-red-500 text-white p-4 rounded-lg flex items-center justify-between">
                <span className="font-semibold">Payment options</span>
                {paymentOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-white rounded-b-lg border border-t-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Payment Methods Sidebar */}
                  <div className="bg-gray-50 p-4 space-y-2">
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm font-semibold">QuikPay</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">Pay by any UPI App</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">Debit/Credit Card</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">Net Banking</div>
                    <div className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">Mobile Wallets</div>
                  </div>

                  {/* Payment Options */}
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <Image
                        src="/placeholder.svg?height=24&width=40"
                        alt="UPI"
                        width={40}
                        height={24}
                        className="mr-2"
                      />
                      <span className="font-semibold">Pay by any UPI App</span>
                    </div>

                    <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Label
                          htmlFor="googlepay"
                          className="flex items-center space-x-2 cursor-pointer border rounded p-3 hover:bg-gray-50"
                        >
                          <RadioGroupItem value="googlepay" id="googlepay" />
                          <Image src="/placeholder.svg?height=24&width=24" alt="Google Pay" width={24} height={24} />
                          <span className="text-sm">Google Pay</span>
                        </Label>

                        <Label
                          htmlFor="phonepe"
                          className="flex items-center space-x-2 cursor-pointer border rounded p-3 hover:bg-gray-50"
                        >
                          <RadioGroupItem value="phonepe" id="phonepe" />
                          <Image src="/placeholder.svg?height=24&width=24" alt="PhonePe" width={24} height={24} />
                          <span className="text-sm">PhonePe</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    <Button
                      className="w-full bg-red-500 hover:bg-red-600 text-white mt-6 py-3"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : `Pay ₹${bookingData.finalAmount}`}
                    </Button>

                    <div className="mt-6 text-xs text-gray-500">
                      By clicking "Make Payment" you agree to the{" "}
                      <a href="#" className="text-blue-600">
                        terms and conditions
                      </a>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-600">ORDER SUMMARY</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold">{seats.length}</div>
                  <div className="text-sm text-gray-600">Tickets</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="font-semibold">Movie Booking</h3>
                <p className="text-sm text-gray-600">Booking ID: {bookingData.bookingId}</p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sub Total</span>
                  <span>Rs. {bookingData.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>+ Convenience fees</span>
                  <span>Rs. {bookingData.convenienceFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>+ Taxes</span>
                  <span>Rs. {bookingData.taxes}</span>
                </div>
              </div>

              <div className="bg-yellow-100 p-3 rounded mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Amount Payable</span>
                  <span className="text-xl font-bold">Rs. {bookingData.finalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}
