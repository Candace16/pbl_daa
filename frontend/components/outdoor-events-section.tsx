import Image from "next/image"
import Link from "next/link"

const outdoorEvents = [
  {
    title: "PUNJAB KINGS - IPL 2025",
    venue: "Multiple Venues",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "VILEN LIVE - CHANDIGARH",
    venue: "Sector 7 Gourmet House, Chandigarh",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Lucknow Super Giants v Royal Challengers...",
    venue: "BRSABV EKANA CRICKET STADIUM, LUCKNOW",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Funcity Amusement and waterpark",
    venue: "Royal Family Water Park, Chandigarh",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Kal ki Chinta Nahi Karna ft. Ravi Gupta",
    venue: "Tagore Theatre, Chandigarh",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export function OutdoorEventsSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Outdoor Events</h2>
          <Link href="/outdoor" className="text-red-500 hover:text-red-600 font-medium">
            See All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {outdoorEvents.map((event, index) => (
            <Link key={index} href={`/event/${event.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{event.title}</h3>
                  <p className="text-xs text-gray-600">{event.venue}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
