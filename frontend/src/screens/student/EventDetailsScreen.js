import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { theme } from '../../utils/theme';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Toast from 'react-native-toast-message';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { events, clubs, joinEvent } = useContext(DataContext);
  const [loading, setLoading] = useState(false);

  const event = events.find(e => e.id === eventId);
  const club = clubs.find(c => c.id === event?.clubId);

  if (!event) return <View style={styles.container}><Text>Event not found</Text></View>;

  const handleJoin = async () => {
    setLoading(true);
    const res = await joinEvent(event.id);
    setLoading(false);
    if (res.success) {
      Toast.show({ type: 'success', text1: 'Success', text2: 'You have joined the event!' });
    } else {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to join event.' });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: 100 }}>
      {/* Header Modal Styling Handle */}
      <View style={styles.handle} />
      
      <View style={styles.header}>
        <Badge label={event.joined ? "Joined" : "Registration Open"} status={event.joined ? "success" : "primary"} />
        <Text style={[theme.typography.h1, { marginTop: theme.spacing.s }]}>{event.title}</Text>
        <Text style={[theme.typography.h3, { color: theme.colors.secondary }]}>Hosted by {club?.name || 'Unknown'}</Text>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>📅 Date:</Text><Text style={styles.infoValue}>{event.date}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>🕒 Time:</Text><Text style={styles.infoValue}>{event.time}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>📍 Venue:</Text><Text style={styles.infoValue}>{event.venue}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>👥 Max Capacity:</Text><Text style={styles.infoValue}>{event.maxParticipants} participants</Text></View>
      </View>

      <Text style={[theme.typography.h3, { marginBottom: theme.spacing.s }]}>About this Event</Text>
      <Text style={theme.typography.body}>{event.description}</Text>

      <Text style={[theme.typography.h3, { marginBottom: theme.spacing.s, marginTop: theme.spacing.l }]}>Attendees ({event.joined ? 3 : 2})</Text>
      <View style={{ gap: theme.spacing.xs }}>
         <Text style={theme.typography.body}>👤 Alex Johnson</Text>
         <Text style={theme.typography.body}>👤 Maria Garcia</Text>
         {event.joined && <Text style={[theme.typography.body, { color: theme.colors.primary, fontWeight: 'bold' }]}>👤 You</Text>}
      </View>

      <View style={styles.footer}>
        {event.joined ? (
          <Button title="You're attending!" variant="ghost" disabled icon="check-circle" />
        ) : (
          <Button title="Join Event" onPress={handleJoin} loading={loading} icon="ticket-confirmation" />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  handle: { width: 40, height: 4, backgroundColor: theme.colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: theme.spacing.m },
  header: { marginBottom: theme.spacing.xl },
  infoBox: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.l, padding: theme.spacing.m, marginBottom: theme.spacing.xl, ...theme.shadows.small },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.xs },
  infoLabel: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: '500' },
  infoValue: { ...theme.typography.body, fontWeight: '600' },
  footer: { marginTop: theme.spacing.xxl }
});
