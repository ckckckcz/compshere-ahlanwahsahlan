import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const mockTicketData = {
  ownerName: 'John Doe',
  nik: '3374061234567890',
  ticketNumber: 'KAI-001234',
  date: '15 Januari 2024',
  time: '08:30 WIB',
  destination: 'Jakarta → Surabaya',
  seatNumber: 'A12',
  trainName: 'Argo Bromo Anggrek',
  car: '2',
};

export default function TicketDetailScreen() {
  const { nik } = useLocalSearchParams();

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Tiket</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle}>Tiket Kereta Api</Text>
          <Text style={styles.ticketNumber}>{mockTicketData.ticketNumber}</Text>
        </View>

        <View style={styles.passengerInfo}>
          <Text style={styles.sectionTitle}>Informasi Penumpang</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nama Pemilik</Text>
            <Text style={styles.value}>{mockTicketData.ownerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nomor Identitas (NIK)</Text>
            <Text style={styles.value}>{mockTicketData.nik}</Text>
          </View>
        </View>

        <View style={styles.journeyInfo}>
          <Text style={styles.sectionTitle}>Informasi Perjalanan</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Kereta</Text>
            <Text style={styles.value}>{mockTicketData.trainName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tujuan</Text>
            <Text style={styles.value}>{mockTicketData.destination}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tanggal & Waktu</Text>
            <Text style={styles.value}>{mockTicketData.date}, {mockTicketData.time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gerbong</Text>
            <Text style={styles.value}>{mockTicketData.car}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nomor Kursi</Text>
            <Text style={styles.value}>{mockTicketData.seatNumber}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
        <Text style={styles.doneButtonText}>Selesai</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  ticketCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333333',
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  passengerInfo: {
    marginBottom: 24,
  },
  journeyInfo: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  doneButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
