"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Train, ChevronRight, Clock, MapPin, Armchair } from "lucide-react";
import { toast } from "react-hot-toast";
import PemilihanKursi from "@/components/widget/Booking/PemilihanKursi";
import { trainTickets, TrainTicket } from "@/data/dataBooking";

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
  selectedSeats: string[];
  id_user?: number;
  snapToken?: string;
}

declare global {
  interface Window {
    snap: any;
  }
}

export default function BookingStepper() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [addToPassengerList, setAddToPassengerList] = useState(false);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    ticketId: "",
    trainName: "",
    trainNumber: "",
    class: "",
    passengers: 1,
    departureStation: "",
    arrivalStation: "",
    departureTime: "",
    arrivalTime: "",
    departureDate: "",
    arrivalDate: "",
    price: 0,
    duration: "",
    selectedSeats: [],
    id_user: undefined,
    snapToken: undefined,
  });

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

  const steps = [
    { id: 1, name: "Data Pemesan" },
    { id: 2, name: "Pemilihan Kursi" },
    { id: 3, name: "Pembayaran" },
  ];

  useEffect(() => {
    if (searchParams) {
      const ticketId = searchParams.get("ticketId");
      const trainName = searchParams.get("trainName");
      const trainNumber = searchParams.get("trainNumber");
      const ticketClass = searchParams.get("class");
      const origin = searchParams.get("destination");
      const destination = searchParams.get("origin");
      const departureTime = searchParams.get("departureTime");
      const arrivalTime = searchParams.get("arrivalTime");
      const departureDate = searchParams.get("departureDate");
      const arrivalDate = searchParams.get("arrivalDate");
      const duration = searchParams.get("duration");
      const price = searchParams.get("price");
      const passengers = searchParams.get("passengers");
      const id_user = searchParams.get("user_id");

      if (ticketId && trainName && trainNumber && ticketClass && origin && destination) {
        setBookingData((prev) => ({
          ...prev,
          ticketId: ticketId,
          trainName: trainName,
          trainNumber: trainNumber,
          class: ticketClass,
          passengers: Number.parseInt(passengers || "1"),
          departureStation: origin.toUpperCase(),
          arrivalStation: destination.toUpperCase(),
          departureTime: departureTime || "",
          arrivalTime: arrivalTime || "",
          departureDate: departureDate || "",
          arrivalDate: arrivalDate || "",
          price: Number.parseInt(price || "0"),
          duration: duration || "",
          id_user: id_user ? Number.parseInt(id_user) : undefined,
        }));
      }
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    const scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;
    scriptTag.setAttribute("data-client-key", midtransClientKey || "");
    scriptTag.async = true;

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  const handleInputChange = (field: keyof PassengerData, value: string) => {
    setMainPassenger((prev) => ({ ...prev, [field]: value }));
  };

  const handlePassenger1Change = (field: keyof PassengerData, value: string) => {
    setPassenger1((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeatsSelected = useCallback((seats: string[]) => {
    setBookingData((prev) => ({ ...prev, selectedSeats: seats }));
  }, []);

  const isStep1Valid = () => {
    const mainPassengerValid = mainPassenger.title && mainPassenger.name && mainPassenger.identityType && mainPassenger.identityNumber && mainPassenger.email;
    if (!addToPassengerList && bookingData.passengers === 1) {
      return mainPassengerValid;
    }
    return mainPassengerValid && passenger1.title && passenger1.name && passenger1.identityType && passenger1.identityNumber;
  };

  const isStep2Valid = () => {
    return bookingData.selectedSeats.length > 0 && bookingData.selectedSeats.length <= bookingData.passengers;
  };

  const fetchSnapToken = async () => {
    if (!bookingData.id_user) {
      toast.error("User ID tidak tersedia");
      return;
    }
    if (!isStep2Valid()) {
      toast.error("Pilih kursi terlebih dahulu");
      return;
    }

    try {
      const passengersCount = addToPassengerList ? bookingData.passengers : bookingData.selectedSeats.length;
      const transactionData = {
        id_user: bookingData.id_user,
        gross_amount: bookingData.price * passengersCount + 5000,
        id: bookingData.ticketId,
        id_family: [18, 19, 20],
      };

      const response = await fetch("https://coherent-classic-platypus.ngrok-free.app/api/create/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Snap token: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === "success" && result.data) {
        setSnapToken(result.data); // Ambil token langsung dari 'data'
        setBookingData((prev) => ({ ...prev, snapToken: result.data }));
        toast.success("Snap token berhasil digenerate!");
      } else {
        throw new Error("Gagal mendapatkan Snap token dari backend");
      }
    } catch (error) {
      toast.error("Gagal mendapatkan Snap token, silakan coba lagi");
    }
  };

  const handlePayment = () => {
    if (!snapToken) {
      toast.error("Snap token tidak tersedia, silakan ulangi proses pemilihan kursi");
      return;
    }
    if (!agreeToTerms) {
      toast.error("Anda harus menyetujui syarat dan ketentuan");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `KAI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const passengersCount = addToPassengerList ? bookingData.passengers : bookingData.selectedSeats.length;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: (result: any) => {
            toast.success("Pembayaran berhasil!");
            const bookingResult = {
              orderId,
              bookingData,
              mainPassenger,
              passenger1: addToPassengerList ? passenger1 : null,
              paymentResult: result,
              timestamp: new Date().toISOString(),
            };
            localStorage.setItem("bookingResult", JSON.stringify(bookingResult));
            window.location.href = "/booking-success";
          },
          onPending: (result: any) => {
            toast("Pembayaran sedang diproses...");
            const pendingBooking = {
              orderId,
              bookingData,
              mainPassenger,
              passenger1: addToPassengerList ? passenger1 : null,
              paymentResult: result,
              status: "pending",
              timestamp: new Date().toISOString(),
            };
            localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
            window.location.href = "/booking-pending";
          },
          onError: (result: any) => {
            toast.error("Pembayaran gagal, silakan coba lagi");
          },
          onClose: () => {
            toast("Pembayaran dibatalkan");
          },
        });
      } else {
        toast.error("Midtrans tidak tersedia, silakan refresh halaman");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      await fetchSnapToken();
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (currentStep === 3 && !snapToken) {
      fetchSnapToken();
    }
  }, [currentStep, snapToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-700">Memuat detail pemesanan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pemesanan Tiket Kereta</h1>
          <p className="text-sm text-gray-600">Lengkapi informasi pemesanan untuk melanjutkan</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
            <Train className="w-4 h-4" />
            <span>
              {bookingData.trainName} ({bookingData.trainNumber}) - {bookingData.class}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step.id ? "bg-gray-900 text-white" : "bg-white border-2 border-gray-300 text-gray-500"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"}`}>{step.name}</span>
                </div>
                {index < steps.length - 1 && <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <>
                {/* Data Pemesan Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Data Pemesan</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <Select value={mainPassenger.title} onValueChange={(value) => handleInputChange("title", value)}>
                        <SelectTrigger className="w-full bg-gray-50 border-gray-300">
                          <SelectValue placeholder="Pilih title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tuan">Tuan</SelectItem>
                          <SelectItem value="Nyonya">Nyonya</SelectItem>
                          <SelectItem value="Nona">Nona</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                      <Input
                        type="text"
                        value={mainPassenger.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Nama sesuai NIK / Passport"
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Identitas</label>
                      <Select value={mainPassenger.identityType} onValueChange={(value) => handleInputChange("identityType", value)}>
                        <SelectTrigger className="w-full bg-gray-50 border-gray-300">
                          <SelectValue placeholder="Pilih tipe Identitas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KTP">KTP</SelectItem>
                          <SelectItem value="SIM">SIM</SelectItem>
                          <SelectItem value="Paspor">Paspor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Identitas</label>
                      <Input
                        type="text"
                        value={mainPassenger.identityNumber}
                        onChange={(e) => handleInputChange("identityNumber", e.target.value)}
                        placeholder="Nomor identitas sesuai NIK / Passport"
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        value={mainPassenger.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="me@contoh.co.id"
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                      <Input
                        type="text"
                        value={mainPassenger.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Nama Daerah"
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="addToList"
                          checked={addToPassengerList}
                          onCheckedChange={(checked) => setAddToPassengerList(checked === true)}
                        />
                        <label htmlFor="addToList" className="text-sm text-gray-700 cursor-pointer">
                          Tambahkan ke daftar penumpang
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Penumpang 1 Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Data Penumpang 1</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <Select
                        value={passenger1.title}
                        onValueChange={(value) => handlePassenger1Change("title", value)}
                      >
                        <SelectTrigger className="w-full bg-gray-50 border-gray-300">
                          <SelectValue placeholder="Pilih title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tuan">Tuan</SelectItem>
                          <SelectItem value="Nyonya">Nyonya</SelectItem>
                          <SelectItem value="Nona">Nona</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                      <Input
                        type="text"
                        value={passenger1.name}
                        onChange={(e) => handlePassenger1Change("name", e.target.value)}
                        placeholder="Nama sesuai NIK / Passport"
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Identitas</label>
                      <Select
                        value={passenger1.identityType}
                        onValueChange={(value) => handlePassenger1Change("identityType", value)}
                      >
                        <SelectTrigger className="w-full bg-gray-50 border-gray-300">
                          <SelectValue placeholder="Pilih tipe Identitas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KTP">KTP</SelectItem>
                          <SelectItem value="SIM">SIM</SelectItem>
                          <SelectItem value="Paspor">Paspor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Identitas</label>
                      <Input
                        type="text"
                        value={passenger1.identityNumber}
                        onChange={(e) => handlePassenger1Change("identityNumber", e.target.value)}
                        placeholder="Nomor identitas sesuai NIK / Passport"
                        className="bg-gray-50 border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                      className="mt-1"
                    />
                    <div>
                      <label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer block">
                        Saya menyetujui syarat dan ketentuan
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Dengan mencentang kotak ini, Anda menyetujui syarat dan ketentuan yang berlaku untuk pemesanan
                        tiket kereta api.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                    <Armchair className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Pemilihan Kursi</h2>
                </div>
                <PemilihanKursi onSeatsSelected={handleSeatsSelected} />
                {bookingData.selectedSeats.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-green-800">
                      <strong>Kursi terpilih:</strong> {bookingData.selectedSeats.join(", ")} ({bookingData.selectedSeats.length} kursi)
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Pembayaran</h2>
                {snapToken ? (
                  <div className="space-y-4">
                    <Button onClick={handlePayment} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Bayar Sekarang
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Memuat antarmuka pembayaran...</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Train className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Ringkasan Pesanan</h3>
              </div>

              <div className="text-center py-6 border-b border-gray-200">
                <div className="text-3xl font-bold text-gray-900">Rp {(bookingData.price * bookingData.passengers + 5000).toLocaleString("id-ID")}</div>
                <div className="text-sm text-gray-600 mt-1">Total pembayaran</div>
              </div>

              <div className="py-4 space-y-3 border-b border-gray-200">
                <div className="text-sm">
                  <div className="text-gray-600 mb-1">{bookingData.departureDate}</div>
                  <div className="font-semibold text-gray-900">
                    {bookingData.trainName} ({bookingData.trainNumber})
                  </div>
                  <div className="text-gray-600">{bookingData.class}</div>
                  <div className="text-gray-600">{bookingData.passengers} Dewasa</div>
                  {bookingData.selectedSeats.length > 0 && (
                    <div className="text-gray-600">Kursi: {bookingData.selectedSeats.join(", ")}</div>
                  )}
                </div>
              </div>

              <div className="py-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{bookingData.departureStation}</div>
                    <div className="text-sm text-gray-600">{bookingData.departureTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-7">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div className="text-sm text-gray-600">Durasi {bookingData.duration}</div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{bookingData.arrivalStation}</div>
                    <div className="text-sm text-gray-600">{bookingData.arrivalTime}</div>
                  </div>
                </div>
              </div>

              {currentStep === 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStep1Valid() || !agreeToTerms}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Lanjut ke Pemilihan Kursi
                </Button>
              ) : currentStep === 2 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStep2Valid()}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Lanjut Pembayaran
                </Button>
              ) : currentStep === 3 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 mt-4"
                >
                  Kembali
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}