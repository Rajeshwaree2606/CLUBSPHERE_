import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { DataContext } from '../../context/DataContext';
import { COLORS, GRADIENTS, RADIUS, SPACING, SHADOWS } from '../../utils/theme';
import PremiumCard from '../../components/PremiumCard';
import PremiumModal from '../../components/PremiumModal';
import PremiumInput from '../../components/PremiumInput';
import GradientButton from '../../components/GradientButton';
import ConfirmModal from '../../components/ConfirmModal';

export default function AnnouncementsScreen() {
  const { notifications, createNotification, editNotification, deleteNotification } = useContext(DataContext);
  const [modalVisible,     setModalVisible]     = useState(false);
  const [editingNotif,     setEditingNotif]      = useState(null);
  const [title,            setTitle]             = useState('');
  const [message,          setMessage]           = useState('');
  const [loading,          setLoading]           = useState(false);
  const [confirmVisible,   setConfirmVisible]    = useState(false);
  const [notifToDelete,    setNotifToDelete]     = useState(null);

  const openCreate = () => { setEditingNotif(null); setTitle(''); setMessage(''); setModalVisible(true); };
  const openEdit   = n  => { setEditingNotif(n); setTitle(n.title); setMessage(n.message); setModalVisible(true); };
  const askDelete  = id => { setNotifToDelete(id); setConfirmVisible(true); };

  const confirmDelete = async () => {
    setLoading(true);
    const res = await deleteNotification(notifToDelete);
    setLoading(false); setConfirmVisible(false); setNotifToDelete(null);
    Toast.show({ type: res.success ? 'success' : 'error', text1: res.success ? 'Announcement deleted' : 'Delete failed' });
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Title and message are required.' }); return;
    }
    setLoading(true);
    const res = editingNotif
      ? await editNotification(editingNotif.id, { title, message })
      : await createNotification({ title, message });
    setLoading(false);
    if (res.success) {
      setModalVisible(false);
      Toast.show({ type: 'success', text1: editingNotif ? 'Announcement updated ✓' : 'Broadcast sent ✓' });
    } else {
      Toast.show({ type: 'error', text1: res.message || 'Operation failed' });
    }
  };

  const renderItem = ({ item }) => (
    <PremiumCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="bullhorn" size={20} color={COLORS.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.cardMessage}>{item.message}</Text>
      <View style={styles.cardDivider} />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <MaterialCommunityIcons name="pencil-outline" size={15} color={COLORS.gold} />
          <Text style={[styles.actionText, { color: COLORS.gold }]}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.actionSep} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => askDelete(item.id)}>
          <MaterialCommunityIcons name="trash-can-outline" size={15} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </PremiumCard>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSub}>{notifications.length} broadcast{notifications.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.addBtnGrad}>
            <MaterialCommunityIcons name="send" size={18} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bullhorn-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No announcements yet</Text>
            <Text style={styles.emptySub}>Tap Send to broadcast a message</Text>
          </View>
        }
      />

      <PremiumModal
        visible={modalVisible}
        title={editingNotif ? 'Edit Announcement' : 'New Announcement'}
        subtitle={editingNotif ? 'Update broadcast message' : 'Send a message to all members'}
        icon="bullhorn"
        onClose={() => { setModalVisible(false); setEditingNotif(null); }}
        footer={
          <>
            <GradientButton title="Cancel" variant="ghost" onPress={() => { setModalVisible(false); setEditingNotif(null); }} style={{ flex: 1 }} fullWidth={false} />
            <GradientButton title={editingNotif ? 'Save' : 'Send Now'} variant="gold" icon="send" onPress={handleSave} loading={loading} style={{ flex: 1 }} fullWidth={false} />
          </>
        }
      >
        <PremiumInput label="Headline / Subject" placeholder="e.g. Club Meetup This Friday!" value={title} onChangeText={setTitle} leftIcon="format-title" autoCapitalize="sentences" />
        <PremiumInput label="Message" placeholder="Type your broadcast message here..." value={message} onChangeText={setMessage} multiline numberOfLines={4} leftIcon="text-long" autoCapitalize="sentences" />
      </PremiumModal>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete Announcement?"
        message="This broadcast will be removed and members will no longer see it."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmVisible(false); setNotifToDelete(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.l, paddingTop: SPACING.xxl, paddingBottom: SPACING.l,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  headerSub: { fontSize: 13, color: COLORS.textSecond, marginTop: 2 },
  addBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', ...SHADOWS.gold },
  addBtnGrad: { width: 44, height: 44, borderRadius: RADIUS.pill, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.l, paddingBottom: 120 },
  card: { marginBottom: SPACING.m },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.m },
  iconBox: {
    width: 44, height: 44, borderRadius: RADIUS.m,
    backgroundColor: COLORS.goldGlow, borderWidth: 1, borderColor: COLORS.goldDim,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  cardDate:  { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  cardMessage: { fontSize: 14, color: COLORS.textSecond, lineHeight: 21, marginBottom: SPACING.m },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.m },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 12, fontWeight: '600' },
  actionSep: { width: 1, height: 18, backgroundColor: COLORS.border },
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.m },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  emptySub:  { fontSize: 14, color: COLORS.textSecond },
});
