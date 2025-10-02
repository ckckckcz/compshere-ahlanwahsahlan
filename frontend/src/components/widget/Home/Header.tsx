"use client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, ArrowRight, TrainFront, ChevronRight, Users, Baby, Ticket, Search } from "lucide-react"
import SplitText from "@/components/animation/splitText"
import { useState } from "react"
import kereta1 from "../../../../public/images/kereta/kereta_1.jpg"
import kereta2 from "../../../../public/images/kereta/kereta_2.jpg"
import kereta3 from "../../../../public/images/kereta/kereta_3.jpg"
import kereta4 from "../../../../public/images/kereta/kereta_4.jpg"
import layanan1 from "../../../../public/images/layanan/angkutan_penumpang.jpg"
import layanan2 from "../../../../public/images/layanan/angkutan_barang.jpg"
import layanan3 from "../../../../public/images/layanan/pengusahaan_aset.jpg"

export default function TravelMain() {
    const [selectedTab, setSelectedTab] = useState("booking")
    
    const [searchForm, setSearchForm] = useState({
        origin: "",
        destination: "",
        departureDate: "",
        returnDate: "",
        adults: "",
        children: ""
    })

    const stations = [
        "Gambir", "Bandung", "Yogyakarta", "Surabaya", "Malang",
        "Semarang", "Purwokerto", "Solo", "Madiun", "Cirebon"
    ]

    const handleInputChange = (field: string, value: string) => {
        setSearchForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSearch = () => {
        if (!searchForm.origin || !searchForm.destination) {
            alert("Mohon pilih stasiun asal dan tujuan")
            return
        }
        
        const searchParams = new URLSearchParams({
            origin: searchForm.origin,
            destination: searchForm.destination,
            departureDate: searchForm.departureDate,
            returnDate: searchForm.returnDate,
            adults: searchForm.adults || "1",
            children: searchForm.children || "0"
        })
        
        window.location.href = `/booking?${searchParams.toString()}`
    }

    return (
        <div className="bg-white">
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

                            <p className="text-lg text-gray-600 leading-relaxed -mt-5">
                                Nikmati petualangan penuh makna, dengan kereta api yang menghubungkan Anda ke destinasi terbaik dan cerita indah di setiap perhentian 😄
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="booking" className="flex items-center gap-2 text-xs sm:text-sm">
                                        <Ticket className="w-4 h-4" />
                                        <span className="hidden sm:inline">Pemesanan Tiket</span>
                                        <span className="sm:hidden">Pesan</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="check" className="flex items-center gap-2 text-xs sm:text-sm">
                                        <Search className="w-4 h-4" />
                                        <span className="hidden sm:inline">Cek Kode Booking</span>
                                        <span className="sm:hidden">Cek</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="booking" className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 w-full">
                                        <div className="space-y-2 ">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                Stasiun Asal
                                            </label>
                                            <Select value={searchForm.origin} onValueChange={(value) => handleInputChange('origin', value)}>
                                                <SelectTrigger className="border-gray-200 w-full">
                                                    <SelectValue placeholder="Pilih stasiun asal" />
                                                </SelectTrigger>
                                                <SelectContent className="">
                                                    {stations.map((station) => (
                                                        <SelectItem key={station} value={station}>
                                                            {station}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                Stasiun Tujuan
                                            </label>
                                            <Select value={searchForm.destination} onValueChange={(value) => handleInputChange('destination', value)}>
                                                <SelectTrigger className="border-gray-200 w-full">
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
                                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Tanggal Berangkat
                                            </label>
                                            <Input 
                                                type="date" 
                                                className="border-gray-200 w-full" 
                                                value={searchForm.departureDate}
                                                onChange={(e) => handleInputChange('departureDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Tanggal Pulang
                                            </label>
                                            <Input 
                                                type="date" 
                                                className="border-gray-200 w-full" 
                                                value={searchForm.returnDate}
                                                onChange={(e) => handleInputChange('returnDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <Users className="w-4 h-4 mr-2" />
                                                Jumlah Dewasa
                                            </label>
                                            <Select value={searchForm.adults} onValueChange={(value) => handleInputChange('adults', value)}>
                                                <SelectTrigger className="border-gray-200 w-full">
                                                    <SelectValue placeholder="Pilih jumlah" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                                        <SelectItem key={num} value={num.toString()}>
                                                            {num} Dewasa
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <Baby className="w-4 h-4 mr-2" />
                                                Jumlah Anak
                                            </label>
                                            <Select value={searchForm.children} onValueChange={(value) => handleInputChange('children', value)}>
                                                <SelectTrigger className="border-gray-200 w-full">
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
                                                            {num} Anak (&lt; 3 tahun)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex items-end sm:col-span-2 lg:col-span-1">
                                        <Button 
                                            className="w-full bg-[#003D79] hover:bg-[#0050A0] text-white h-10"
                                            onClick={handleSearch}
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Cari Tiket
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="check" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Booking Code */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <Ticket className="w-4 h-4 mr-2" />
                                                Kode Booking
                                            </label>
                                            <Input placeholder="Masukkan kode booking" className="border-gray-200" />
                                        </div>

                                        {/* NIK */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                <Users className="w-4 h-4 mr-2" />
                                                NIK
                                            </label>
                                            <Input placeholder="Masukkan NIK" className="border-gray-200" />
                                        </div>
                                    </div>

                                    {/* Check Button */}
                                    <div className="flex justify-center pt-2">
                                        <Button className="w-full bg-[#003D79] hover:bg-[#0050A0] text-white h-10 px-8">
                                            <Search className="w-4 h-4 mr-2" />
                                            Cek Booking
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right Images Grid */}
                    <div className="relative">
                        <div className="absolute -top-12 -left-10 border border-gray-200 z-10 bg-white rounded-lg p-3 shadow-lg">
                            <div className="text-sm font-bold text-gray-900">100+ Destinations</div>
                            <div className="text-xs text-gray-600">100 of the indoensia&apos;s most destinations</div>
                        </div>

                        <div className="absolute top-7 -right-7 z-10 bg-[#F15A22] rotate-14 border border-[#F15A22] rounded-lg p-3 shadow-lg">
                            <div className="text-sm font-bold text-white">Kereta Api Indonesia 🚆🚉</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 h-96">
                            <div className="space-y-4">
                                <Image
                                    src={kereta1}
                                    alt="Coastal cliffs"
                                    className="w-full h-60 object-cover rounded-tl-[5rem]"
                                />
                                <Image
                                    src={kereta2}
                                    alt="Tropical lagoon"
                                    className="w-full h-70 object-cover rounded-bl-[5rem]"
                                />
                            </div>
                            <div className="space-y-4 pt-8">
                                <Image
                                    src={kereta3}
                                    alt="Mountain camping"
                                    className="w-full h-64 object-cover rounded-tr-[5rem]"
                                />
                                <Image
                                    src={kereta4}
                                    alt="Limestone karsts"
                                    className="w-full h-66 object-cover rounded-br-[5rem]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Explore Section */}
            <section className="px-6 py-16 bg-gray-50 mt-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left Images */}
                    <div className="flex items-center justify-center">
                        <div className="relative flex gap-[-40px]">
                            <div className="relative w-60 h-96 rounded-3xl overflow-hidden shadow-lg transform -rotate-3 z-10">
                                <Image
                                    src={layanan1}
                                    alt="Overwater bungalows"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="relative w-60 h-96 rounded-3xl overflow-hidden shadow-lg transform rotate-0 z-20 -ml-10">
                                <Image
                                    src={layanan2}
                                    alt="Coral reef"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="relative w-60 h-96 rounded-3xl overflow-hidden shadow-lg transform rotate-3 z-10 -ml-10">
                                <Image
                                    src={layanan3}
                                    alt="Modern villa"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Right Content */}
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <div className="text-[#F15A22] text-lg font-medium">Explore Indonesia With KAI</div>

                            <h2 className="text-4xl font-bold text-gray-900 leading-tight">Discover Your Perfect Travel Spot</h2>

                            <p className="text-lg text-gray-600 leading-relaxed">
                                Whether you&apos;re seeking a tranquil retreat, a cultural adventure, or an exhilarating outdoor experience,
                                there&apos;s a perfect local escape waiting for you.
                            </p>
                        </div>

                        {/* Filter Options */}
                        <div className="flex space-x-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1">
                                <div className="font-medium text-gray-900 flex justify-between">
                                    Angkutan Penumpang
                                    <ArrowRight className="bg-gray-200 h-full w-7 p-1 rounded-full -rotate-45 hover:bg-gray-100 cursor-pointer" />
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
                                    <span>Fasilitas Utama</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
                                    <span>Promo</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
                                    <span>Jelajah Nusantara</span>
                                </div>

                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1">
                                <div className="font-medium text-gray-900 flex justify-between">
                                    Angkutan Barang
                                    <ArrowRight className="bg-gray-200 h-full w-7 p-1 rounded-full -rotate-45 hover:bg-gray-100 cursor-pointer" />
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
                                    <span>Angkutan Retail</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
                                    <span>Angkutan Korporat</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1">
                                <div className="font-medium text-gray-900 flex justify-between">
                                    Pengusahaan Aset
                                    <ArrowRight className="bg-gray-200 h-full w-7 p-1 rounded-full -rotate-45 hover:bg-gray-100 cursor-pointer" />
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
                                    <span>Area Kormesil</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
                                    <span>Space Iklan</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-2 flex flex-row items-center gap-1">
                                    <ChevronRight className="w-4 h-4 text-[#F15A22] " />
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
        </div>
    )
}
