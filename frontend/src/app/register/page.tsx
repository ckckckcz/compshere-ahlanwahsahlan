 "use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }
    setIsLoading(true);

    try {
      console.log("Sending API request to /api/register with payload:", formData);

      const response = await fetch("https://coherent-classic-platypus.ngrok-free.app/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("API response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const result = await response.json();
      console.log("API response body:", result);

      if (!response.ok) {
        setError(result.error || "Registrasi gagal");
        return;
      }

      // Store email temporarily for the completion page
      localStorage.setItem("temp_user_email", formData.email);

      toast.success(result.message);
      router.push(`/melengkapi-data?user_id=${result.user_id}`);
    } catch (error) {
      console.error("API request failed:", error);
      setError("Terjadi kesalahan pada server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-black mb-2">Create an account</h2>
            <p className="text-gray-400">
              Sudah Punya Akun?{" "}
              <Link href="/login" className="text-[#F15A22] hover:text-[#e14d1d] underline">
                Masuk
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="h-12 bg-gray-50 mt-2 border-gray-200 focus:border-[#F15A22] focus:ring-[#F15A22] rounded-lg"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="h-12 bg-gray-50 mt-2 border-gray-200 focus:border-[#F15A22] focus:ring-[#F15A22] rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <Input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="h-12 bg-gray-50 mt-2 border-gray-200 focus:border-[#F15A22] focus:ring-[#F15A22] rounded-lg"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#F15A22] to-orange-400 hover:from-[#e14d1d] hover:to-orange-500 cursor-pointer text-white font-medium py-3 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}