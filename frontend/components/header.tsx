"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Menu, MapPin, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">
              book<span className="bg-red-500 text-white px-1 rounded">my</span>show
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Location and User Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Chandigarh</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/bookings")}>My Bookings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="bg-red-500 hover:bg-red-600 text-white px-6"
                onClick={() => router.push("/auth/login")}
              >
                Sign in
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-8 py-2 text-sm">
          <Link href="/movies" className="text-gray-700 hover:text-red-500">
            Movies
          </Link>
          <Link href="/stream" className="text-gray-700 hover:text-red-500">
            Stream
          </Link>
          <Link href="/events" className="text-gray-700 hover:text-red-500">
            Events
          </Link>
          <Link href="/plays" className="text-gray-700 hover:text-red-500">
            Plays
          </Link>
          <Link href="/sports" className="text-gray-700 hover:text-red-500">
            Sports
          </Link>
          <Link href="/activities" className="text-gray-700 hover:text-red-500">
            Activities
          </Link>

          <div className="ml-auto flex items-center space-x-6 text-xs text-gray-500">
            <Link href="/list-your-show">ListYourShow</Link>
            <Link href="/corporates">Corporates</Link>
            <Link href="/offers">Offers</Link>
            <Link href="/gift-cards">Gift Cards</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
