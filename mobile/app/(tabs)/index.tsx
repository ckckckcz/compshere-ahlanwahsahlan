import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

type User = {
  uid: string;
  nama: string;
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);

  // Polling setiap 3 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://ca7f82ca1ba3.ngrok-free.app/api/users") // Ganti IP sesuai server kamu
        .then(res => res.json())
        .then(data => {
          setUsers(data.users || []);
        })
        .catch(err => console.error("❌ Error fetch:", err));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📡 Daftar UID dari NFC Tools PRO</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.uid}>UID: {item.uid}</Text>
            <Text style={styles.nama}>Nama: {item.nama}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  uid: {
    fontWeight: "bold",
  },
  nama: {
    color: "#666",
  },
});
