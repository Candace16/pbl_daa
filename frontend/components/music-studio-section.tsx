import Image from "next/image"
import Link from "next/link"

const musicEvents = [
  {
    title: "VILEN LIVE - CHANDIGARH",
    date: "Sat, 7 Jun",
    venue: "Sector 7 Social, Chandigarh",
    type: "Concerts",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "TAKOUT",
    date: "Sun, 25 May",
    venue: "Sector 7 Social, Chandigarh",
    type: "Club Gigs",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "The Swift Cruel Summer Party Edition",
    date: "Sat, 30 Aug",
    venue: "Venue To Be Announced, Chandigarh",
    type: "Club Gigs",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Directioners - A One Direction Themed Fan Event",
    date: "Fri, 1 Aug",
    venue: "Venue To Be Announced, Chandigarh",
    type: "Club Gigs",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Afterverse - A The Weeknd Themed Fan Event",
    date: "Sat, 6 Sep",
    venue: "Venue To Be Announced, Chandigarh",
    type: "Club Gigs",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export function MusicStudioSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Music Studio</h2>
          <Link href="/music" className="text-red-500 hover:text-red-600 font-medium">
            See All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {musicEvents.map((event, index) => (
            <Link key={index} href={`/event/${event.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="group">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{event.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">{event.venue}</p>
                  <p className="text-xs text-gray-500">{event.type}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
