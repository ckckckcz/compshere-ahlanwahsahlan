"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Train, Smartphone, AlertTriangle, CheckCircle, Clock, Wifi, Download } from "lucide-react"

interface BookingData {
  bookingCode: string
  passengerName: string
  trainName: string
  route: string
  departureTime: string
  arrivalTime: string
  seatNumber: string
  status: "confirmed" | "cancelled" | "completed"
  date: string
}

declare global {
  interface Window {
    NDEFReader?: any
  }
}

export default function KAIBookingCheck() {
  const [bookingCode, setBookingCode] = useState("")
  const [nik, setNik] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [isNFCScanning, setIsNFCScanning] = useState(false)
  const [showNFCWarning, setShowNFCWarning] = useState(false)

  useEffect(() => {
    // Check if NFC is supported
    if ("NDEFReader" in window) {
      setIsNFCSupported(true)
    }
  }, [])

  const handleSearch = async () => {
    if (!bookingCode || !nik) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setBookingData({
        bookingCode: bookingCode,
        passengerName: "John Doe",
        trainName: "Argo Bromo Anggrek",
        route: "Jakarta Gambir - Surabaya Gubeng",
        departureTime: "19:10",
        arrivalTime: "05:45+1",
        seatNumber: "EKS 2A",
        status: "confirmed",
        date: "25 Januari 2025",
      })
      setIsLoading(false)
    }, 2000)
  }

  const handleNFCScan = async () => {
    if (!isNFCSupported) {
      setShowNFCWarning(true)
      return
    }

    setIsNFCScanning(true)

    try {
      // @ts-ignore - NDEFReader is experimental
      const ndef = new window.NDEFReader()
      await ndef.scan()

      ndef.addEventListener("reading", (event: any) => {
        const { message } = event;
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder((record as any).encoding)
            const data = textDecoder.decode(record.data)

            // Parse NFC data (assuming it contains booking code and NIK)
            try {
              const nfcData = JSON.parse(data)
              setBookingCode(nfcData.bookingCode || "")
              setNik(nfcData.nik || "")
              setIsNFCScanning(false)
            } catch (e) {
              console.error("Invalid NFC data format")
              setIsNFCScanning(false)
            }
          } else if (record.recordType === "url") {
            // Handle URL record: decode and redirect to external app/URL
            const textDecoder = new TextDecoder()
            const url = textDecoder.decode(record.data)
            console.log("Redirecting to URL from NFC:", url)
            window.location.href = url; // Ini bisa trigger "pilih tindakan" kalau URL custom
            setIsNFCScanning(false)
          } else {
            // Optional: handle other record types if needed
            console.log("Unsupported record type:", record.recordType)
            setIsNFCScanning(false)
          }
        }
      })

      // Auto stop scanning after 10 seconds
      setTimeout(() => {
        setIsNFCScanning(false)
      }, 10000)
    } catch (error) {
      console.error("NFC scan failed:", error)
      setIsNFCScanning(false)
      setShowNFCWarning(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold text-balance mb-4"
            >
              Cek Status Booking Anda
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg text-pretty"
            >
              Masukkan kode booking dan NIK untuk melihat detail perjalanan kereta Anda
            </motion.p>
          </div>

          {/* Search Form */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Pencarian Booking
                </CardTitle>
                <CardDescription>Gunakan form manual atau scan NFC untuk pencarian cepat</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Input</TabsTrigger>
                    <TabsTrigger value="nfc" className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      NFC Scan
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Kode Booking</label>
                        <Input
                          placeholder="Contoh: ABC123DEF"
                          value={bookingCode}
                          onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                          className="text-center font-mono tracking-wider"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">NIK (Nomor Induk Kependudukan)</label>
                        <Input
                          placeholder="16 digit NIK"
                          value={nik}
                          onChange={(e) => setNik(e.target.value)}
                          maxLength={16}
                          className="text-center font-mono tracking-wider"
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={!bookingCode || !nik || isLoading}
                        className="w-full"
                        size="lg"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Search className="w-5 h-5 mr-2" />
                        )}
                        {isLoading ? "Mencari..." : "Cari Booking"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="nfc" className="space-y-4 mt-6">
                    <div className="text-center py-8">
                      <motion.div
                        animate={isNFCScanning ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        className={`w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center ${isNFCScanning ? "nfc-glow" : ""}`}
                      >
                        <Smartphone className="w-12 h-12 text-primary" />
                      </motion.div>

                      {isNFCScanning ? (
                        <div>
                          <p className="text-lg font-medium mb-2">Scanning NFC...</p>
                          <p className="text-muted-foreground text-sm">Dekatkan kartu atau device NFC ke ponsel Anda</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium mb-2">Scan NFC Tag</p>
                          <p className="text-muted-foreground text-sm mb-4">
                            Tap tombol di bawah untuk memulai scanning
                          </p>
                          <Button onClick={handleNFCScan} variant="outline" size="lg" className="mb-4 bg-transparent">
                            <Wifi className="w-5 h-5 mr-2" />
                            Mulai Scan NFC
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* NFC Warning */}
          <AnimatePresence>
            {showNFCWarning && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    <strong>Fitur NFC tidak tersedia.</strong> Untuk menggunakan fitur scan NFC, silakan download
                    aplikasi{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-orange-600 dark:text-orange-400 font-semibold"
                      onClick={() => window.open("#", "_blank")}
                    >
                      HeyKAI
                    </Button>{" "}
                    dari Play Store atau App Store.
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNFCWarning(false)}
                      className="ml-2 text-orange-600 hover:text-orange-700"
                    >
                      Tutup
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking Results */}
          <AnimatePresence>
            {bookingData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Booking Ditemukan
                      </CardTitle>
                      <Badge
                        variant={bookingData.status === "confirmed" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {bookingData.status === "confirmed" ? "Terkonfirmasi" : "Dibatalkan"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Passenger Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Kode Booking</p>
                        <p className="font-mono font-bold text-lg">{bookingData.bookingCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nama Penumpang</p>
                        <p className="font-semibold">{bookingData.passengerName}</p>
                      </div>
                    </div>

                    {/* Train Info */}
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Train className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{bookingData.trainName}</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Rute</p>
                          <p className="font-medium">{bookingData.route}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tanggal</p>
                          <p className="font-medium">{bookingData.date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Journey Details */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{bookingData.departureTime}</p>
                          <p className="text-sm text-muted-foreground">Keberangkatan</p>
                        </div>

                        <div className="flex-1 mx-4">
                          <div className="relative">
                            <div className="h-0.5 bg-border"></div>
                            <motion.div
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full train-animation"
                              initial={{ x: 0 }}
                            />
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold">{bookingData.arrivalTime}</p>
                          <p className="text-sm text-muted-foreground">Kedatangan</p>
                        </div>
                      </div>
                    </div>

                    {/* Seat Info */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Nomor Kursi</p>
                          <p className="font-bold text-xl">{bookingData.seatNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">On Time</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Download App CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Download HeyKAI</h3>
                    <p className="text-sm text-muted-foreground">
                      Dapatkan pengalaman lengkap dengan fitur NFC dan notifikasi real-time
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}