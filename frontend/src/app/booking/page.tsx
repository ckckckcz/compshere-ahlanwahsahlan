"use client";

import { Clock, DollarSign, MoreHorizontal, List, Grid3X3, Train, MapPin, Users, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Banner from "../../../public/images/banner.jpg";
import Card from "@/components/widget/Booking/Card";
import { useState, useEffect } from "react";
import { trainTickets, TrainTicket } from "@/data/dataBooking";
import { useSearchParams } from "next/navigation";

export default function FlightBookingPage() {
  const searchParams = useSearchParams()
  
  // Search results state
  const [searchResults, setSearchResults] = useState<TrainTicket[]>([])
  const [searchRoute, setSearchRoute] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Filter state
  type FilterCategory = "kelas" | "stasiun" | "kereta" | "waktu" | "harga";
  type FiltersState = {
    kelas: string[];
    stasiun: string[];
    kereta: string[];
    waktu: string[];
    harga: string[];
  };

  const [filters, setFilters] = useState<FiltersState>({
    kelas: [],
    stasiun: [],
    kereta: [],
    waktu: [],
    harga: []
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter tickets
  useEffect(() => {
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    
    if (origin && destination) {
      const route = `${origin} > ${destination}`
      setSearchRoute(route)
      
      // Filter tickets by route
      let filteredTickets = trainTickets.filter(ticket => ticket.route === route)
      
      // Apply additional filters if any
      if (filters.kelas.length > 0) {
        filteredTickets = filteredTickets.filter(ticket => 
          filters.kelas.some(kelas => ticket.class.includes(kelas))
        )
      }
      
      if (filters.waktu.length > 0) {
        filteredTickets = filteredTickets.filter(ticket => {
          const hour = parseInt(ticket.departureTime.split(':')[0])
          return filters.waktu.some(waktu => {
            if (waktu.includes('06:00 - 12:00')) return hour >= 6 && hour < 12
            if (waktu.includes('12:00 - 18:00')) return hour >= 12 && hour < 18
            if (waktu.includes('18:00 - 00:00')) return hour >= 18 && hour < 24
            if (waktu.includes('00:00 - 06:00')) return hour >= 0 && hour < 6
            return false
          })
        })
      }
      
      if (filters.harga.length > 0) {
        filteredTickets = filteredTickets.filter(ticket => {
          return filters.harga.some(harga => {
            if (harga.includes('0 - Rp 100.000')) return ticket.price <= 100000
            if (harga.includes('100.001 - Rp 200.000')) return ticket.price > 100000 && ticket.price <= 200000
            if (harga.includes('200.001 - Rp 300.000')) return ticket.price > 200000 && ticket.price <= 300000
            if (harga.includes('300.001 - Rp 400.000')) return ticket.price > 300000 && ticket.price <= 400000
            if (harga.includes('400.001 - Rp 500.000')) return ticket.price > 400000 && ticket.price <= 500000
            if (harga.includes('500.001 - Rp 600.000')) return ticket.price > 500000 && ticket.price <= 600000
            return false
          })
        })
      }
      
      setSearchResults(filteredTickets)
    } else {
      setSearchResults([])
      setSearchRoute("")
    }
    
    setIsLoading(false)
  }, [searchParams, filters])

  // Handle filter change
  const handleFilterChange = (category: FilterCategory, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      kelas: [],
      stasiun: [],
      kereta: [],
      waktu: [],
      harga: []
    });
  };

  // Remove specific filter
  interface RemoveFilterParams {
    category: keyof FiltersState;
    value: string;
  }

  const removeFilter = (category: RemoveFilterParams["category"], value: RemoveFilterParams["value"]) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].filter((item: string) => item !== value)
    }));
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.values(filters).flat().length;
  };

  // Filter options
  const filterOptions: { [K in FilterCategory]: string[] } = {
    kelas: ["Eksekutif", "Bisnis", "Ekonomi"],
    stasiun: ["Brebes", "Bekasi"],
    kereta: [
      "Menoreh", "Kertajaya", "Dharmawangsa Ekspres", "Tawang Jaya",
      "Tegal Bahari", "Tawang Jaya Premium", "Gunungjati", "Matarmaja",
      "Airlangga", "Brantas"
    ],
    waktu: [
      "Pagi - Siang (06:00 - 12:00)",
      "Siang - Sore (12:00 - 18:00)",
      "Sore - Malam (18:00 - 00:00)",
      "Malam - Pagi (00:00 - 06:00)"
    ],
    harga: [
      "Rp 0 - Rp 100.000",
      "Rp 100.001 - Rp 200.000",
      "Rp 200.001 - Rp 300.000",
      "Rp 300.001 - Rp 400.000",
      "Rp 400.001 - Rp 500.000",
      "Rp 500.001 - Rp 600.000"
    ]
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Static Background */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0">
          {/* Mountains */}
          <div className="absolute bottom-0 left-0 right-0 h-64 w-full">
            <svg viewBox="0 0 1200 300" className="w-full h-full">
              <path d="M0,300 L0,200 L200,100 L400,150 L600,80 L800,120 L1000,60 L1200,100 L1200,300 Z" fill="#22c55e" opacity="0.8" />
              <path d="M0,300 L0,220 L150,140 L350,180 L550,110 L750,150 L950,90 L1200,130 L1200,300 Z" fill="#16a34a" opacity="0.9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* KAI-Inspired Banner Section */}
        <div className="relative w-full overflow-hidden h-96">
          {/* Banner Background with imported image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${Banner.src})` }}
          >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/70 blur-8xl"></div>
          </div>

          {/* Banner Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Train className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-white font-bold text-lg">KAI SEARCH</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {searchResults.length} search results
              </h1>
              
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
                {searchRoute ? `Hasil pencarian untuk rute ${searchRoute}` : "Temukan perjalanan terbaik dengan layanan terpercaya"}
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-6 text-white/80">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{searchRoute || "Multiple Routes"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">All Classes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Section for Filters and Results */}
        <div className="w-full">
          <div className="bg-white w-full px-4 md:px-8 py-8">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4 container mx-auto">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gray-100 hover:bg-gray-200 text-black border border-gray-200 cursor-pointer rounded-full px-6 py-2 flex items-center gap-2"
                >
                  <MoreHorizontal className="w-4 h-4 text-orange-500" />
                  Filter ({getActiveFiltersCount()})
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="container mx-auto mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Filter aktif:</span>
                  {Object.entries(filters).map(([category, values]) =>
                    values.map(value => (
                      <div key={`${category}-${value}`} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {value}
                        <button onClick={() => removeFilter(category as keyof FiltersState, value)}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                  <Button 
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-800 text-sm underline bg-transparent hover:bg-transparent p-0"
                  >
                    Hapus semua
                  </Button>
                </div>
              </div>
            )}

            {/* Main Filter Panel */}
            {showFilters && (
              <div className="container mx-auto mb-6">
                <div className="bg-white border rounded-lg shadow-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Kelas Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Train className="w-4 h-4 text-blue-600" />
                        Kelas
                      </h3>
                      <div className="space-y-2">
                        {filterOptions.kelas.map(kelas => (
                          <label key={kelas} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.kelas.includes(kelas)}
                              onChange={() => handleFilterChange('kelas', kelas)}
                              className="rounded"
                            />
                            <span className="text-sm">{kelas}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Stasiun Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        Stasiun
                      </h3>
                      <div className="space-y-2">
                        {filterOptions.stasiun.map(stasiun => (
                          <label key={stasiun} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.stasiun.includes(stasiun)}
                              onChange={() => handleFilterChange('stasiun', stasiun)}
                              className="rounded"
                            />
                            <span className="text-sm">{stasiun}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Waktu Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Waktu Keberangkatan
                      </h3>
                      <div className="space-y-2">
                        {filterOptions.waktu.map(waktu => (
                          <label key={waktu} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.waktu.includes(waktu)}
                              onChange={() => handleFilterChange('waktu', waktu)}
                              className="rounded"
                            />
                            <span className="text-sm">{waktu}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Harga Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-orange-500" />
                        Rentang Harga
                      </h3>
                      <div className="space-y-2">
                        {filterOptions.harga.map(harga => (
                          <label key={harga} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.harga.includes(harga)}
                              onChange={() => handleFilterChange('harga', harga)}
                              className="rounded"
                            />
                            <span className="text-sm">{harga}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Kereta Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Train className="w-4 h-4 text-red-600" />
                        Kereta
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {filterOptions.kereta.map(kereta => (
                          <label key={kereta} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.kereta.includes(kereta)}
                              onChange={() => handleFilterChange('kereta', kereta)}
                              className="rounded"
                            />
                            <span className="text-sm">{kereta}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Train Results */}
            <div className="container mx-auto">
              <div className="space-y-6">
                <Card tickets={searchResults} searchRoute={searchRoute} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}