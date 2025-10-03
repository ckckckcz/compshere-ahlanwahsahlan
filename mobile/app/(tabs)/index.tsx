// ScanScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking
} from "react-native";

export default function ScanScreen() {
  const [uid, setUid] = useState("");
  const [nama, setNama] = useState("");
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");

  // Ganti dengan server kamu (ngrok / domain)
  const BASE_URL = "https://ca7f82ca1ba3.ngrok-free.app";

  // Open NFC Tools PRO to scan. Callback placeholders exactly as in wakdev doc.
  const handleNfcToolsScan = async () => {
    try {
      const callback = `${BASE_URL}/api/callback?tagid={TAG-ID}&text={NDEF-TEXT}`;
      const encoded = encodeURIComponent(callback);
      const url = `nfc://scan/?callback=${encoded}`;

      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Error", "Perangkat tidak mendukung URI ini atau NFC Tools tidak terpasang.");
        return;
      }

      await Linking.openURL(url);
      Alert.alert("Info", "NFC Tools PRO terbuka. Silakan scan tag.");
    } catch (err) {
      console.error("handleNfcToolsScan:", err);
      Alert.alert("Error", "Gagal membuka NFC Tools PRO");
    }
  };

  // Fetch users and set last UID
  const fetchLastUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users`);
      if (!res.ok) throw new Error("Gagal ambil users");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const last = data[data.length - 1];
        setUid(last.uid || "");
        setNama(last.nama || "");
        setMessage(`UID terakhir: ${last.uid}`);
        Alert.alert("Sukses", `UID terakhir: ${last.uid}`);
      } else {
        Alert.alert("Info", "Belum ada data UID");
      }
    } catch (err) {
      console.error("fetchLastUser:", err);
      Alert.alert("Error", "Gagal ambil UID terakhir");
    }
  };

  // Register UID manually (or after editing name)
  const registerUID = async () => {
    if (!uid || !nama) {
      Alert.alert("Error", "UID dan Nama harus diisi");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, nama }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Sukses", "UID berhasil terdaftar");
      } else {
        Alert.alert("Info", data.message || "Tidak berhasil");
      }
    } catch (err) {
      console.error("registerUID:", err);
      Alert.alert("Error", "Gagal mendaftarkan UID");
    }
  };

  // Check ticket by UID
  const checkTicket = async () => {
    if (!uid) {
      Alert.alert("Error", "UID kosong. Ambil UID terakhir atau masukkan manual.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/check-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setMessage("Tiket ditemukan");
      } else {
        setTicket(null);
        setMessage(data.message || "Belum ada tiket");
        Alert.alert("Info", data.message || "Belum ada tiket");
      }
    } catch (err) {
      console.error("checkTicket:", err);
      Alert.alert("Error", "Gagal cek tiket");
    }
  };

  // Assign a sample ticket (manual)
  const assignTicket = async (eventName = "Acara Contoh") => {
    if (!uid) {
      Alert.alert("Error", "UID kosong. Ambil UID terakhir atau masukkan manual.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/assign-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, event: eventName }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Sukses", `Tiket '${eventName}' diberikan ke UID ${uid}`);
      } else {
        Alert.alert("Info", data.message || "Gagal assign tiket");
      }
    } catch (err) {
      console.error("assignTicket:", err);
      Alert.alert("Error", "Gagal assign tiket");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>NFC Tools PRO — Scan Integrasi</Text>

        <TouchableOpacity style={styles.scanButton} onPress={handleNfcToolsScan}>
          <Text style={styles.scanButtonText}>Mulai Scan (NFC Tools PRO)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={fetchLastUser}>
          <Text style={styles.secondaryButtonText}>Ambil UID Terakhir</Text>
        </TouchableOpacity>

        <Text style={styles.label}>UID</Text>
        <TextInput
          style={styles.input}
          placeholder="UID (otomatis via callback atau isi manual)"
          placeholderTextColor="#999"
          value={uid}
          onChangeText={setUid}
        />

        <Text style={styles.label}>Nama</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama (opsional)"
          placeholderTextColor="#999"
          value={nama}
          onChangeText={setNama}
        />

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#28a745" }]} onPress={registerUID}>
          <Text style={styles.actionButtonText}>Daftarkan UID</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#007bff" }]} onPress={checkTicket}>
          <Text style={styles.actionButtonText}>Cek Tiket</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#ff9800" }]} onPress={() => assignTicket("Acara Contoh")}>
          <Text style={styles.actionButtonText}>Assign Tiket Contoh</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {/* {ticket && (
          <View style={styles.ticketBox}>
            <Text style={styles.ticketText}>Nama: {ticket.nama}</Text>
            <Text style={styles.ticketText}>Event: {ticket.event}</Text>
          </View>
        )} */}

        <Text style={styles.footer}>Catatan: pastikan NFC Tools PRO terpasang & NFC aktif di perangkat Android.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#111" },
  container: { flex: 1, padding: 20, alignItems: "center" },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 },
  scanButton: { backgroundColor: "#ff5722", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, marginBottom: 12, width: "100%", alignItems: "center" },
  scanButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: { backgroundColor: "#444", paddingVertical: 10, borderRadius: 8, marginBottom: 12, width: "100%", alignItems: "center" },
  secondaryButtonText: { color: "#fff" },
  label: { color: "#ddd", alignSelf: "flex-start", marginTop: 8 },
  input: { width: "100%", backgroundColor: "#222", color: "#fff", padding: 12, borderRadius: 8, marginTop: 6 },
  actionButton: { width: "100%", paddingVertical: 12, borderRadius: 8, marginTop: 10, alignItems: "center" },
  actionButtonText: { color: "#fff", fontWeight: "700" },
  message: { color: "#fff", marginTop: 12 },
  ticketBox: { marginTop: 16, backgroundColor: "#222", padding: 12, borderRadius: 8, width: "100%" },
  ticketText: { color: "#fff", fontSize: 16 },
  footer: { color: "#999", fontSize: 12, marginTop: 20, textAlign: "center" }
});
