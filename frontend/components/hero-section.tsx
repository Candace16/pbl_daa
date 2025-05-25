import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-96 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/placeholder.svg?height=400&width=1200" alt="Summer Vacation Spot" fill className="object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            YOUR BEST
            <br />
            <span className="text-yellow-400">SUMMER</span>
            <br />
            <span className="text-pink-400">VACATION</span>
            <br />
            SPOT
          </h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-white text-black px-4 py-2 rounded-lg">
              <span className="font-bold">Adult</span>
              <div className="text-lg font-bold">
                ₹1299 <span className="text-sm line-through text-gray-500">₹799</span>
              </div>
            </div>
            <div className="bg-white text-black px-4 py-2 rounded-lg">
              <span className="font-bold">Child</span>
              <div className="text-lg font-bold">
                ₹799 <span className="text-sm line-through text-gray-500">₹599</span>
              </div>
            </div>
          </div>
          <p className="text-lg mb-6">BEAT KO BEAT KARO, SLIDES SE SAATH CHEAT KARO!</p>
          <Button className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-3 text-lg font-bold">BOOK NOW</Button>
        </div>
      </div>
    </section>
  )
}
