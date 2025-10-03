import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, MapPin, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../../../public/KAI-Logo.png"
import Image from "next/image";

export default function Footer() {
  const partners = [
    { name: "KAI Commuter", logo: "/placeholder.svg?height=40&width=120" },
    { name: "PT KAI Logistik", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Ministry of Transportation", logo: "/placeholder.svg?height=40&width=120" },
  ];

  return (
    <footer className="py-16 sm:py-20 bg-white text-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#003d7934] rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#003d7934] rounded-full blur-3xl translate-x-40 translate-y-40"></div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-1 mb-6">
              <Image className="w-24 h-12 text-[#F15A22] flex items-center justify-center mr-3" src={Logo} alt="KAI Logo"/>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-lg">
              Menyediakan layanan perjalanan kereta api yang aman, nyaman, dan tepat waktu untuk seluruh masyarakat Indonesia.
            </p>
            <div className="flex space-x-4">
              {/* Social media icons */}
              <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[#F15A22]">Tautan Cepat</h3>
            <ul className="space-y-4">
              {[
                { name: "Tentang KAI", href: "/about" },
                { name: "Jadwal Kereta", href: "/schedule" },
                { name: "Tiket & Pemesanan", href: "/tickets" },
                { name: "Kontak Kami", href: "/contact" },
                { name: "Blog", href: "/blog" },
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#F15A22] transition-colors duration-300 flex items-center group">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[#F15A22]">Sumber Daya</h3>
            <ul className="space-y-4">
              {[
                { name: "Kebijakan Privasi", href: "/privacy" },
                { name: "Syarat & Ketentuan", href: "/terms" },
                { name: "FAQ", href: "/faq" },
                { name: "Panduan Penumpang", href: "/guide" },
                { name: "API Dokumentasi", href: "/api" },
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#F15A22] transition-colors duration-300 flex items-center group">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[#F15A22]">Hubungi Kami</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-[#F15A22] mr-3" />
                <a href="mailto:contact@kai.id" className="text-gray-400 hover:text-[#F15A22] transition-colors">
                  contact@kai.id
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-[#F15A22] mr-3" />
                <span className="text-gray-400">+62 21 1234 5678</span>
              </div>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mt-6">
                <p className="text-sm text-gray-400 mb-2">Versi :</p>
                <p className="text-[#F15A22] font-semibold">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-lg">&copy; 2025 PT Kereta Api Indonesia (Persero). Semua hak dilindungi.</p>
              <p className="text-gray-300 text-sm mt-1">Platform ini mendukung perjalanan nyaman dan aman bagi seluruh penumpang KAI.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
