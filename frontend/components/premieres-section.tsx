import Image from "next/image"
import Link from "next/link"

const premieres = [
  {
    title: "Failure!",
    language: "English",
    badge: "PREMIERE",
    image: "/placeholder.svg?height=200&width=150",
  },
  {
    title: "Oru Adaar Love",
    language: "Malayalam",
    badge: "PREMIERE",
    image: "/placeholder.svg?height=200&width=150",
  },
  {
    title: "Eephus",
    language: "English",
    badge: "PREMIERE",
    image: "/placeholder.svg?height=200&width=150",
  },
  {
    title: "I Am Nayaka",
    language: "Spanish",
    badge: "PREMIERE",
    image: "/placeholder.svg?height=200&width=150",
  },
  {
    title: "Rita",
    language: "Spanish",
    badge: "PREMIERE",
    image: "/placeholder.svg?height=200&width=150",
  },
]

export function PremieresSection() {
  return (
    <section className="py-12 bg-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <div className="bg-red-600 rounded-full p-2 mr-3">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">PREMIERE</h2>
              <p className="text-sm text-gray-300">Brand new releases every Friday</p>
            </div>
          </div>
          <Link href="/premieres" className="ml-auto text-red-400 hover:text-red-300">
            See All
          </Link>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Premieres</h3>
          <p className="text-gray-300 text-sm">Brand new releases every Friday</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {premieres.map((movie, index) => (
            <Link key={index} href={`/movie/${movie.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="group">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <Image
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    {movie.badge}
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold text-sm">{movie.title}</h4>
                  <p className="text-xs text-gray-400">{movie.language}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
