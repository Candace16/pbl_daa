"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LanguageFormatModalProps {
  isOpen: boolean
  onClose: () => void
  movieId: string
  movieTitle: string
  languages: string[]
}

export function LanguageFormatModal({ isOpen, onClose, movieId, movieTitle, languages }: LanguageFormatModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0] || "ENGLISH")
  const [selectedFormat, setSelectedFormat] = useState("3D")
  const router = useRouter()

  const handleContinue = () => {
    onClose()
    router.push(`/showtimes/${movieId}?language=${selectedLanguage}&format=${selectedFormat}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{movieTitle}</DialogTitle>
          <p className="text-center text-gray-600">Select language and format</p>
        </DialogHeader>

        <div className="space-y-6">
          {languages.includes("English") && (
            <div>
              <h3 className="font-semibold mb-3">ENGLISH</h3>
              <div className="flex gap-2">
                <Button
                  variant={selectedFormat === "3D" && selectedLanguage === "English" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedLanguage("English")
                    setSelectedFormat("3D")
                  }}
                  className={
                    selectedFormat === "3D" && selectedLanguage === "English" ? "bg-red-500 hover:bg-red-600" : ""
                  }
                >
                  3D
                </Button>
                <Button
                  variant={selectedFormat === "4DX 3D" && selectedLanguage === "English" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedLanguage("English")
                    setSelectedFormat("4DX 3D")
                  }}
                  className={
                    selectedFormat === "4DX 3D" && selectedLanguage === "English" ? "bg-red-500 hover:bg-red-600" : ""
                  }
                >
                  4DX 3D
                </Button>
              </div>
            </div>
          )}

          {languages.includes("Hindi") && (
            <div>
              <h3 className="font-semibold mb-3">HINDI</h3>
              <div className="flex gap-2">
                <Button
                  variant={selectedFormat === "2D" && selectedLanguage === "Hindi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedLanguage("Hindi")
                    setSelectedFormat("2D")
                  }}
                  className={
                    selectedFormat === "2D" && selectedLanguage === "Hindi" ? "bg-red-500 hover:bg-red-600" : ""
                  }
                >
                  2D
                </Button>
                <Button
                  variant={selectedFormat === "3D" && selectedLanguage === "Hindi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedLanguage("Hindi")
                    setSelectedFormat("3D")
                  }}
                  className={
                    selectedFormat === "3D" && selectedLanguage === "Hindi" ? "bg-red-500 hover:bg-red-600" : ""
                  }
                >
                  3D
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <Button className="bg-red-500 hover:bg-red-600 text-white px-8" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
