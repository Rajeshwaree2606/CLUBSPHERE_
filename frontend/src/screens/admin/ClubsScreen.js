import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TextInput, Modal, StyleSheet, ScrollView } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Toast from 'react-native-toast-message';

export default function AdminClubsScreen() {
  const { clubs, createClub } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !desc) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill out everything.' });
      return;
    }
    setLoading(true);
    const res = await createClub({ name, description: desc, adminId: user.id || 'admin', memberCount: 1, joined: false });
    setLoading(false);
    if (res.success) {
      Toast.show({ type: 'success', text1: 'Club created' });
      setModalVisible(false);
      setName(''); setDesc('');
    } else {
      Toast.show({ type: 'error', text1: 'Creation failed' });
    }
  };

  const renderItem = ({ item }) => (
    <Card>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
         <Text style={[theme.typography.h3, {flex: 1}]}>{item.name}</Text>
         <Badge label={`${item.memberCount} Mbrs`} status="primary" />
      </View>
      <Text style={[theme.typography.caption, {marginTop: theme.spacing.s}]}>{item.description}</Text>
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
         <Button title="Create Club" onPress={() => setModalVisible(true)} icon="plus" style={{ borderRadius: 100 }} />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
             <Text style={theme.typography.h2}>New Club</Text>
             <Text style={[theme.typography.caption, {marginBottom: theme.spacing.l}]}>Start a new group on campus</Text>
             
             <View style={styles.inputGroup}>
               <Text style={styles.label}>Club Name</Text>
               <TextInput style={styles.input} placeholder="e.g. Finance Society" value={name} onChangeText={setName} />
             </View>

             <View style={styles.inputGroup}>
               <Text style={styles.label}>Description</Text>
               <TextInput style={[styles.input, {height: 80}]} placeholder="What is this club about?" value={desc} onChangeText={setDesc} multiline textAlignVertical="top" />
             </View>

             <View style={styles.modalActions}>
               <Button title="Cancel" variant="ghost" style={{flex: 1}} onPress={() => setModalVisible(false)} />
               <Button title="Create" style={{flex: 1}} onPress={handleCreate} loading={loading} />
             </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  fabContainer: { position: 'absolute', bottom: theme.spacing.m, left: theme.spacing.m, right: theme.spacing.m },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, borderTopLeftRadius: theme.borderRadius.l, borderTopRightRadius: theme.borderRadius.l },
  inputGroup: { marginBottom: theme.spacing.m },
  label: { ...theme.typography.small, fontWeight: 'bold', marginBottom: 4, marginLeft: 4 },
  input: { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, fontSize: 16, color: theme.colors.text },
  modalActions: { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.m }
});
