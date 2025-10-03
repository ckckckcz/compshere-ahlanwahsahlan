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
  email: string;
  nomor_telefon: string;
  nik?: string;
  id?: number;
  gender?: string;
}

interface FamilyMember {
  id: number;
  name: string;
  nik: string;
  id_user: number;
  gender: string;
  created_at: string;
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
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
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
    email: "",
    nomor_telefon: "",
  });

  const [passenger1, setPassenger1] = useState<PassengerData>({
    title: "",
    name: "",
    identityType: "",
    email: "",
    nomor_telefon: "",
  });

  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<number[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const steps = [
    { id: 1, name: "Data Pemesan & Penumpang" },
    { id: 2, name: "Pemilihan Kursi" },
    { id: 3, name: "Pembayaran" },
  ];

  const fetchUserData = async (userId: number) => {
    if (!userId) return;

    setIsLoadingUserData(true);
    try {
      console.log("Fetching user data for ID:", userId);
      const response = await fetch(`https://coherent-classic-platypus.ngrok-free.app/get/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });


      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }

      const text = await response.text(); 
      console.log("Response text:", text.substring(0, 100)); 
      if (!text || text.trim() === "") {
        console.error("Empty response received from server");
        toast.error("Server mengembalikan data kosong");
        return;
      }
      const defaultUserData = {
        title: "",
        nama_keluarga: "User Name",
        identity_type: "",
        identity_number: "",
        email: "",
        nomor_telefon: "",
        telephone: "",
      };

      let userData;
      try {
        
        if (text.trim().startsWith("<")) {
          console.error("Received HTML instead of JSON");
          toast.error("Server mengembalikan HTML bukan JSON");

          setMainPassenger({
            title: defaultUserData.title,
            name: defaultUserData.nama_keluarga,
            identityType: defaultUserData.identity_type,
            email: defaultUserData.email,
            nomor_telefon: defaultUserData.telephone || defaultUserData.nomor_telefon,
          });
        } else {
          userData = JSON.parse(text);

          if (userData && userData.data) {
            const user = userData.data;
            console.log("Successfully parsed user data:", user);

            setMainPassenger({
              title: user.title || "",
              name: user.nama_keluarga || "",
              identityType: user.identity_type || "",
              email: user.email || "",
              nomor_telefon: user.telephone || user.nomor_telefon || "",
            });

            toast.success("Data pengguna berhasil dimuat");
          } else {
            console.error("Invalid response structure:", userData);
            toast.error("Struktur data tidak valid");


            setMainPassenger({
              title: defaultUserData.title,
              name: defaultUserData.nama_keluarga,
              identityType: defaultUserData.identity_type,
              email: defaultUserData.email,
              nomor_telefon: defaultUserData.telephone || defaultUserData.nomor_telefon,
            });
          }
        }
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError, "Response was:", text);
        toast.error("Format data tidak valid");
        setMainPassenger({
          title: defaultUserData.title,
          name: defaultUserData.nama_keluarga,
          identityType: defaultUserData.identity_type,
          email: defaultUserData.email,
          nomor_telefon: defaultUserData.telephone || defaultUserData.nomor_telefon,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(`Gagal memuat data pengguna: ${error instanceof Error ? error.message : "Unknown error"}`);

      // Don't block the booking process - continue with empty fields
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const fetchFamilyMembers = async (userId: number) => {
    if (!userId) return;

    setIsLoadingFamily(true);
    try {
      const response = await fetch(`https://coherent-classic-platypus.ngrok-free.app/api/get/family/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch family members: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      
    
      if (!text || text.trim() === "" || text.trim().startsWith("<")) {
        console.error("Invalid response format when fetching family members");
        toast.error("Format data keluarga tidak valid");
        return;
      }

      try {
        const result = JSON.parse(text);
        if (result && result.data && Array.isArray(result.data)) {
          setFamilyMembers(result.data);
          console.log("Family members loaded:", result.data);
        } else {
          console.error("Invalid family data structure:", result);
          toast.error("Struktur data keluarga tidak valid");
        }
      } catch (parseError) {
        console.error("Failed to parse family JSON:", parseError);
        toast.error("Format data keluarga tidak valid");
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast.error(`Gagal memuat data keluarga: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoadingFamily(false);
    }
  };

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

      // Use actual passenger count from URL parameters instead of hardcoded value
      const passengerCount = Number.parseInt(passengers || "1");
      
      console.log(`Setting passenger count to: ${passengerCount}`);

      if (ticketId && trainName && trainNumber && ticketClass && origin && destination) {
        setBookingData((prev) => ({
          ...prev,
          ticketId: ticketId,
          trainName: trainName,
          trainNumber: trainNumber,
          class: ticketClass,
          passengers: passengerCount,
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

        if (id_user) {
          fetchUserData(Number.parseInt(id_user));
          fetchFamilyMembers(Number.parseInt(id_user));
        }
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
    return mainPassenger.name && mainPassenger.email && mainPassenger.nomor_telefon;
  };

  const isStep2Valid = () => {
    // For seats, make sure we have exactly the number of seats as passengers (including the main passenger)
    const requiredSeats = bookingData.passengers;
    return bookingData.selectedSeats.length === requiredSeats;
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

      console.log("Sending transaction data:", transactionData);

      const response = await fetch("https://coherent-classic-platypus.ngrok-free.app/api/create/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(transactionData),
      });

      console.log("Transaction response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch Snap token: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      console.log("Transaction response text:", text.substring(0, 100));
      if (!text || text.trim() === "") {
        console.error("Empty response received from server");
        toast.error("Server mengembalikan data kosong");
        return;
      }

      if (text.trim().startsWith("<")) {
        console.error("Received HTML instead of JSON for transaction");
        toast.error("Server mengembalikan HTML bukan JSON");
        return;
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError, "Response was:", text);
        toast.error("Format data pembayaran tidak valid");
        return;
      }

      if (result.status === "success" && result.data) {
        console.log("Successfully received snap token");
        setSnapToken(result.data);
        setBookingData((prev) => ({ ...prev, snapToken: result.data }));
        toast.success("Snap token berhasil digenerate!");
      } else {
        console.error("Invalid transaction response structure:", result);
        throw new Error("Gagal mendapatkan Snap token dari backend");
      }
    } catch (error) {
      console.error("Error fetching snap token:", error);
      toast.error(`Gagal mendapatkan Snap token: ${error instanceof Error ? error.message : "Unknown error"}`);
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

  const handleFamilyMemberSelect = (memberId: number) => {
    console.log(`Toggling family member ${memberId}`);
    setSelectedFamilyMembers(prev => {
      if (prev.includes(memberId)) {
        console.log(`Removing member ${memberId}`);
        return prev.filter(id => id !== memberId);
      } else {
        console.log(`Adding member ${memberId}`);
        return [...prev, memberId];
      }
    });
  };

  // Update this function to ensure it sets the right number of passengers
  useEffect(() => {
    // Update the passenger count based on selected family members + main passenger
    const totalPassengers = 1 + selectedFamilyMembers.length; // 1 for main passenger
    
    setBookingData(prev => ({
      ...prev,
      passengers: totalPassengers
    }));
  }, [selectedFamilyMembers]);

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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= step.id ? "bg-gray-900 text-white" : "bg-white border-2 border-gray-300 text-gray-500"}`}>{step.id}</div>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Data Pemesan</h2>
                    {isLoadingUserData && (
                      <span className="ml-2 text-xs text-gray-500 italic flex items-center">
                        <div className="w-3 h-3 border-t-2 border-blue-500 border-r-2 rounded-full animate-spin mr-1"></div>
                        Memuat data...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Keluarga</label>
                      <Input type="text" value={mainPassenger.name} onChange={(e) => handleInputChange("name", e.target.value)} className="bg-gray-50 border-gray-300" disabled={isLoadingUserData} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input type="email" value={mainPassenger.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Masukkan email" className="bg-gray-50 border-gray-300" disabled={isLoadingUserData} />
                    </div>
                  </div>
                  <div className="gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telephone</label>
                      <Input
                        type="tel"
                        value={mainPassenger.nomor_telefon}
                        onChange={(e) => handleInputChange("nomor_telefon", e.target.value)}
                        placeholder="Nomor telepon"
                        className="bg-gray-50 border-gray-300"
                        disabled={isLoadingUserData}
                      />
                    </div>
                  </div>
                </div>

                {/* Data Penumpang Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Data Penumpang</h2>
                    {isLoadingFamily && (
                      <span className="ml-2 text-xs text-gray-500 italic flex items-center">
                        <div className="w-3 h-3 border-t-2 border-blue-500 border-r-2 rounded-full animate-spin mr-1"></div>
                        Memuat data keluarga...
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Anggota Keluarga</label>
                    {familyMembers.length > 0 ? (
                      <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                        <p className="text-sm text-gray-600 mb-3">
                          {selectedFamilyMembers.length} dari {Math.min(bookingData.passengers - 1, familyMembers.length)} anggota keluarga terpilih
                        </p>
                        
                        <div className="space-y-2">
                          {familyMembers.map(member => (
                            <div key={member.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                                 onClick={() => handleFamilyMemberSelect(member.id)}>
                              <div className={`w-4 h-4 border ${selectedFamilyMembers.includes(member.id) 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'} rounded flex items-center justify-center mr-2`}>
                                {selectedFamilyMembers.includes(member.id) && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                {member.name} ({member.gender})
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 border border-gray-200 rounded-md">
                        {isLoadingFamily ? (
                          "Sedang memuat data anggota keluarga..."
                        ) : (
                          "Tidak ada anggota keluarga yang terdaftar. Silakan tambahkan anggota keluarga di profil Anda."
                        )}
                      </div>
                    )}
                  </div>

                  {selectedFamilyMembers.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-md font-medium text-gray-800">Detail Penumpang Terpilih</h3>
                      
                      {selectedFamilyMembers.map(memberId => {
                        const member = familyMembers.find(m => m.id === memberId);
                        if (!member) return null;
                        
                        return (
                          <div key={member.id} className="border border-gray-200 rounded-md p-4 bg-blue-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{member.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">NIK: {member.nik}</p>
                                <p className="text-sm text-gray-600">Jenis Kelamin: {member.gender}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleFamilyMemberSelect(member.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                Hapus
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Remove the message about remaining seats if any */}
                </div>

                {/* Terms Checkbox */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={agreeToTerms} 
                      onCheckedChange={(checked) => {
                        if (checked === true || checked === false) {
                          setAgreeToTerms(checked);
                        }
                      }} 
                      className="mt-1" 
                    />
                    <div>
                      <label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer block">
                        Saya menyetujui syarat dan ketentuan
                      </label>
                      <p className="text-xs text-gray-600 mt-1">Dengan mencentang kotak ini, Anda menyetujui syarat dan ketentuan yang berlaku untuk pemesanan tiket kereta api.</p>
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
                <div className="text-sm text-gray-600 mb-4">
                  Silakan pilih {bookingData.passengers} kursi sesuai dengan jumlah penumpang yang akan bepergian.
                </div>
                <PemilihanKursi 
                  onSeatsSelected={handleSeatsSelected}
                  maxSeats={bookingData.passengers} // Pass the actual passenger count
                />
                {bookingData.selectedSeats.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-green-800">
                      <strong>Kursi terpilih:</strong> {bookingData.selectedSeats.join(", ")} ({bookingData.selectedSeats.length} dari {bookingData.passengers} kursi)
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
                  {bookingData.selectedSeats.length > 0 && <div className="text-gray-600">Kursi: {bookingData.selectedSeats.join(", ")}</div>}
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Lanjut ke Pemilihan Kursi
                </Button>
              ) : currentStep === 2 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!isStep2Valid()} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {bookingData.selectedSeats.length === bookingData.passengers 
                    ? "Lanjut ke Pembayaran" 
                    : `Pilih ${bookingData.passengers - bookingData.selectedSeats.length} kursi lagi`}
                </Button>
              ) : (
                currentStep === 3 && (
                  <Button onClick={handleBack} variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 mt-4">
                    Kembali
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}