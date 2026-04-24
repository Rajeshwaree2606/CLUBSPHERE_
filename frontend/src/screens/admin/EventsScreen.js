import React, { useContext, useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ScrollView, Modal, Alert, Platform, TouchableOpacity } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { ThemeContext } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Toast from 'react-native-toast-message';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminEventsScreen({ navigation }) {
  const { events, createEvent, editEvent, deleteEvent, clubs } = useContext(DataContext);
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [clubId, setClubId] = useState(clubs.length > 0 ? clubs[0].id : '');
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Ensure clubId is set when clubs load
  React.useEffect(() => {
    if (!clubId && clubs.length > 0) {
      setClubId(clubs[0].id);
    }
  }, [clubs]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle(''); setDesc(''); setDate(''); setTime(''); setVenue('');
    setModalVisible(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDesc(event.description);
    setDate(event.date);
    setTime(event.time);
    setVenue(event.venue);
    setClubId(event.clubId || (clubs.length > 0 ? clubs[0].id : ''));
    setModalVisible(true);
  };

  const handleDelete = (eventId) => {
    setEventToDelete(eventId);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setLoading(true);
    const res = await deleteEvent(eventToDelete);
    setLoading(false);
    setConfirmVisible(false);
    setEventToDelete(null);
    
    if (res.success) Toast.show({ type: 'success', text1: 'Event deleted' });
    else Toast.show({ type: 'error', text1: 'Deletion failed' });
  };

  const handleSave = async () => {
    console.log('Attempting to save event:', { title, date, clubId, finalClubId: clubId || (clubs.length > 0 ? clubs[0].id : null) });
    
    if (!title || !desc || !date || (!clubId && clubs.length > 0)) {
        Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please provide all details, including selecting a club.' });
        return;
    }
    
    const finalClubId = clubId || (clubs.length > 0 ? clubs[0].id : null);
    if (!finalClubId) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'No club available to assign this event to.' });
        return;
    }
    setLoading(true);
    let res;
    if (editingEvent) {
      res = await editEvent(editingEvent.id, { ...editingEvent, title, description: desc, date, time, venue, clubId: finalClubId });
    } else {
      res = await createEvent({ title, description: desc, date, time, venue, maxParticipants: 100, clubId: finalClubId });
    }
    setLoading(false);
    
    if (res.success) {
      setModalVisible(false);
      setTitle(''); setDesc(''); setDate(''); setTime(''); setVenue(''); setEditingEvent(null);
      Toast.show({ type: 'success', text1: editingEvent ? 'Event Updated' : 'Event Created' });
    } else {
        Toast.show({ type: 'error', text1: editingEvent ? 'Failed to update' : 'Failed to create event' });
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.cardContainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.s}}>
        <Text style={theme.typography.h3} numberOfLines={1}>{item.title}</Text>
        <Badge label={item.date} status="primary" />
      </View>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.s }]}>📍 {item.venue} | 🕒 {item.time}</Text>
      <Text style={theme.typography.body} numberOfLines={2}>{item.description}</Text>
      
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.m}}>
        <Button title="Attendance" size="small" variant="outline" onPress={() => navigation.navigate('EventAttendance', { eventId: item.id })} />
        <View style={{flexDirection: 'row', gap: theme.spacing.s}}>
          <Button title="Edit" variant="outline" size="small" onPress={() => openEditModal(item)} />
          <Button title="Delete" variant="danger" size="small" onPress={() => handleDelete(item.id)} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={events} 
        keyExtractor={c => c.id} 
        renderItem={renderItem} 
        contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: 100 }}
      />
      
      <View style={styles.fabContainer}>
         <Button title="Create Event" onPress={openCreateModal} icon="plus" style={{ borderRadius: 100 }} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
             <Text style={[theme.typography.h2, { marginBottom: theme.spacing.l }]}>{editingEvent ? 'Edit Event' : 'Schedule Event'}</Text>
             
             <TextInput style={styles.input} placeholder="Event Title" value={title} onChangeText={setTitle} />
             <TextInput style={[styles.input, { height: 80 }]} placeholder="Event Description..." value={desc} onChangeText={setDesc} multiline />
             <View style={{flexDirection: 'row', gap: theme.spacing.s}}>
              <TextInput 
                style={[styles.input, {flex: 1}]} 
                placeholder="Date" 
                value={date} 
                onChangeText={setDate} 
                {...(Platform.OS === 'web' ? { type: 'date' } : {})}
              />
              <TextInput 
                style={[styles.input, {flex: 1}]} 
                placeholder="Time" 
                value={time} 
                onChangeText={setTime} 
                {...(Platform.OS === 'web' ? { type: 'time' } : {})}
              />
             </View>
             <TextInput style={styles.input} placeholder="Venue or Virtual Link" value={venue} onChangeText={setVenue} />
             
             {/* Simple Club ID selector mapping */}
             {/* Club Selection fallback */}
             {clubs.length > 1 ? (
                <View style={{ marginBottom: theme.spacing.m }}>
                  <Text style={theme.typography.small}>Assign to Club:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {clubs.map(c => (
                      <TouchableOpacity 
                        key={c.id} 
                        onPress={() => setClubId(c.id)}
                        style={{ 
                          padding: 8, 
                          borderRadius: 8, 
                          backgroundColor: clubId === c.id ? theme.colors.primary : theme.colors.background,
                          borderWidth: 1,
                          borderColor: theme.colors.primary
                        }}
                      >
                        <Text style={{ color: clubId === c.id ? 'white' : theme.colors.primary, fontSize: 12 }}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
             ) : (
                <TextInput style={styles.input} placeholder="Club" value={clubs.find(c => c.id === clubId)?.name || (clubs[0]?.name || 'No Club Available')} editable={false} />
             )}

             <View style={styles.modalActions}>
               <Button title="Cancel" variant="ghost" style={{flex: 1}} onPress={() => { setModalVisible(false); setEditingEvent(null); }} />
               <Button title={editingEvent ? 'Save Event' : 'Create Event'} style={{flex: 1}} onPress={handleSave} loading={loading} />
             </View>
          </ScrollView>
        </View>
      </Modal>

      <ConfirmModal 
        visible={confirmVisible}
        title="Delete Confirmation"
        message="Are you sure you want to delete this event?"
        onCancel={() => { setConfirmVisible(false); setEventToDelete(null); }}
        onConfirm={confirmDelete}
        theme={theme}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  cardContainer: { marginHorizontal: 'auto', width: '100%', maxWidth: 500, marginBottom: theme.spacing.m },
  fabContainer: { position: 'absolute', bottom: theme.spacing.m, right: theme.spacing.m, zIndex: 10 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 },
  modalContent: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, paddingTop: theme.spacing.xl, borderTopLeftRadius: theme.borderRadius.l, borderTopRightRadius: theme.borderRadius.l },
  input: { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.m },
  modalActions: { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.m }
});
