import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { ThemeContext } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { clubs, events, notifications } = useContext(DataContext);
  const { theme } = useContext(ThemeContext);

  const joinedClubs = clubs.filter(c => c.joined);
  const attendedEvents = events.filter(e => e.joined);
  const upcomingEvents = events.filter(e => !e.joined).slice(0, 3);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ gap: theme.spacing.l, paddingBottom: 100 }}>
      
      {/* Welcome Header */}
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={[styles.gradientHeader, { padding: theme.spacing.l, paddingTop: theme.spacing.xxl, borderBottomLeftRadius: theme.borderRadius.l, borderBottomRightRadius: theme.borderRadius.l, ...theme.shadows.medium }]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <View style={[styles.welcomeBox, { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m }]}>
            <View style={[styles.avatar, { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}><Text style={[styles.avatarText, { fontSize: 24, fontWeight: '800', color: theme.colors.primary }]}>{user?.name?.[0] || 'S'}</Text></View>
            <View>
              <Text style={[{ fontSize: 12, color: theme.colors.surface, opacity: 0.8 }]}>Level {user?.level || 1} Student</Text>
              <Text style={[{ fontSize: 24, fontWeight: '700', color: theme.colors.surface }]}>{user?.name}</Text>
            </View>
          </View>
          <TouchableOpacity style={{padding: theme.spacing.xs}}>
            <MaterialCommunityIcons name="bell-outline" size={28} color={theme.colors.surface} />
            {notifications.length > 0 && (
               <View style={{position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.error}} />
            )}
          </TouchableOpacity>
        </View>
        <ProgressBar current={user?.xp || 0} max={1000} />
      </LinearGradient>

      {/* Stats Section */}
      <View style={[styles.statsRow, { paddingHorizontal: theme.spacing.m, flexDirection: 'row', gap: theme.spacing.m }]}>
        <Card style={[styles.statCard, { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.m, marginBottom: 0 }]}>
          <Text style={[{ fontSize: 28, fontWeight: '800' }, { color: theme.colors.primary }]}>{joinedClubs.length}</Text>
          <Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>Clubs Joined</Text>
        </Card>
        <Card style={[styles.statCard, { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.m, marginBottom: 0 }]}>
          <Text style={[{ fontSize: 28, fontWeight: '800' }, { color: theme.colors.secondary }]}>{attendedEvents.length}</Text>
          <Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>Events Attended</Text>
        </Card>
      </View>

      {/* Upcoming Events Horizontal Scroll */}
      <View style={{ paddingHorizontal: theme.spacing.m }}>
        <Text style={[styles.sectionTitle, { fontSize: 18, fontWeight: '600', marginBottom: theme.spacing.s, color: theme.colors.text }]}>Upcoming Events</Text>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={upcomingEvents}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <Card style={[styles.eventCard, { width: 220, marginRight: theme.spacing.m, marginBottom: 0 }]}>
              <Text style={[{ fontSize: 18, fontWeight: '600', color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: theme.spacing.s }]}>📅 {item.date}</Text>
              <Button title="View" onPress={() => navigation.navigate('Events', { screen: 'EventDetails', params: { eventId: item.id }})} />
            </Card>
          )}
          ListEmptyComponent={<Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>No upcoming events available.</Text>}
        />
      </View>

      {/* Notifications Vertical List */}
      <View style={{ paddingHorizontal: theme.spacing.m }}>
        <Text style={[styles.sectionTitle, { fontSize: 18, fontWeight: '600', marginBottom: theme.spacing.s, color: theme.colors.text }]}>Recent Notifications</Text>
        {notifications.map(n => (
          <View key={n.id} style={[styles.notificationItem, { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.s, ...theme.shadows.small }]}>
            <View style={[styles.notifIcon, { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialCommunityIcons name="bell-ring" size={20} color={theme.colors.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[{ fontSize: 16, color: theme.colors.text }]} numberOfLines={1}>{n.title}</Text>
              <Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>{n.message}</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientHeader: {},
  welcomeBox: {},
  avatar: {},
  avatarText: {},
  statsRow: {},
  statCard: {},
  sectionTitle: {},
  eventCard: {},
  notificationItem: {},
  notifIcon: {}
});
