import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { ThemeContext } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnnouncementsScreen() {
  const { notifications, createNotification, editNotification, deleteNotification } = useContext(DataContext);
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const openCreateModal = () => {
    setEditingNotification(null);
    setTitle(''); setMessage('');
    setModalVisible(true);
  };

  const openEditModal = (notification) => {
    setEditingNotification(notification);
    setTitle(notification.title);
    setMessage(notification.message);
    setModalVisible(true);
  };

  const handleDelete = (notificationId) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const res = await deleteNotification(notificationId);
          if (res.success) Toast.show({ type: 'success', text1: 'Alert deleted' });
          else Toast.show({ type: 'error', text1: 'Deletion failed' });
      } }
    ]);
  };

  const handleBroadcast = async () => {
    if (!title || !message) {
      Toast.show({ type: 'error', text1: 'Missing info' });
      return;
    }
    setLoading(true);
    let res;
    if (editingNotification) {
      res = await editNotification(editingNotification.id, { ...editingNotification, title, message });
    } else {
      res = await createNotification({ title, message });
    }
    setLoading(false);
    
    if (res.success) {
      setModalVisible(false);
      setTitle(''); setMessage(''); setEditingNotification(null);
      Toast.show({ type: 'success', text1: editingNotification ? 'Broadcast Updated!' : 'Broadcast Sent!' });
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
           <MaterialCommunityIcons name="bullhorn" size={24} color={theme.colors.primary} />
        </View>
        <View style={{flex: 1}}>
          <Text style={theme.typography.h3}>{item.title}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.primary, marginVertical: 4 }]}>{item.date}</Text>
          <Text style={theme.typography.body}>{item.message}</Text>
        </View>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.s, marginTop: theme.spacing.s}}>
        <Button title="Edit" variant="outline" size="small" onPress={() => openEditModal(item)} />
        <Button title="Delete" variant="danger" size="small" onPress={() => handleDelete(item.id)} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: 100 }}
      />

      <View style={styles.fabContainer}>
         <Button title="Broadcast Message" onPress={openCreateModal} icon="send" style={{ borderRadius: 100 }} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
             <Text style={[theme.typography.h2, { marginBottom: theme.spacing.l }]}>{editingNotification ? 'Edit Announcement' : 'New Announcement'}</Text>
             
             <TextInput style={styles.input} placeholder="Headline / Subject" value={title} onChangeText={setTitle} />
             <TextInput style={[styles.input, { height: 100 }]} placeholder="Type your broadcast message here..." value={message} onChangeText={setMessage} multiline textAlignVertical="top" />

             <View style={styles.modalActions}>
               <Button title="Cancel" variant="ghost" style={{flex: 1}} onPress={() => { setModalVisible(false); setEditingNotification(null); }} />
               <Button title={editingNotification ? "Save Changes" : "Send Now"} style={{flex: 1}} onPress={handleBroadcast} loading={loading} />
             </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  cardContainer: { marginBottom: theme.spacing.m },
  card: { flexDirection: 'row', gap: theme.spacing.m, alignItems: 'flex-start' },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  fabContainer: { position: 'absolute', bottom: theme.spacing.m, left: theme.spacing.m, right: theme.spacing.m, alignItems: 'center' },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, paddingTop: theme.spacing.xl, borderTopLeftRadius: theme.borderRadius.l, borderTopRightRadius: theme.borderRadius.l },
  input: { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.m },
  modalActions: { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.s }
});
