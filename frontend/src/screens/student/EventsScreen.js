import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';

export default function EventsScreen({ navigation }) {
  const { events, clubs, joinEvent } = useContext(DataContext);
  const [loadingId, setLoadingId] = useState(null);

  const getClubName = (clubId) => clubs.find(c => c.id === clubId)?.name || 'Unknown Club';

  const renderItem = ({ item }) => (
    <Card onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
      <View style={styles.headerRow}>
        <Text style={theme.typography.h3} numberOfLines={1}>{item.title}</Text>
        <Badge label={item.joined ? "Joined" : "Upcoming"} status={item.joined ? "success" : "primary"} />
      </View>
      <Text style={[theme.typography.caption, { color: theme.colors.secondary }]}>Hosted by {getClubName(item.clubId)}</Text>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>📅 {item.date}</Text>
        <Text style={styles.detailText}>🕒 {item.time}</Text>
      </View>
      <View style={styles.venueRow}>
        <Text style={styles.detailText}>📍 {item.venue}</Text>
      </View>

      <View style={{ marginTop: theme.spacing.m }}>
        {item.joined ? (
          <Button variant="ghost" title="Joined" disabled icon="check-circle" size="sm" />
        ) : (
          <Button 
            title="Join Event" 
            onPress={() => handleJoinInline(item.id)} 
            loading={loadingId === item.id} 
            icon="ticket-confirmation"
            size="sm"
          />
        )}
      </View>
    </Card>
  );

  const handleJoinInline = async (id) => {
    setLoadingId(id);
    const res = await joinEvent(id);
    setLoadingId(null);
    if (res.success) Toast.show({ type: 'success', text1: 'Success', text2: 'Joined the event!' });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: theme.spacing.m }}
        ListHeaderComponent={<Text style={[theme.typography.h2, { marginBottom: theme.spacing.m }]}>All Events</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  detailsRow: { flexDirection: 'row', gap: 16, marginTop: theme.spacing.m, marginBottom: theme.spacing.s },
  venueRow: { backgroundColor: theme.colors.background, padding: 8, borderRadius: theme.borderRadius.s },
  detailText: { ...theme.typography.small, color: theme.colors.text }
});
