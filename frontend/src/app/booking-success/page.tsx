"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Train, MapPin, Calendar, Clock, Download, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingSuccessPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const storedBooking = localStorage.getItem('bookingResult');
    if (storedBooking) {
      setBookingData(JSON.parse(storedBooking));
    } else {
      // Redirect to home if no booking data
      router.push('/');
    }
  }, [router]);

  const handleDownloadTicket = () => {
    // Implement ticket download logic
    console.log('Download ticket for:', bookingData?.orderId);
  };

  const handleBackToHome = () => {
    localStorage.removeItem('bookingResult');
    router.push('/');
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-600">Tiket kereta Anda telah berhasil dibeli</p>
        </div>

        {/* Booking Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="w-5 h-5" />
              Detail Tiket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{bookingData.bookingData.trainName}</h3>
                <p className="text-gray-600">{bookingData.bookingData.trainNumber} - {bookingData.bookingData.class}</p>
                <p className="text-sm text-gray-500 mt-2">Kode Booking: <span className="font-mono font-bold">{bookingData.orderId}</span></p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  Rp {bookingData.bookingData.price.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-500">Total Pembayaran</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{bookingData.bookingData.departureStation}</p>
                    <p className="text-sm text-gray-500">{bookingData.bookingData.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{bookingData.bookingData.duration}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div className="text-right">
                    <p className="font-medium">{bookingData.bookingData.arrivalStation}</p>
                    <p className="text-sm text-gray-500">{bookingData.bookingData.arrivalTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Data Penumpang:</h4>
              <p className="text-sm">{bookingData.mainPassenger.title} {bookingData.mainPassenger.name}</p>
              <p className="text-sm text-gray-500">{bookingData.mainPassenger.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={handleDownloadTicket} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download E-Tiket
          </Button>
          <Button variant="outline" onClick={handleBackToHome} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
