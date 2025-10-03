"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Calendar, ArrowRight, TrainFront, ChevronRight, Users, Baby, Ticket, Search, ArrowLeftRight, CircleAlert } from "lucide-react";
import SplitText from "@/components/animation/splitText";
import { useState } from "react";
import kereta1 from "../../../../public/images/kereta/kereta_1.jpg";
import kereta2 from "../../../../public/images/kereta/kereta_2.jpg";
import kereta3 from "../../../../public/images/kereta/kereta_3.jpg";
import kereta4 from "../../../../public/images/kereta/kereta_4.jpg";
import layanan1 from "../../../../public/images/layanan/angkutan_penumpang.jpg";
import layanan2 from "../../../../public/images/layanan/angkutan_barang.jpg";
import layanan3 from "../../../../public/images/layanan/pengusahaan_aset.jpg";
import Link from "next/link";
import Banner from "@/components/widget/animate-banner";

export default function KAIMain() {
  const [selectedTab, setSelectedTab] = useState("booking");
  const [errors, setErrors] = useState<string[]>([]);
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [searchForm, setSearchForm] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    adults: "",
    children: "",
  });

  const [bookingForm, setBookingForm] = useState({
    bookingCode: "",
    nik: "",
  });

  // Check if user is logged in based on session_id and get user_id
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("session_id") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const isLoggedIn = !!sessionId;

  const handleBookingInputChange = (field: string, value: string) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckBooking = () => {
    if (!isLoggedIn) {
      setErrors(["Silakan login terlebih dahulu untuk memeriksa kode booking"]);
      return;
    }
    if (!bookingForm.bookingCode || !bookingForm.nik) {
      setErrors(["Mohon masukkan kode booking dan NIK"]);
      return;
    }
    // Example: Redirect or fetch booking status
    alert(`Cek booking untuk kode: ${bookingForm.bookingCode}, NIK: ${bookingForm.nik}`);
  };

  const swapStations = () => {
    setSearchForm((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!searchForm.origin) {
      newErrors.push("Pilih stasiun asal");
    }
    if (!searchForm.destination) {
      newErrors.push("Pilih stasiun tujuan");
    }
    if (searchForm.origin === searchForm.destination && searchForm.origin) {
      newErrors.push("Stasiun asal dan tujuan tidak boleh sama");
    }
    if (!searchForm.departureDate) {
      newErrors.push("Pilih tanggal keberangkatan");
    }
    if (isReturnTrip && !searchForm.returnDate) {
      newErrors.push("Pilih tanggal kepulangan");
    }
    if (isReturnTrip && searchForm.returnDate && searchForm.departureDate) {
      if (new Date(searchForm.returnDate) <= new Date(searchForm.departureDate)) {
        newErrors.push("Tanggal pulang harus setelah tanggal berangkat");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const stations = ["Gambir", "Bandung", "Yogyakarta", "Surabaya", "Malang", "Semarang", "Purwokerto", "Solo", "Madiun", "Cirebon"];

  const handleInputChange = (field: string, value: string) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    if (!searchForm.origin || !searchForm.destination) {
      alert("Mohon pilih stasiun asal dan tujuan");
      return;
    }

    const searchParams = new URLSearchParams({
      origin: searchForm.origin,
      destination: searchForm.destination,
      departureDate: searchForm.departureDate,
      returnDate: searchForm.returnDate,
      adults: searchForm.adults || "1",
      children: searchForm.children || "0",
    });

    if (!isLoggedIn) {
      setErrors(["Silakan login terlebih dahulu untuk mencari tiket"]);
      return;
    }

    if (!userId) {
      setErrors(["User ID tidak ada"]);
      return;
    }

    searchParams.append("user_id", userId);
    window.location.href = `/booking?${searchParams.toString()}`;
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="">
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#F15A22]">
                <div className="w-8 h-8 flex items-center justify-center">
                  <TrainFront />
                </div>
                <SplitText
                  text="Anda adalah prioritas kami!"
                  className="font-medium text-lg"
                  delay={100}
                  duration={0.5}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                />
              </div>

              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                <SplitText
                  text="Rasakan Keindahan Indonesia, Satu Rel pada Satu Waktu"
                  delay={100}
                  duration={0.5}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 10 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-10px"
                  textAlign="start"
                />
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed -mt-5">Nikmati petualangan penuh makna, dengan kereta api yang menghubungkan Anda ke destinasi terbaik dan cerita indah di setiap perhentian 😄</p>
            </div>
            <Link href="/rute" >
              <Button className="w-full h-12 rounded-xl bg-[#003D79] hover:bg-[#002147] cursor-pointer text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all">Penasaran Rute Yang Bakalan Kamu Lewati? Cek Aja Sekarang 👀</Button>
            </Link>
          </div>

          {/* Right Images Grid */}
          <div className="relative lg:block hidden">
            <div className="absolute -top-12 -left-10 border border-gray-200 z-10 bg-white rounded-lg p-3 shadow-lg">
              <div className="text-sm font-bold text-gray-900">100+ Destinations</div>
              <div className="text-xs text-gray-600">100 of the indoensia&apos;s most destinations</div>
            </div>

            <div className="absolute top-7 -right-7 z-10 bg-[#F15A22] rotate-14 border border-[#F15A22] rounded-lg p-3 shadow-lg">
              <div className="text-sm font-bold text-white">Kereta Api Indonesia 🚆🚉</div>
            </div>
            <div className="grid grid-cols-2 gap-4 h-96">
              <div className="space-y-4">
                <Image src={kereta1} alt="Coastal cliffs" className="w-full h-60 object-cover rounded-tl-[5rem]" />
                <Image src={kereta2} alt="Tropical lagoon" className="w-full h-70 object-cover rounded-bl-[5rem]" />
              </div>
              <div className="space-y-4 pt-8">
                <Image src={kereta3} alt="Mountain camping" className="w-full h-64 object-cover rounded-tr-[5rem]" />
                <Image src={kereta4} alt="Limestone karsts" className="w-full h-66 object-cover rounded-br-[5rem]" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="rounded-2xl max-w-7xl mx-auto lg:mt-44 mb-20">
        <div className="w-full border-b border-gray-200 mb-4">
          <div className="grid grid-cols-2 w-full">
            <button 
              onClick={() => setSelectedTab("booking")}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                selectedTab === "booking" 
                  ? "text-[#F15A22] border-b-2 border-[#F15A22]" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Pemesanan Tiket</span>
              <span className="sm:hidden">Pesan</span>
            </button>
            <button 
              onClick={() => setSelectedTab("check")}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                selectedTab === "check" 
                  ? "text-[#F15A22] border-b-2 border-[#F15A22]" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Cek Kode Booking</span>
              <span className="sm:hidden">Cek</span>
            </button>
          </div>
        </div>

        {/* Content for selected tab */}
        {selectedTab === "booking" && (
          <Card className="border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Cari Tiket Kereta</CardTitle>
              <CardDescription className="text-base">Isi detail perjalanan Anda untuk mencari tiket yang tersedia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.length > 0 && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <CircleAlert className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Station Selection with Swap Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    Stasiun Asal
                  </Label>
                  <Select value={searchForm.origin} onValueChange={(value) => handleInputChange("origin", value)}>
                    <SelectTrigger id="origin" className="h-11 w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Pilih stasiun asal" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    Stasiun Tujuan
                  </Label>
                  <Select value={searchForm.destination} onValueChange={(value) => handleInputChange("destination", value)}>
                    <SelectTrigger id="destination" className="h-11 w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Pilih stasiun tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile Swap Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={swapStations}
                className="sm:hidden w-full border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 bg-transparent"
                disabled={!searchForm.origin && !searchForm.destination}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Tukar Stasiun
              </Button>

              {/* Date Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Tanggal Berangkat
                  </Label>
                  <Input
                    id="departureDate"
                    type="date"
                    min={today}
                    className="h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    value={searchForm.departureDate}
                    onChange={(e) => handleInputChange("departureDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="returnDate" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      Tanggal Pulang
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="return-trip"
                        checked={isReturnTrip}
                        onCheckedChange={(checked) => {
                          setIsReturnTrip(checked);
                          if (!checked) {
                            handleInputChange("returnDate", "");
                          }
                        }}
                      />
                      <Label htmlFor="return-trip" className="text-sm text-gray-600 cursor-pointer">
                        {isReturnTrip ? "Aktif" : "Nonaktif"}
                      </Label>
                    </div>
                  </div>
                  <Input
                    id="returnDate"
                    type="date"
                    min={searchForm.departureDate || today}
                    disabled={!isReturnTrip}
                    className="h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    value={searchForm.returnDate}
                    onChange={(e) => handleInputChange("returnDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Passenger Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults" className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    Jumlah Dewasa
                  </Label>
                  <Select value={searchForm.adults} onValueChange={(value) => handleInputChange("adults", value)}>
                    <SelectTrigger id="adults" className="h-11 w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Pilih jumlah" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Dewasa" : "Dewasa"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children" className="text-sm font-medium flex items-center gap-2">
                    <Baby className="w-4 h-4 text-orange-600" />
                    Jumlah Anak
                  </Label>
                  <Select value={searchForm.children} onValueChange={(value) => handleInputChange("children", value)}>
                    <SelectTrigger id="children" className="h-11 w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Pilih jumlah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tidak ada anak</SelectItem>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Anak (3+ tahun)
                        </SelectItem>
                      ))}
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={`baby-${num}`} value={`baby-${num}`}>
                          {num} Bayi {"(<"} 3 tahun)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} className="w-full h-12 bg-orange-600 hover:bg-orange-700 rounded-xl text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                <Search className="w-5 h-5 mr-2" />
                Cari Tiket Kereta
              </Button>

              {/* Helper Text */}
              <p className="text-sm text-gray-500 text-center text-pretty">Harga tiket sudah termasuk biaya administrasi dan asuransi perjalanan</p>
            </CardContent>
          </Card>
        )}

        {selectedTab === "check" && (
          <Card className="border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Cek Kode Booking</CardTitle>
              <CardDescription className="text-base">Masukkan kode booking dan NIK untuk memeriksa status pemesanan Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isLoggedIn && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <CircleAlert className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    Anda harus login untuk memeriksa kode booking.{" "}
                    <a href="/login" className="underline text-blue-600 font-semibold">
                      Login di sini
                    </a>
                  </AlertDescription>
                </Alert>
              )}
              {errors.length > 0 && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <CircleAlert className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Booking Code */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Ticket className="w-4 h-4 mr-2" />
                    Kode Booking
                  </Label>
                  <Input placeholder="Masukkan kode booking" className="border-gray-200" value={bookingForm.bookingCode} onChange={(e) => handleBookingInputChange("bookingCode", e.target.value)} disabled={!isLoggedIn} />
                </div>

                {/* NIK */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    NIK
                  </Label>
                  <Input placeholder="Masukkan NIK" className="border-gray-200" value={bookingForm.nik} onChange={(e) => handleBookingInputChange("nik", e.target.value)} disabled={!isLoggedIn} />
                </div>
              </div>

              {/* Check Button */}
              <div className="flex justify-center pt-2">
                <Button onClick={handleCheckBooking} className="w-full h-10 bg-[#003D79] hover:bg-[#0050A0] text-white px-8" disabled={!isLoggedIn}>
                  <Search className="w-4 h-4 mr-2" />
                  Cek Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Banner />
      {/* Explore Section */}
      <section className="px-6 py-16 bg-gray-50 mt-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Images */}
          <div className="flex items-center justify-center">
            <div className="relative flex gap-[-40px]">
              <div className="relative w-60 h-96 rounded-3xl overflow-hidden shadow-lg transform -rotate-3 z-10">
                <Image src={layanan1} alt="Overwater bungalows" fill className="object-cover" />
              </div>

              <div className="relative w-60 h-96 rounded-3xl overflow-hidden shadow-lg transform rotate-0 z-20 -ml-10">
                <Image src={layanan2} alt="Coral reef" fill className="object-cover" />
              </div>

              <div className="relative w-60 h-96 rounded-3xl overflow-hidden shadow-lg transform rotate-3 z-10 -ml-10">
                <Image src={layanan3} alt="Modern villa" fill className="object-cover" />
              </div>
            </div>
          </div>
          {/* Right Content */}
          <div className="space-y-8">
            <div className="space-y-1">
              <div className="text-[#F15A22] text-lg font-medium">Explore Indonesia With KAI</div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">Discover Your Perfect KAI Spot</h2>
              <p className="text-lg text-gray-600 leading-relaxed">Whether you&apos;re seeking a tranquil retreat, a cultural adventure, or an exhilarating outdoor experience, there&apos;s a perfect local escape waiting for you.</p>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl">
              <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex-1">
                <div className="font-medium text-gray-900 flex justify-between items-center">
                  Angkutan Penumpang
                  <ArrowRight className="bg-gray-200 p-1 rounded-full -rotate-45 hover:bg-gray-100 cursor-pointer w-6 h-6" />
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Fasilitas Utama</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Promo</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Jelajah Nusantara</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex-1">
                <div className="font-medium text-gray-900 flex justify-between items-center">
                  Angkutan Barang
                  <ArrowRight className="bg-gray-200 p-1 rounded-full -rotate-45 hover:bg-gray-100 cursor-pointer w-6 h-6" />
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Angkutan Retail</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Angkutan Korporat</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex-1">
                <div className="font-medium text-gray-900 flex justify-between items-center">
                  Pengusahaan Aset
                  <ArrowRight className="bg-gray-200 p-1 rounded-full -rotate-45 hover:bg-gray-100 cursor-pointer w-6 h-6" />
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Area Kormesil</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Space Iklan</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-[#F15A22]" />
                  <span>Bangunan Dinas</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button className="bg-[#003D79] hover:bg-[#0050A0] text-white flex items-center">
                Book Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="bg-gradient-to-b from-blue-100 to-transparent dark:from-red-900 w-full h-full absolute top-0 left-0 -z-99"></div>
    </div>
  );
}
