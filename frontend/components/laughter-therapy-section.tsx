import Image from "next/image"
import Link from "next/link"

const comedyEvents = [
  {
    title: "I LOVE YOU",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "AACHA-AACHA KISKO BOLA",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "BEST OF COMEDY",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "OPEN MIC COMEDY",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "BADAL SHARMA",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export function LaughterTherapySection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Laughter Therapy</h2>
          <Link href="/comedy" className="text-red-500 hover:text-red-600 font-medium">
            See All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {comedyEvents.map((event, index) => (
            <Link key={index} href={`/event/${event.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="group">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-sm">{event.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
