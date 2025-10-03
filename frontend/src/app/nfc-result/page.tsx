"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Copy,
  IdCard,
  Link2,
  MapPin,
  RefreshCw,
  Rss,
  ShieldCheck,
  Smartphone,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";

type NfcData = {
  tagId?: string;
  ndefText?: string;
  tagType?: string;
  nik?: string;
  nama?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  agama?: string;
  statusPerkawinan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  berlakuHingga?: string;
  isDummy: boolean;
};

const expoGoLink = "exp://192.168.212.201:8081";

const parseParamValue = (value: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return undefined;
  return trimmed;
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const isoLike = /^\d{4}-\d{2}-\d{2}$/;
  if (isoLike.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
  }
  return value;
};

const buildAddressLine = (data: NfcData) => {
  const segments = [data.alamat, data.kelurahan, data.kecamatan]
    .filter(Boolean)
    .map((item) => item?.toUpperCase());
  return segments.length > 0 ? segments.join(", ") : undefined;
};

const displayValue = (value?: string, fallback = "Belum tersedia") =>
  value && value.trim() ? value : fallback;

const NfcResultPage = () => {
  const searchParams = useSearchParams();
  const [nfcData, setNfcData] = useState<NfcData | null>(null);

  const tagId = searchParams.get("tagId");
  const ndefText = searchParams.get("ndefText");
  const tagType = searchParams.get("tagType");
  const nik = searchParams.get("nik");
  const nama = searchParams.get("nama");
  const tempatLahir = searchParams.get("tempatLahir");
  const tanggalLahir = searchParams.get("tanggalLahir");
  const jenisKelamin = searchParams.get("jenisKelamin");
  const alamat = searchParams.get("alamat");
  const rt = searchParams.get("rt");
  const rw = searchParams.get("rw");
  const kelurahan = searchParams.get("kelurahan");
  const kecamatan = searchParams.get("kecamatan");
  const agama = searchParams.get("agama");
  const statusPerkawinan = searchParams.get("statusPerkawinan");
  const pekerjaan = searchParams.get("pekerjaan");
  const kewarganegaraan = searchParams.get("kewarganegaraan");
  const berlakuHingga = searchParams.get("berlakuHingga");
  const source = searchParams.get("source");

  useEffect(() => {
    const safeTagId = parseParamValue(tagId);
    const safeNdefText = parseParamValue(ndefText);
    const safeTagType = parseParamValue(tagType);
    const safeNik = parseParamValue(nik);
    const safeNama = parseParamValue(nama);
    const safeTempatLahir = parseParamValue(tempatLahir);
    const safeTanggalLahir = parseParamValue(tanggalLahir);
    const safeJenisKelamin = parseParamValue(jenisKelamin);
    const safeAlamat = parseParamValue(alamat);
    const safeRt = parseParamValue(rt);
    const safeRw = parseParamValue(rw);
    const safeKelurahan = parseParamValue(kelurahan);
    const safeKecamatan = parseParamValue(kecamatan);
    const safeAgama = parseParamValue(agama);
    const safeStatusPerkawinan = parseParamValue(statusPerkawinan);
    const safePekerjaan = parseParamValue(pekerjaan);
    const safeKewarganegaraan = parseParamValue(kewarganegaraan);
    const safeBerlakuHingga = parseParamValue(berlakuHingga);

    const candidate: NfcData = {
      tagId: safeTagId,
      ndefText: safeNdefText,
      tagType: safeTagType,
      nik: safeNik,
      nama: safeNama,
      tempatLahir: safeTempatLahir,
      tanggalLahir: safeTanggalLahir,
      jenisKelamin: safeJenisKelamin,
      alamat: safeAlamat,
      rt: safeRt,
      rw: safeRw,
      kelurahan: safeKelurahan,
      kecamatan: safeKecamatan,
      agama: safeAgama,
      statusPerkawinan: safeStatusPerkawinan,
      pekerjaan: safePekerjaan,
      kewarganegaraan: safeKewarganegaraan,
      berlakuHingga: safeBerlakuHingga,
      isDummy: parseParamValue(source) === "dummy-test",
    };

    if (
      candidate.tagId ||
      candidate.ndefText ||
      candidate.tagType ||
      candidate.nik ||
      candidate.nama
    ) {
      setNfcData(candidate);
    } else {
      setNfcData(null);
    }
  }, [
    tagId,
    ndefText,
    tagType,
    nik,
    nama,
    tempatLahir,
    tanggalLahir,
    jenisKelamin,
    alamat,
    rt,
    rw,
    kelurahan,
    kecamatan,
    agama,
    statusPerkawinan,
    pekerjaan,
    kewarganegaraan,
    berlakuHingga,
    source,
  ]);

  const personalFieldKeys: (keyof NfcData)[] = useMemo(
    () => [
      "nik",
      "nama",
      "tempatLahir",
      "tanggalLahir",
      "jenisKelamin",
      "alamat",
      "rt",
      "rw",
      "kelurahan",
      "kecamatan",
      "agama",
      "statusPerkawinan",
      "pekerjaan",
      "kewarganegaraan",
      "berlakuHingga",
    ],
    []
  );

  const presentCount = personalFieldKeys.reduce((count, key) => {
    if (nfcData?.[key] && nfcData[key]?.toString().trim()) {
      return count + 1;
    }
    return count;
  }, 0);

  const completionPercentage = personalFieldKeys.length
    ? Math.round((presentCount / personalFieldKeys.length) * 100)
    : 0;

  const completionMeta = (() => {
    if (completionPercentage >= 80) {
      return {
        label: "Data Lengkap",
        description: "Seluruh informasi e-KTP tersedia dan siap dipakai.",
        icon: ShieldCheck,
        badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
      } as const;
    }
    if (completionPercentage >= 40) {
      return {
        label: "Data Sebagian",
        description: "Sebagian data berhasil dibaca. Lengkapi sisanya manual.",
        icon: IdCard,
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      } as const;
    }
    return {
      label: "Data Minimal",
      description: "Baru tersedia data teknis dari tag NFC.",
      icon: AlertTriangle,
      badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    } as const;
  })();

  const CompletionIcon = completionMeta.icon;

  const handleScanAgain = () => {
    window.location.href = expoGoLink;
  };

  const copyExpoLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(expoGoLink);
        toast.success("Link Expo Go berhasil disalin");
      } else {
        throw new Error("Clipboard tidak tersedia");
      }
    } catch (error) {
      window.prompt("Salin link Expo Go secara manual:", expoGoLink);
      toast("Salin link secara manual jika pop-up tidak muncul.");
    }
  };

  const formattedTanggalLahir = formatDate(nfcData?.tanggalLahir);
  const formattedBerlakuHingga = formatDate(nfcData?.berlakuHingga);
  const addressLine = nfcData ? buildAddressLine(nfcData) : undefined;

  return (
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#003D79]/15 blur-3xl" />
        <div className="absolute top-1/3 right-[-10%] h-96 w-96 rounded-full bg-[#F15A22]/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-1/2 h-96 w-[32rem] -translate-x-1/2 rounded-full bg-[#003D79]/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-[#003D79] bg-[#003D79]/5 text-[#003D79]"
              >
                NFC Dashboard
              </Badge>
              {nfcData?.isDummy && (
                <Badge className="border-amber-200 bg-amber-100 text-amber-800">
                  Mode Testing
                </Badge>
              )}
              {nfcData && !nfcData.isDummy && (
                <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                  Live Capture
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#003D79] md:text-4xl">
              Hasil Scan e-KTP
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              {nfcData
                ? "Data NFC berhasil diterima. Periksa kembali informasi teknis dan identitas penumpang sebelum melanjutkan proses pelayanan."
                : "Belum ada data scan yang diterima. Gunakan aplikasi mobile untuk memulai pemindaian NFC e-KTP."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={copyExpoLink}
              variant="outline"
              className="border-[#003D79] bg-white text-[#003D79] hover:bg-[#003D79]/10"
            >
              <Copy className="h-4 w-4" />
              Salin Link Expo Go
            </Button>
            <Button
              onClick={handleScanAgain}
              className="bg-[#F15A22] text-white hover:bg-[#d84a1e]"
            >
              <RefreshCw className="h-4 w-4" />
              {nfcData ? "Scan NFC Lagi" : "Buka Expo Go"}
            </Button>
          </div>
        </div>

        {nfcData ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
            <div className="space-y-6">
              <Card className="border-[#003D79]/15 bg-white/90 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#003D79]">
                        Ringkasan Tag NFC
                      </CardTitle>
                      <CardDescription>
                        Data teknis dari hasil pemindaian tag e-KTP
                      </CardDescription>
                    </div>
                    <div className="rounded-full bg-[#003D79]/10 p-2">
                      <Tag className="h-5 w-5 text-[#003D79]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Tag ID
                      </p>
                      <p className="mt-1 break-all font-semibold text-[#003D79]">
                        {displayValue(nfcData.tagId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Tipe Tag
                      </p>
                      <p className="mt-1 font-semibold text-[#003D79]">
                        {displayValue(nfcData.tagType)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Payload NDEF
                    </p>
                    <div className="mt-2 rounded-lg border border-dashed border-[#003D79]/20 bg-[#003D79]/5 p-3 text-left font-mono text-xs leading-relaxed text-[#003D79]">
                      {displayValue(nfcData.ndefText, "Payload NDEF kosong")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#003D79]/15 bg-white/90 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#003D79]">
                    Identitas Penduduk
                  </CardTitle>
                  <CardDescription>
                    Data utama dari chip e-KTP yang berhasil dibaca
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {[
                      { label: "NIK", value: nfcData.nik },
                      { label: "Nama Lengkap", value: nfcData.nama },
                      {
                        label: "Tempat Lahir",
                        value: nfcData.tempatLahir,
                      },
                      {
                        label: "Tanggal Lahir",
                        value: formattedTanggalLahir ?? nfcData.tanggalLahir,
                      },
                      {
                        label: "Jenis Kelamin",
                        value: nfcData.jenisKelamin,
                      },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {field.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#003D79]">
                          {displayValue(field.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#003D79]/15 bg-white/90 shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#003D79]">
                        Informasi Kependudukan
                      </CardTitle>
                      <CardDescription>
                        Lengkapi data alamat dan status kependudukan penumpang
                      </CardDescription>
                    </div>
                    <div className="rounded-full bg-[#F15A22]/10 p-2">
                      <MapPin className="h-5 w-5 text-[#F15A22]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-dashed border-[#003D79]/15 bg-[#003D79]/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#003D79]/80">
                      Alamat Domisili
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#003D79]">
                      {displayValue(addressLine ?? nfcData.alamat)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      RT/RW: {displayValue(nfcData.rt, "-")}/{displayValue(nfcData.rw, "-")}
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: "Kelurahan/Desa", value: nfcData.kelurahan },
                      { label: "Kecamatan", value: nfcData.kecamatan },
                      { label: "Agama", value: nfcData.agama },
                      {
                        label: "Status Perkawinan",
                        value: nfcData.statusPerkawinan,
                      },
                      { label: "Pekerjaan", value: nfcData.pekerjaan },
                      {
                        label: "Kewarganegaraan",
                        value: nfcData.kewarganegaraan,
                      },
                      {
                        label: "Berlaku Hingga",
                        value: formattedBerlakuHingga ?? nfcData.berlakuHingga,
                      },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {field.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#003D79]">
                          {displayValue(field.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-transparent bg-gradient-to-br from-[#003D79] via-[#0c4d8a] to-[#0d4070] text-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Status Kelengkapan Data
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Ringkasan kualitas data yang berhasil dipindai
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`w-fit rounded-md border px-2 py-1 text-xs font-medium ${completionMeta.badgeClass}`}>
                        {completionMeta.label}
                      </div>
                      <p className="mt-3 text-sm text-white/80">
                        {completionMeta.description}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/15 p-3">
                      <CompletionIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>Kelengkapan data e-KTP</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="bg-white/20 [&_[data-slot=progress-indicator]]:bg-white" />
                    <p className="text-xs text-white/60">
                      {presentCount} dari {personalFieldKeys.length} data identitas terisi otomatis.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#003D79]/15 bg-white/90 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#003D79]">
                    Langkah Setelah Pemindaian
                  </CardTitle>
                  <CardDescription>
                    Rekomendasi tindakan lanjutan untuk petugas lapangan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#003D79]/10 p-2">
                      <Smartphone className="h-4 w-4 text-[#003D79]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Validasi Visual</p>
                      <p>Cocokkan data digital dengan tampilan fisik e-KTP penumpang.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#003D79]/10 p-2">
                      <ShieldCheck className="h-4 w-4 text-[#003D79]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Catat Perubahan</p>
                      <p>Jika ada ketidaksesuaian, lengkapi secara manual di sistem pelayanan.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#003D79]/10 p-2">
                      <Link2 className="h-4 w-4 text-[#003D79]" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Sinkronisasi Data</p>
                      <p>Kirimkan data yang telah diverifikasi ke dashboard pusat melalui integrasi API.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#003D79]/15 bg-white/90 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-[#003D79]">
                    Link Integrasi Expo Go
                  </CardTitle>
                  <CardDescription>
                    Gunakan perangkat mobile untuk melakukan pemindaian berikutnya
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-dashed border-[#003D79]/20 bg-[#003D79]/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#003D79]/70">
                      Expo Go Deep Link
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-[#003D79]">
                      {expoGoLink}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={copyExpoLink}
                      variant="outline"
                      className="border-[#003D79] bg-white text-[#003D79] hover:bg-[#003D79]/10"
                    >
                      <Copy className="h-4 w-4" /> Salin Link
                    </Button>
                    <Button
                      onClick={handleScanAgain}
                      className="bg-[#003D79] text-white hover:bg-[#0b4c87]"
                    >
                      <RefreshCw className="h-4 w-4" /> Buka di Expo Go
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="mt-12 border-2 border-dashed border-[#003D79]/20 bg-white/90 text-center shadow-md">
            <CardContent className="flex flex-col items-center gap-5 py-16">
              <div className="rounded-full bg-[#003D79]/10 p-6">
                <Rss className="h-10 w-10 text-[#003D79]" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-[#003D79]">
                  Belum Ada Data NFC
                </h2>
                <p className="max-w-xl text-base text-muted-foreground">
                  Hubungkan perangkat mobile, buka aplikasi Expo Go, dan lakukan pemindaian NFC e-KTP untuk menampilkan dashboard hasil secara otomatis.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={handleScanAgain}
                  className="bg-[#F15A22] text-white hover:bg-[#d84a1e]"
                >
                  <RefreshCw className="h-4 w-4" /> Mulai Scan di Expo Go
                </Button>
                <Button
                  onClick={copyExpoLink}
                  variant="outline"
                  className="border-[#003D79] bg-white text-[#003D79] hover:bg-[#003D79]/10"
                >
                  <Copy className="h-4 w-4" /> Salin Link Integrasi
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Pastikan perangkat Android Anda memiliki NFC aktif dan terhubung ke jaringan yang sama.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NfcResultPage;
