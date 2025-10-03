import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';

const mockTickets = [
  {
    id: '1',
    ticketNumber: 'KAI-001234',
    destination: 'Jakarta → Surabaya',
    date: '2024-01-15',
    time: '08:30',
    seat: 'A12',
    nik: '3374061234567890'
  },
  {
    id: '2',
    ticketNumber: 'KAI-005678',
    destination: 'Bandung → Yogyakarta',
    date: '2024-01-20',
    time: '14:15',
    seat: 'B05',
    nik: '3374061234567890'
  }
];

export default function TicketsScreen() {
  const handleTicketPress = (ticket: any) => {
    router.push({
      pathname: '/ticket-detail',
      params: { 
        nik: ticket.nik,
        ticketId: ticket.id
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tiket Saya</Text>
      
      <ScrollView style={styles.ticketList} showsVerticalScrollIndicator={false}>
        {mockTickets.map((ticket) => (
          <TouchableOpacity
            key={ticket.id}
            style={styles.ticketCard}
            onPress={() => handleTicketPress(ticket)}
          >
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
              <Text style={styles.ticketDate}>{ticket.date}</Text>
            </View>
            
            <Text style={styles.destination}>{ticket.destination}</Text>
            
            <View style={styles.ticketFooter}>
              <Text style={styles.time}>{ticket.time}</Text>
              <Text style={styles.seat}>Kursi {ticket.seat}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  ticketList: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ticketDate: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  destination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  seat: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
