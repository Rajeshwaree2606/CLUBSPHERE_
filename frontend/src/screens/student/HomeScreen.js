import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { clubs, events, notifications } = useContext(DataContext);

  const joinedClubs = clubs.filter(c => c.joined);
  const attendedEvents = events.filter(e => e.joined);
  const upcomingEvents = events.filter(e => !e.joined).slice(0, 3); // show top 3 upcoming

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ gap: theme.spacing.l, paddingBottom: 100 }}>
      
      {/* Welcome Header */}
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={styles.gradientHeader}>
        <View style={styles.welcomeBox}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0] || 'S'}</Text></View>
          <View style={{flex:1}}>
            <Text style={[theme.typography.caption, {color: theme.colors.surface, opacity: 0.8}]}>Level {user?.level || 1} Student</Text>
            <Text style={[theme.typography.h2, {color: theme.colors.surface}]}>{user?.name}</Text>
          </View>
        </View>
        <ProgressBar current={user?.xp || 0} max={1000} />
      </LinearGradient>

      {/* Stats Section */}
      <View style={[styles.statsRow, { paddingHorizontal: theme.spacing.m }]}>
        <Card style={styles.statCard}>
          <Text style={[theme.typography.h1, {color: theme.colors.primary}]}>{joinedClubs.length}</Text>
          <Text style={theme.typography.small}>Clubs Joined</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[theme.typography.h1, {color: theme.colors.secondary}]}>{attendedEvents.length}</Text>
          <Text style={theme.typography.small}>Events Attended</Text>
        </Card>
      </View>

      {/* Upcoming Events Horizontal Scroll */}
      <View style={{ paddingHorizontal: theme.spacing.m }}>
        <Text style={[theme.typography.h3, styles.sectionTitle]}>Upcoming Events</Text>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={upcomingEvents}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <Card style={styles.eventCard}>
              <Text style={theme.typography.h3} numberOfLines={1}>{item.title}</Text>
              <Text style={[theme.typography.caption, {marginBottom: theme.spacing.s}]}>📅 {item.date}</Text>
              <Button title="View" size="sm" onPress={() => navigation.navigate('Events', { screen: 'EventDetails', params: { eventId: item.id }})} />
            </Card>
          )}
          ListEmptyComponent={<Text style={theme.typography.caption}>No upcoming events available.</Text>}
        />
      </View>

      {/* Notifications Vertical List */}
      <View style={{ paddingHorizontal: theme.spacing.m }}>
        <Text style={[theme.typography.h3, styles.sectionTitle]}>Recent Notifications</Text>
        {notifications.map(n => (
          <View key={n.id} style={styles.notificationItem}>
            <View style={styles.notifIcon}>
              <MaterialCommunityIcons name="bell-ring" size={20} color={theme.colors.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={theme.typography.body} numberOfLines={1}>{n.title}</Text>
              <Text style={theme.typography.caption}>{n.message}</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  gradientHeader: { padding: theme.spacing.l, paddingTop: theme.spacing.xxl, borderBottomLeftRadius: theme.borderRadius.l, borderBottomRightRadius: theme.borderRadius.l, ...theme.shadows.medium },
  welcomeBox: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, padding: 0, marginTop: -2, paddingBottom: 0, fontWeight: '800', color: theme.colors.primary },
  statsRow: { flexDirection: 'row', gap: theme.spacing.m },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.l, marginBottom: 0 },
  sectionTitle: { marginBottom: theme.spacing.s },
  eventCard: { width: 220, marginRight: theme.spacing.m, marginBottom: 0 },
  notificationItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.s, ...theme.shadows.small },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' }
});
