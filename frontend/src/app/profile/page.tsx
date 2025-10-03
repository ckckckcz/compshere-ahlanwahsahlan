"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSummary } from "@/components/widget/Profile/profile-summary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoCard } from "@/components/widget/Profile/info-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, FileText, Users, User, Scan, CheckCircle2, Camera, CameraOff, RefreshCw, Pencil, Save, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  phone: string;
}

interface KtpData {
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  alamat: string;
  rtRw: string;
  kelDesa: string;
  kecamatan: string;
  statusPerkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
}

interface FamilyMember {
  id: number;
  name: string;
  nik: string;
  id_user: number;
  created_at: string;
  gender: string;
}

interface KkData {
  nomorKK: string;
  namaKepalaKeluarga: string;
  alamat: string;
  rtRw: string;
  kelDesa: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  anggotaKeluarga: FamilyMember[];
}

interface InfoItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface InfoCardProps {
  title: string;
  items: InfoItem[];
  className?: string;
  icon?: React.ReactNode;
}

type OCRType = "ktp" | "kk";

export default function ProfilePage({ title = "Personal Information", items = [] }: { title?: string; items?: { label: string; value: string }[] }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOCR, setSelectedOCR] = useState<OCRType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ktpData, setKtpData] = useState<any>(null);
  const [kkData, setKkData] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment"); // Default to rear camera
  const [familyData, setFamilyData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedKtpData, setEditedKtpData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resetOCR = () => {
    setSelectedOCR(null);
    setKtpData(null);
    setKkData(null);
  };

  const fetchFamily = async () => {
    if (!userData?.id) return;

    try {
      // Use correct endpoint with appropriate headers
      const res = await fetch(`https://coherent-classic-platypus.ngrok-free.app/api/get/family/${userData.id}`, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch family data");

      const data = await res.json();
      console.log("Family data response:", data);

      if (data && Array.isArray(data.data)) {
        setFamilyData(data.data);
      } else if (data && Array.isArray(data)) {
        setFamilyData(data);
      } else {
        console.error("Unexpected family data format:", data);
        setFamilyData([]);
      }
    } catch (err) {
      console.error("Error fetching family:", err);
      setFamilyData([]);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (typeof window === "undefined") {
          setError("Not in browser environment");
          return;
        }

        const sessionData = localStorage.getItem("session_id");
        console.log("Raw session data from localStorage:", sessionData);

        if (!sessionData) {
          setError("No session found");
          return;
        }
        let userId = sessionData.replace("user_", "");

        console.log("Session data:", sessionData);
        console.log("Extracted user ID:", userId);

        if (!userId) {
          setError("Invalid session data");
          return;
        }

        const apiUrl = `https://coherent-classic-platypus.ngrok-free.app/get/user/${userId}`;
        console.log("Fetching from URL:", apiUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Accept: "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log("Response status:", response.status);
          console.log("Response headers:", Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);

            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: errorText };
            }

            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          console.log("API Response:", result);

          if (!result || !result.data) {
            console.error("Invalid response structure:", result);
            throw new Error("Invalid response format from API");
          }

          const data = result.data;
          console.log("User data from API:", data);

          const transformedData: UserData = {
            id: data.id || "",
            avatar: data.foto,
            name: data.nama_keluarga || "Unknown User",
            email: data.email || "",
            phone: data.phone || "Not provided",
          };

          console.log("Transformed data:", transformedData);
          setUserData(transformedData);
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (typeof fetchError === "object" && fetchError !== null && "name" in fetchError && (fetchError as { name?: string }).name === "AbortError") {
            throw new Error("Request timeout - please check your internet connection");
          }
          if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
            throw new Error("Network error - unable to connect to server. Please check if the server is running.");
          }

          throw fetchError;
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        let errorMessage = "An error occurred";
        if (err instanceof Error) {
          errorMessage = err.message;
        }

        if (errorMessage.includes("NetworkError") || errorMessage.includes("fetch")) {
          errorMessage += "\n\nPossible solutions:\n1. Check if the backend server is running\n2. Verify the ngrok URL is correct\n3. Check your internet connection";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData?.id) {
      fetchFamily();
    }
  }, [userData]);

  // Request camera permissions explicitly
  const requestCameraPermission = async () => {
    try {
      // Check if the Permissions API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const permissionResult = await navigator.permissions.query({ name: "camera" as PermissionName });

        if (permissionResult.state === "denied") {
          setCameraError("Akses kamera ditolak. Mohon izinkan kamera di pengaturan browser Anda.");
          return false;
        }

        // If permission is already granted or prompt will be shown
        return true;
      }

      // If Permissions API is not supported, proceed with direct access
      console.log("Permission API not supported, will try direct access");
      return true;
    } catch (error) {
      console.log("Error checking camera permissions:", error);
      return true; // Proceed with direct access attempt if Permissions API fails
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsProcessing(true); // Show loading state while initializing camera

    // First check/request permission
    const permissionGranted = await requestCameraPermission();
    if (!permissionGranted) {
      setIsProcessing(false);
      return;
    }

    try {
      // Close any existing stream first
      stopCamera();

      // Try to get the camera stream with high resolution
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 }, // Target 1280x720 for main camera (1x)
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err) {
        console.warn("High resolution camera failed, falling back to default constraints");
        // Fallback to default camera if high resolution fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);

      // Provide more specific error messages
      if (err instanceof DOMException) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("Kamera tidak ditemukan. Periksa apakah perangkat Anda memiliki kamera.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError(
            "Akses kamera ditolak. Pastikan Anda mengizinkan akses kamera ketika diminta.\n\n" +
              "Cara memperbaiki:\n" +
              "1. Buka Pengaturan > [Nama Browser] > Izinkan Kamera\n" +
              "2. Ketuk ikon Kunci di URL, lalu izinkan akses kamera\n" +
              "3. Hapus data situs web dan muat ulang halaman"
          );
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setCameraError("Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain dan coba lagi.");
        } else {
          setCameraError(`Gagal mengakses kamera: ${err.message}`);
        }
      } else {
        setCameraError("Terjadi kesalahan saat mengakses kamera. Periksa izin kamera Anda.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle between front and rear camera
  const switchCamera = async () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));

    // If camera is active, restart it with the new facing mode
    if (isCameraActive) {
      await startCamera();
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setCameraError(null);
  };

  // Capture image from video feed
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedOCR) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setIsProcessing(true);

      try {
        const formData = new FormData();
        // Create a file-like object from the Blob
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        formData.append("file", file);

        const res = await fetch(`https://coherent-classic-platypus.ngrok-free.app/api/send/${selectedOCR}`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload gagal");

        const responseJson = await res.json();
        console.log("API OCR Response:", responseJson);

        // Check if the response has a data property (as shown in your screenshot)
        const data = responseJson.data || responseJson;

        // Save OCR results to state
        if (selectedOCR === "ktp") {
          // Extract only name, nik, and gender from the response
          const simplifiedData = {
            nama: data.name || data.nama || "Nama tidak tersedia",
            nik: data.nik || data.NIK || "NIK tidak tersedia",
            jenisKelamin: data.gender || data.jenisKelamin || "Jenis kelamin tidak tersedia"
          };
          console.log("Processed KTP data:", simplifiedData);
          setKtpData(simplifiedData);
        } else {
          setKkData(data);
        }
      } catch (err) {
        console.error("Error processing document:", err);
        alert("Gagal memproses dokumen");
      } finally {
        setIsProcessing(false);
      }
    }, "image/jpeg");
  };

  // Update editedKtpData when ktpData changes
  useEffect(() => {
    if (ktpData) {
      setEditedKtpData({ ...ktpData });
    }
  }, [ktpData]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset edited data to original if canceling edit
    if (isEditing) {
      setEditedKtpData({ ...ktpData });
    }
  };

  const handleSaveData = () => {
    // Update the main KTP data with edited values
    setKtpData({ ...editedKtpData });
    setIsEditing(false);
    setShowConfirmModal(true);
  };

  const handleConfirmData = () => {
    setDataConfirmed(true);
    setShowConfirmModal(false);
  };

  const handleInputChange = (field: string, value: string) => {
    interface EditedKtpData {
      nik?: string;
      nama?: string;
      jenisKelamin?: string;
    }

    const handleInputChange = (field: keyof EditedKtpData, value: string) => {
      setEditedKtpData((prev: EditedKtpData | null) => ({
        ...prev,
        [field]: value
      }));
    };
  };

  const handleAddFamilyMember = () => {
    // TODO: Implement functionality to add family member
    alert("Tambah anggota keluarga akan diimplementasikan");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is jpg or png
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert("Mohon unggah file JPG atau PNG saja");
      return;
    }

    setSelectedFile(file);
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedOCR) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`https://coherent-classic-platypus.ngrok-free.app/api/send/${selectedOCR}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload gagal");

      const responseJson = await res.json();
      console.log("API OCR Response:", responseJson);

      const data = responseJson.data || responseJson;

      // Save OCR results to state
      if (selectedOCR === "ktp") {
        const simplifiedData = {
          nama: data.name || data.nama || "Nama tidak tersedia",
          nik: data.nik || data.NIK || "NIK tidak tersedia",
          jenisKelamin: data.gender || data.jenisKelamin || "Jenis kelamin tidak tersedia"
        };
        console.log("Processed KTP data:", simplifiedData);
        setKtpData(simplifiedData);
      } else {
        setKkData(data);
      }
    } catch (err) {
      console.error("Error processing document:", err);
      alert("Gagal memproses dokumen");
    } finally {
      setIsProcessing(false);
      // Clear the file selection
      setSelectedFile(null);
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearFileSelection = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div>Loading...</div>
      </main>
    );
  }

  if (error || !userData) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div>Error: {error || "No user data found"}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 md:p-6 space-y-4 md:space-y-6">
      <img src="/images/user-profile-reference.png" alt="Reference design for staff profile" className="sr-only" />

      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            <TabsTrigger value="profile">User Personal</TabsTrigger>
            <TabsTrigger value="familyData">Family Data</TabsTrigger>
            <TabsTrigger value="history">Riwayat Pemesanan</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="profile" className="space-y-4 md:space-y-6">
          <ProfileSummary userData={userData} />
          <Card className="rounded-2xl shadow-md border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">👪 Daftar Keluarga</CardTitle>
            </CardHeader>
            <CardContent>
              {familyData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyData.map((fam, idx) => (
                    <div key={idx} className="flex flex-col p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition">
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        {fam.name}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        {fam.nik || "No NIK"} • {fam.gender || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-gray-500 text-sm italic text-center">No family data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="familyData" className="space-y-6">
          {!ktpData && !kkData ? (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📄 Pilih Jenis Dokumen</CardTitle>
                <CardDescription>Pilih jenis dokumen yang ingin Anda scan dengan OCR</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={selectedOCR || ""} onValueChange={(value) => setSelectedOCR(value as OCRType)}>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <RadioGroupItem value="ktp" id="ktp" />
                    <Label htmlFor="ktp" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold">KTP (Kartu Tanda Penduduk)</div>
                          <div className="text-sm text-muted-foreground">Scan identitas pribadi</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <hr />
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <RadioGroupItem value="kk" id="kk" />
                    <Label htmlFor="kk" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-semibold">KK (Kartu Keluarga)</div>
                          <div className="text-sm text-muted-foreground">Scan data seluruh keluarga lengkap</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {selectedOCR && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="flex flex-col items-center justify-center p-4 sm:p-8 border-2 rounded-lg bg-muted/50">
                      {!isCameraActive ? <Camera className="h-12 w-12 text-muted-foreground mb-4" /> : <CameraOff className="h-12 w-12 text-muted-foreground mb-4" />}

                      {cameraError && (
                        <Alert variant="destructive" className="mb-4 max-w-md mx-auto">
                          <AlertDescription>{cameraError}</AlertDescription>
                        </Alert>
                      )}

                      {isProcessing && !isCameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      <div className="relative w-full max-w-md aspect-[4/3]">
                        <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover rounded-lg ${!isCameraActive ? "hidden" : ""}`} />
                        <canvas ref={canvasRef} className="hidden" />

                        {!isCameraActive && !isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg">
                            <Button variant="outline" onClick={startCamera} className="gap-2">
                              <Camera className="h-4 w-4" />
                              Aktifkan Kamera
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {isCameraActive && (
                          <>
                            <Button disabled={isProcessing} onClick={captureImage} className="gap-2">
                              {isProcessing ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Memproses...
                                </>
                              ) : (
                                <>
                                  <Camera className="h-4 w-4" />
                                  Ambil Foto
                                </>
                              )}
                            </Button>
                            <Button variant="outline" onClick={stopCamera} className="gap-2">
                              <CameraOff className="h-4 w-4" />
                              Matikan Kamera
                            </Button>
                            <Button variant="secondary" onClick={switchCamera} className="gap-2">
                              <RefreshCw className="h-4 w-4" />
                              Ganti Kamera {facingMode === "user" ? "Belakang" : "Depan"}
                            </Button>
                          </>
                        )}

                        {!isCameraActive && cameraError && (
                          <Button onClick={startCamera} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Coba Lagi
                          </Button>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 text-center">{isCameraActive ? "Posisikan dokumen dengan jelas dalam bingkai kamera" : "Izinkan akses kamera untuk memindai dokumen"}</p>
                    </div>

                    {/* Add file upload option */}
                    <Separator className="my-4" />
                    
                    <div className="w-full max-w-md">
                      <h3 className="text-lg font-medium mb-2">Atau unggah gambar</h3>
                      
                      <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="document-upload">Pilih File (JPG atau PNG)</Label>
                          <Input 
                            ref={fileInputRef}
                            id="document-upload" 
                            type="file" 
                            accept="image/jpeg,image/png"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                          />
                          <p className="text-sm text-muted-foreground">Maksimal ukuran file 5MB</p>
                        </div>
                        
                        {filePreviewUrl && (
                          <div className="relative">
                            <div className="relative w-full max-w-md aspect-[4/3] border rounded-lg overflow-hidden">
                              <img 
                                src={filePreviewUrl} 
                                alt="Preview" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="absolute top-2 right-2"
                              onClick={clearFileSelection}
                            >
                              <CameraOff className="h-4 w-4 mr-1" /> Hapus
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex justify-start">
                          <Button 
                            disabled={!selectedFile || isProcessing} 
                            onClick={handleFileUpload}
                            className="gap-2 w-full md:w-auto"
                          >
                            {isProcessing ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Unggah & Proses Dokumen
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 mt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h2 className="text-2xl font-bold">Hasil OCR</h2>
                </div>
                <Button variant="outline" onClick={resetOCR}>
                  Scan Dokumen Baru
                </Button>
              </div>

              {ktpData && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Data KTP
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">KTP</Badge>
                        {!dataConfirmed && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={isEditing ? handleSaveData : handleEditToggle}
                            className="h-8 gap-1"
                          >
                            {isEditing ? (
                              <>
                                <Save className="h-4 w-4" />
                                Simpan
                              </>
                            ) : (
                              <>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">NIK</Label>
                        {isEditing && !dataConfirmed ? (
                          <Input 
                            value={editedKtpData?.nik || ''}
                            onChange={(e) => handleInputChange('nik', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{ktpData.nik}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Nama</Label>
                        {isEditing && !dataConfirmed ? (
                          <Input 
                            value={editedKtpData?.nama || ''}
                            onChange={(e) => handleInputChange('nama', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{ktpData.nama}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Jenis Kelamin</Label>
                        {isEditing && !dataConfirmed ? (
                          <Select 
                            value={editedKtpData?.jenisKelamin || ''}
                            onValueChange={(value) => handleInputChange('jenisKelamin', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LAKI-LAKI">Laki-laki</SelectItem>
                              <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-semibold">{ktpData.jenisKelamin}</p>
                        )}
                      </div>
                      
                      {/* Button Tambah Anggota Keluarga always visible */}
                      <Button 
                        onClick={handleAddFamilyMember}
                        className="mt-4 w-full md:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Anggota Keluarga
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Confirmation Modal */}
              <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Data</DialogTitle>
                    <DialogDescription>
                      Apakah data yang Anda masukkan sudah benar?
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">NIK</Label>
                      <div className="col-span-3">{editedKtpData?.nik}</div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Nama</Label>
                      <div className="col-span-3">{editedKtpData?.nama}</div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Jenis Kelamin</Label>
                      <div className="col-span-3">{editedKtpData?.jenisKelamin}</div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                      Edit Kembali
                    </Button>
                    <Button onClick={handleConfirmData}>
                      Data Sudah Benar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {kkData && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Data Kartu Keluarga
                        </CardTitle>
                        <Badge variant="secondary">KK</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Nomor KK</Label>
                          <p className="font-semibold">{kkData.nomorKK}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Kepala Keluarga</Label>
                          <p className="font-semibold">{kkData.namaKepalaKeluarga}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-muted-foreground">Alamat</Label>
                          <p className="font-semibold">{kkData.alamat}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">RT/RW</Label>
                          <p className="font-semibold">{kkData.rtRw}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Kel/Desa</Label>
                          <p className="font-semibold">{kkData.kelDesa}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Kecamatan</Label>
                          <p className="font-semibold">{kkData.kecamatan}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Kabupaten/Kota</Label>
                          <p className="font-semibold">{kkData.kabupatenKota}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Provinsi</Label>
                          <p className="font-semibold">{kkData.provinsi}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Anggota Keluarga</CardTitle>
                      <CardDescription>Total {kkData.anggotaKeluarga.length} anggota keluarga</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {kkData.anggotaKeluarga.map(
                        (
                          anggota: {
                            nik: string;
                            nama: string;
                            statusHubungan: string;
                            jenisKelamin: string;
                            tempatLahir: string;
                            tanggalLahir: string;
                            agama: string;
                            pendidikan: string;
                            pekerjaan: string;
                            statusPerkawinan: string;
                          },
                          index: number
                        ) => (
                          <Card key={index} className="bg-muted/50">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{anggota.nama}</h3>
                                  <Badge variant="outline" className="mt-1">
                                    {anggota.statusHubungan}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <Label className="text-muted-foreground">NIK</Label>
                                  <p className="font-medium">{anggota.nik}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Jenis Kelamin</Label>
                                  <p className="font-medium">{anggota.jenisKelamin}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Tempat Lahir</Label>
                                  <p className="font-medium">{anggota.tempatLahir}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Tanggal Lahir</Label>
                                  <p className="font-medium">{anggota.tanggalLahir}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Agama</Label>
                                  <p className="font-medium">{anggota.agama}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Pendidikan</Label>
                                  <p className="font-medium">{anggota.pendidikan}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Pekerjaan</Label>
                                  <p className="font-medium">{anggota.pekerjaan}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Status Perkawinan</Label>
                                  <p className="font-medium">{anggota.statusPerkawinan}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Placeholder title="Timesheet & Attendance" />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Placeholder({ title }: { title: string }) {
  return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">{title} content goes here.</div>;
}

