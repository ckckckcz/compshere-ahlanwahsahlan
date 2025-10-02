"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, Users, CreditCard, Train, ArrowRight, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

interface PassengerData {
  title: string;
  name: string;
  identityType: string;
  identityNumber: string;
  email: string;
  address: string;
}

interface BookingData {
  ticketId: string;
  trainName: string;
  trainNumber: string;
  class: string;
  passengers: number;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  price: number;
  duration: string;
}

// Add Midtrans declaration
declare global {
  interface Window {
    snap: any;
  }
}

export default function ElegantBookingPage() {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mainPassenger, setMainPassenger] = useState<PassengerData>({
    title: "",
    name: "",
    identityType: "",
    identityNumber: "",
    email: "",
    address: "",
  });

  const [passenger1, setPassenger1] = useState<PassengerData>({
    title: "",
    name: "",
    identityType: "",
    identityNumber: "",
    email: "",
    address: "",
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // Load booking data from URL parameters
  useEffect(() => {
    if (searchParams) {
      const ticketId = searchParams.get('ticketId');
      const trainName = searchParams.get('trainName');
      const trainNumber = searchParams.get('trainNumber');
      const ticketClass = searchParams.get('class');
      const origin = searchParams.get('origin');
      const destination = searchParams.get('destination');
      const departureTime = searchParams.get('departureTime');
      const arrivalTime = searchParams.get('arrivalTime');
      const departureDate = searchParams.get('departureDate');
      const arrivalDate = searchParams.get('arrivalDate');
      const duration = searchParams.get('duration');
      const price = searchParams.get('price');
      const passengers = searchParams.get('passengers');

      if (ticketId && trainName && trainNumber && ticketClass && origin && destination) {
        setBookingData({
          ticketId: ticketId,
          trainName: trainName,
          trainNumber: trainNumber,
          class: ticketClass,
          passengers: parseInt(passengers || "1"),
          departureStation: origin.toUpperCase(),
          arrivalStation: destination.toUpperCase(),
          departureTime: departureTime || "",
          arrivalTime: arrivalTime || "",
          departureDate: departureDate || "",
          arrivalDate: arrivalDate || "",
          price: parseInt(price || "0"),
          duration: duration || "",
        });
      }
      setIsLoading(false);
    }
  }, [searchParams]);

  // Load Midtrans Snap script
  useEffect(() => {
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    let scriptTag = document.createElement('script');
    scriptTag.src = midtransScriptUrl;
    scriptTag.setAttribute('data-client-key', midtransClientKey || '');
    scriptTag.async = true;

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  const handleMainPassengerChange = (field: keyof PassengerData, value: string) => {
    setMainPassenger((prev) => ({ ...prev, [field]: value }));
  };

  const handlePassenger1Change = (field: keyof PassengerData, value: string) => {
    setPassenger1((prev) => ({ ...prev, [field]: value }));
  };

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `KAI-${timestamp}-${random}`;
  };

  const handlePayment = async () => {
    if (!bookingData) {
      toast.error("Data booking tidak ditemukan");
      return;
    }

    setIsLoadingPayment(true);

    try {
      const orderId = generateOrderId();
      
      // Prepare transaction data
      const transactionData = {
        order_id: orderId,
        gross_amount: bookingData.price,
        customer_details: {
          first_name: mainPassenger.name.split(' ')[0] || 'Customer',
          last_name: mainPassenger.name.split(' ').slice(1).join(' ') || '',
          email: mainPassenger.email,
          phone: '08123456789',
          billing_details: {
            first_name: mainPassenger.name.split(' ')[0] || 'Customer',
            last_name: mainPassenger.name.split(' ').slice(1).join(' ') || '',
            email: mainPassenger.email,
            phone: '08123456789',
            address: mainPassenger.address || 'Indonesia'
          }
        },
        item_details: [
          {
            id: bookingData.ticketId,
            price: bookingData.price,
            quantity: 1,
            name: `${bookingData.trainName} (${bookingData.trainNumber}) - ${bookingData.class}`,
            brand: 'KAI',
            category: 'Train Ticket',
            merchant_name: 'PT Kereta Api Indonesia'
          }
        ],
        custom_expiry: {
          order_time: new Date().toISOString(),
          expiry_duration: 30,
          unit: "minute"
        }
      };

      console.log('🚀 Sending transaction data to backend:', transactionData);

      // Request payment token from backend
      const response = await fetch('https://coherent-classic-platypus.ngrok-free.app/create/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to create transaction:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to create transaction: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend response data:', result);

      if (!result.data || !result.data.transaction_token) {
        console.error('❌ No transaction token in response:', result);
        throw new Error('No transaction token received from backend');
      }

      const token = result.data.transaction_token;
      console.log('🎫 SNAP Token received successfully:', token);

      // Open Midtrans SNAP
      if (window.snap) {
        console.log('🚀 Opening Midtrans SNAP with token:', token);
        
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            console.log('✅ Payment success:', result);
            toast.success('Pembayaran berhasil!');
            
            // Store booking data for success page
            const bookingResult = {
              orderId: orderId,
              bookingData,
              mainPassenger,
              passenger1,
              paymentResult: result,
              timestamp: new Date().toISOString(),
            };
            
            localStorage.setItem('bookingResult', JSON.stringify(bookingResult));
            
            // Redirect to success page
            window.location.href = '/booking-success';
          },
          onPending: (result: any) => {
            console.log('⏳ Payment pending:', result);
            toast('Pembayaran sedang diproses...');
            
            // Store pending booking data
            const pendingBooking = {
              orderId: orderId,
              bookingData,
              mainPassenger,
              passenger1,
              paymentResult: result,
              status: 'pending',
              timestamp: new Date().toISOString(),
            };
            
            localStorage.setItem('pendingBooking', JSON.stringify(pendingBooking));
            
            // Redirect to pending page
            window.location.href = '/booking-pending';
          },
          onError: (result: any) => {
            console.error('❌ Payment error:', result);
            toast.error('Pembayaran gagal, silakan coba lagi');
          },
          onClose: () => {
            console.log('🚪 Payment popup closed by user');
            toast('Pembayaran dibatalkan');
          }
        });
      } else {
        console.error('❌ Midtrans SNAP not loaded');
        toast.error('Midtrans tidak tersedia, silakan refresh halaman');
      }

    } catch (error) {
      console.error('💥 Payment error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        toast.error(`Terjadi kesalahan: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        toast.error('Terjadi kesalahan saat memproses pembayaran');
      }
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      toast.error("Anda harus menyetujui syarat dan ketentuan");
      return;
    }

    if (!mainPassenger.title || !mainPassenger.name || !mainPassenger.identityType || !mainPassenger.identityNumber || !mainPassenger.email) {
      toast.error("Mohon lengkapi data pemesanan");
      return;
    }

    // Proceed to payment
    await handlePayment();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading booking details...</span>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Data Booking Tidak Ditemukan</h2>
          <p className="text-gray-600">Silakan kembali dan pilih tiket terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medium text-foreground mb-2 text-balance">Pemesanan Tiket Kereta</h1>
              <p className="text-muted-foreground text-lg">Lengkapi informasi pemesanan untuk melanjutkan</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <Train className="w-4 h-4" />
                <span>{bookingData.trainName} ({bookingData.trainNumber}) - {bookingData.class}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left Column - Forms */}
          <div className="lg:col-span-3 space-y-8">
            {/* Step Indicator */}
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm font-medium">Data Pemesan</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mx-4" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-border text-muted-foreground flex items-center justify-center text-sm">2</div>
                <span className="text-sm text-muted-foreground">Pembayaran</span>
              </div>
            </div>

            {/* Main Passenger Data */}
            <Card className="elegant-shadow border-border">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl font-medium text-foreground flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  Data Pemesan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Select value={mainPassenger.title} onValueChange={(value) => handleMainPassengerChange("title", value)}>
                      <SelectTrigger className="w-full h-10 border-border bg-gray-100">
                        <SelectValue placeholder="Pilih title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tuan">Tuan</SelectItem>
                        <SelectItem value="Nyonya">Nyonya</SelectItem>
                        <SelectItem value="Nona">Nona</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nama Pemesan</label>
                    <Input placeholder="Nama sesuai NIK / Passport" value={mainPassenger.name} onChange={(e) => handleMainPassengerChange("name", e.target.value)} className="w-full h-10 border-border bg-gray-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tipe Identitas</label>
                    <Select value={mainPassenger.identityType} onValueChange={(value) => handleMainPassengerChange("identityType", value)}>
                      <SelectTrigger className="w-full h-10 border-border bg-gray-100">
                        <SelectValue placeholder="Pilih tipe identitas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NIK">NIK</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="KITAS">KITAS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nomor Identitas</label>
                    <Input placeholder="No Identitas sesuai NIK / Passport" value={mainPassenger.identityNumber} onChange={(e) => handleMainPassengerChange("identityNumber", e.target.value)} className="w-full h-10 border-border bg-gray-100" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="me@contoh.co.id" value={mainPassenger.email} onChange={(e) => handleMainPassengerChange("email", e.target.value)} className="w-full h-10 border-border bg-gray-100" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Alamat</label>
                  <Input placeholder="Nama Daerah" value={mainPassenger.address} onChange={(e) => handleMainPassengerChange("address", e.target.value)} className="w-full h-10 border-border bg-gray-100" />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="add-to-passenger-list" className="border-border" />
                    <label htmlFor="add-to-passenger-list" className="text-sm text-muted-foreground">
                      Tambahkan ke daftar penumpang
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger 1 Data */}
            <Card className="elegant-shadow border-border">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl font-medium text-foreground flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  Data Penumpang 1
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Select value={passenger1.title} onValueChange={(value) => handlePassenger1Change("title", value)}>
                      <SelectTrigger className="w-full h-10 border-border bg-gray-100">
                        <SelectValue placeholder="Pilih title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tuan">Tuan</SelectItem>
                        <SelectItem value="Nyonya">Nyonya</SelectItem>
                        <SelectItem value="Nona">Nona</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nama</label>
                    <Input placeholder="Nama sesuai NIK / Passport" value={passenger1.name} onChange={(e) => handlePassenger1Change("name", e.target.value)} className="w-full h-10 border-border bg-gray-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tipe Identitas</label>
                    <Select value={passenger1.identityType} onValueChange={(value) => handlePassenger1Change("identityType", value)}>
                      <SelectTrigger className="w-full h-10 border-border bg-gray-100">
                        <SelectValue placeholder="Pilih tipe identitas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NIK">NIK</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="KITAS">KITAS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nomor Identitas</label>
                    <Input placeholder="Nomor identitas sesuai NIK / Passport" value={passenger1.identityNumber} onChange={(e) => handlePassenger1Change("identityNumber", e.target.value)} className="w-full h-10 border-border bg-gray-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="elegant-shadow border-border">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={agreeToTerms}
                      onCheckedChange={checked => setAgreeToTerms(checked === true)}
                    className="border-border mt-1" 
                  />
                  <div className="space-y-1">
                    <label htmlFor="terms" className="text-sm font-medium text-foreground cursor-pointer">
                      Saya menyetujui syarat dan ketentuan
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Dengan mencentang kotak ini, Anda menyetujui syarat dan ketentuan yang berlaku untuk pemesanan tiket kereta api.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <Card className="elegant-shadow-lg border-border">
                <CardHeader className="bg-card border-b border-border">
                  <CardTitle className="flex items-center justify-between text-xl font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Train className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <span>Ringkasan Pesanan</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {/* Price */}
                    <div className="text-center pb-1 border-b border-border">
                      <div className="text-3xl font-medium text-foreground">Rp {bookingData.price.toLocaleString("id-ID")}</div>
                      <div className="text-sm text-muted-foreground mt-1">Total pembayaran</div>
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-4 p-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{bookingData.departureDate}</p>
                        <h3 className="font-medium text-lg text-foreground">
                          {bookingData.trainName} ({bookingData.trainNumber})
                        </h3>
                        <p className="text-sm text-muted-foreground">{bookingData.class}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.passengers} Dewasa</p>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{bookingData.departureStation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{bookingData.arrivalStation}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{bookingData.departureTime}</span>
                          <span>{bookingData.arrivalTime}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                          <Clock className="w-4 h-4" />
                          <span>Durasi: {bookingData.duration}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleSubmit}
                        disabled={!agreeToTerms || isSubmitting || isLoadingPayment}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed elegant-shadow"
                      >
                        {isSubmitting || isLoadingPayment ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                            <span>{isLoadingPayment ? 'Memproses Pembayaran...' : 'Memproses...'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5" />
                            <span>Lanjut Pembayaran</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
