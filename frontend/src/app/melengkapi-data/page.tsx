"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Camera, User } from "lucide-react"

export default function CompleteProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    user_id: "",
    nama_keluarga: "",
    foto: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Get user_id from URL parameters only
  useEffect(() => {
    const user_id = searchParams.get("user_id");
    if (user_id && user_id !== "undefined" && !isNaN(parseInt(user_id))) {
      setFormData((prev) => ({ ...prev, user_id }));
    } else {
      toast.error("Invalid user ID. Please ensure you have a valid registration link.");
      // router.push("/register"); // Uncomment if you want to redirect
    }
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target

    if (name === "foto" && files && files[0]) {
      const file = files[0]
      setFormData((prev) => ({ ...prev, foto: file }))

      // Preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let fotoBase64 = null
      if (formData.foto) {
        fotoBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(formData.foto!)
        })
      }

      const payload = {
        user_id: formData.user_id,
        nama_keluarga: formData.nama_keluarga || null,
        foto: fotoBase64,
      }

      const response = await fetch("https://coherent-classic-platypus.ngrok-free.app/api/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Profile completion failed")
      }

      toast.success(result.message)
      router.push("/login")
    } catch (error) {
      console.error("API request failed:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-[#F15A22] to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-500 text-sm">Add your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group hover:border-[#F15A22] transition-colors">
                  {photoPreview ? (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#F15A22] transition-colors" />
                  )}
                  <Input
                    type="file"
                    name="foto"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Click to upload profile photo
                <br />
                (optional)
              </p>
            </div>

            {/* Family Name */}
            <div className="space-y-2">
              <label htmlFor="nama_keluarga" className="text-sm font-medium text-gray-700">
                Family Name
              </label>
              <Input
                type="text"
                name="nama_keluarga"
                placeholder="Enter your family name (optional)"
                value={formData.nama_keluarga}
                onChange={handleInputChange}
                className="h-12 bg-gray-50 border-gray-200 focus:border-[#F15A22] focus:ring-[#F15A22] rounded-lg"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#F15A22] to-orange-400 hover:from-[#e14d1d] hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Completing Profile...</span>
                </div>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-400">By completing your profile, you agree to our terms of service</p>
          </div>
        </div>
      </div>
    </div>
  )
}
            
