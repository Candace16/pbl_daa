import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">MOVIES NOW SHOWING IN CHANDIGARH</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <Link href="#" className="block hover:text-white">
                Bhool Chuk Maaf
              </Link>
              <Link href="#" className="block hover:text-white">
                Lilo & Stitch
              </Link>
              <Link href="#" className="block hover:text-white">
                Mission: Impossible
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">UPCOMING MOVIES</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <Link href="#" className="block hover:text-white">
                Final Destination
              </Link>
              <Link href="#" className="block hover:text-white">
                Raid 2
              </Link>
              <Link href="#" className="block hover:text-white">
                Thunderbolts
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">MOVIE GENRES</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <Link href="#" className="block hover:text-white">
                Drama Movies
              </Link>
              <Link href="#" className="block hover:text-white">
                Comedy Movies
              </Link>
              <Link href="#" className="block hover:text-white">
                Action Movies
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">HELP</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <Link href="#" className="block hover:text-white">
                About Us
              </Link>
              <Link href="#" className="block hover:text-white">
                Contact Us
              </Link>
              <Link href="#" className="block hover:text-white">
                Current Opening
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; Bigtree Entertainment Pvt. Ltd. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
