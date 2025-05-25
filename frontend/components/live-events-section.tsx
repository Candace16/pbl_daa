import Image from "next/image"
import Link from "next/link"

const eventCategories = [
  {
    title: "COMEDY SHOWS",
    subtitle: "4 Events",
    color: "bg-purple-500",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    title: "AMUSEMENT PARK",
    subtitle: "2 Events",
    color: "bg-blue-400",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    title: "KIDS",
    subtitle: "6 Events",
    color: "bg-orange-400",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    title: "MUSIC SHOWS",
    subtitle: "5 Events",
    color: "bg-indigo-500",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    title: "WORKSHOPS & MORE",
    subtitle: "4 Events",
    color: "bg-red-400",
    image: "/placeholder.svg?height=150&width=200",
  },
]

export function LiveEventsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">The Best Of Live Events</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {eventCategories.map((category, index) => (
            <Link key={index} href={`/events/${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div
                className={`${category.color} rounded-lg p-6 text-white relative overflow-hidden h-32 flex flex-col justify-between hover:scale-105 transition-transform`}
              >
                <div>
                  <h3 className="font-bold text-sm mb-1">{category.title}</h3>
                  <p className="text-xs opacity-90">{category.subtitle}</p>
                </div>
                <div className="absolute right-2 bottom-2 opacity-30">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
