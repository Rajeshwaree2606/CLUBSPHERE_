import React, { useContext, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { ThemeContext } from '../../context/ThemeContext';
import Toast from 'react-native-toast-message';
import Button from '../../components/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EventAttendanceScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { events, getAttendance, markAttendance } = useContext(DataContext);
  const { theme } = useContext(ThemeContext);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const event = events.find(e => e.id === eventId);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAttendance(eventId);
    setAttendees(data);
    setLoading(false);
  };

  const handleStatusChange = async (userId, targetStatus) => {
    // Optimistic UI Update
    setAttendees(prev => prev.map(a => a.userId === userId ? { ...a, status: targetStatus } : a));
    const res = await markAttendance(eventId, userId, targetStatus);
    if (res.success) {
      Toast.show({ type: 'success', text1: `Marked as ${targetStatus.toUpperCase()}` });
    } else {
      Toast.show({ type: 'error', text1: 'Database error' });
      loadData(); // Revert
    }
  };

  const renderItem = ({ item }) => {
    const isPresent = item.status === 'present';
    const isAbsent = item.status === 'absent';

    return (
      <View style={styles.userRow}>
        <View style={{flex: 1}}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={theme.typography.small}>ID: {item.userId}</Text>
        </View>
        <View style={styles.actionBlock}>
          <Button 
            title="Present" 
            size="sm" 
            variant={isPresent ? 'primary' : 'outline'}
            style={[styles.smallBtn, isPresent && { backgroundColor: theme.colors.secondary }]}
            onPress={() => handleStatusChange(item.userId, 'present')} 
          />
          <Button 
            title="Absent" 
            size="sm" 
            variant={isAbsent ? 'danger' : 'outline'}
            style={styles.smallBtn}
            onPress={() => handleStatusChange(item.userId, 'absent')} 
          />
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;

  const presentCount = attendees.filter(a => a.status === 'present').length;
  const attendanceRate = attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Header Modal Styling Handle */}
      <View style={styles.handle} />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.s }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: theme.spacing.s }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={theme.typography.h2}>Attendance Roster</Text>
        </View>
        <Text style={theme.typography.caption}>Tracking for: {event?.title}</Text>
        
        <View style={styles.statRow}>
           <View style={{flex: 1}}><Text style={theme.typography.small}>Total Size</Text><Text style={[theme.typography.h3, {color: theme.colors.primary}]}>{attendees.length}</Text></View>
           <View style={{flex: 1}}><Text style={theme.typography.small}>Check-ins</Text><Text style={[theme.typography.h3, {color: theme.colors.secondary}]}>{presentCount}</Text></View>
           <View style={{flex: 1}}><Text style={theme.typography.small}>Yield</Text><Text style={[theme.typography.h3, {color: theme.colors.accent}]}>{attendanceRate}%</Text></View>
        </View>
      </View>

      <FlatList 
        data={attendees}
        keyExtractor={item => item.userId}
        renderItem={renderItem}
        contentContainerStyle={{ padding: theme.spacing.m }}
        ListEmptyComponent={<Text style={theme.typography.caption}>No attendees registered yet.</Text>}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  handle: { width: 40, height: 4, backgroundColor: theme.colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: theme.spacing.m },
  header: { padding: theme.spacing.m, borderBottomWidth: 1, borderColor: theme.colors.border },
  statRow: { flexDirection: 'row', marginTop: theme.spacing.m, paddingVertical: theme.spacing.m, borderTopWidth: 1, borderColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.m, borderBottomWidth: 1, borderColor: theme.colors.background },
  userName: { ...theme.typography.body, fontWeight: '700' },
  actionBlock: { flexDirection: 'row', gap: theme.spacing.s },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 12 }
});
