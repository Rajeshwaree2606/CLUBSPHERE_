import React, { useContext, useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, Modal, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Toast from 'react-native-toast-message';

export default function AdminClubsScreen() {
  const { clubs, createClub, editClub, deleteClub } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const openCreateModal = () => {
    setEditingClub(null);
    setName('');
    setDesc('');
    setModalVisible(true);
  };

  const openEditModal = (club) => {
    setEditingClub(club);
    setName(club.name);
    setDesc(club.description);
    setModalVisible(true);
  };

  const handleDelete = (clubId) => {
    const performDelete = async () => {
      const res = await deleteClub(clubId);
      if (res.success) Toast.show({ type: 'success', text1: 'Club deleted' });
      else Toast.show({ type: 'error', text1: 'Deletion failed' });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this club?')) {
        performDelete();
      }
    } else {
      Alert.alert('Delete Club', 'Are you sure you want to delete this club?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleSave = async () => {
    if (!name || !desc) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill out everything.' });
      return;
    }
    setLoading(true);
    let res;
    if (editingClub) {
      res = await editClub(editingClub.id, { ...editingClub, name, description: desc });
    } else {
      res = await createClub({ name, description: desc, adminId: user.id || 'admin', memberCount: 1, joined: false });
    }
    setLoading(false);
    
    if (res.success) {
      Toast.show({ type: 'success', text1: editingClub ? 'Club updated' : 'Club created' });
      setModalVisible(false);
      setName(''); setDesc(''); setEditingClub(null);
    } else {
      Toast.show({ type: 'error', text1: editingClub ? 'Update failed' : 'Creation failed' });
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.cardContainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
         <Text style={[theme.typography.h3, {flex: 1}]}>{item.name}</Text>
         <Badge label={`${item.memberCount} Members`} status="primary" />
      </View>
      <Text style={[theme.typography.caption, {marginTop: theme.spacing.s, marginBottom: theme.spacing.m}]}>{item.description}</Text>
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.s}}>
        <Button title="Edit" variant="outline" size="small" onPress={() => openEditModal(item)} />
        <Button title="Delete" variant="danger" size="small" onPress={() => handleDelete(item.id)} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clubs}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: 100 }}
      />
      
      <View style={styles.fabContainer}>
         <Button title="Create Club" onPress={openCreateModal} icon="plus" style={{ borderRadius: 100 }} />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
             <Text style={theme.typography.h2}>{editingClub ? 'Edit Club' : 'New Club'}</Text>
             <Text style={[theme.typography.caption, {marginBottom: theme.spacing.l}]}>{editingClub ? 'Update club details' : 'Start a new group on campus'}</Text>
             
             <View style={styles.inputGroup}>
               <Text style={styles.label}>Club Name</Text>
               <TextInput style={styles.input} placeholder="e.g. Finance Society" value={name} onChangeText={setName} />
             </View>

             <View style={styles.inputGroup}>
               <Text style={styles.label}>Description</Text>
               <TextInput style={[styles.input, {height: 80}]} placeholder="What is this club about?" value={desc} onChangeText={setDesc} multiline textAlignVertical="top" />
             </View>

             <View style={styles.modalActions}>
               <Button title="Cancel" variant="ghost" style={{flex: 1}} onPress={() => { setModalVisible(false); setEditingClub(null); }} />
               <Button title={editingClub ? 'Save' : 'Create'} style={{flex: 1}} onPress={handleSave} loading={loading} />
             </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  cardContainer: { marginHorizontal: 'auto', width: '100%', maxWidth: 500 },
  fabContainer: { position: 'absolute', bottom: theme.spacing.m, right: theme.spacing.m, zIndex: 10 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 },
  modalContent: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, borderTopLeftRadius: theme.borderRadius.l, borderTopRightRadius: theme.borderRadius.l },
  inputGroup: { marginBottom: theme.spacing.m },
  label: { ...theme.typography.small, fontWeight: 'bold', marginBottom: 4, marginLeft: 4 },
  input: { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, fontSize: 16, color: theme.colors.text },
  modalActions: { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.m }
});
