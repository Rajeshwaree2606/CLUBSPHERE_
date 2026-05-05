import React, { useContext, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, SafeAreaView,
} from 'react-native';
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

export default function AdminClubsScreen() {
  const { clubs, createClub, editClub, deleteClub, joinClub, leaveClub } = useContext(DataContext);
  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingClub,    setEditingClub]    = useState(null);
  const [name,           setName]           = useState('');
  const [desc,           setDesc]           = useState('');
  const [loading,        setLoading]        = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [clubToDelete,   setClubToDelete]   = useState(null);
  const [loadingId,      setLoadingId]      = useState(null);
  const [leaveTarget,    setLeaveTarget]    = useState(null);

  const openCreate = () => { setEditingClub(null); setName(''); setDesc(''); setModalVisible(true); };
  const openEdit   = c  => { setEditingClub(c); setName(c.name); setDesc(c.description || ''); setModalVisible(true); };
  const askDelete  = id => { setClubToDelete(id); setConfirmVisible(true); };

  const handleJoin = async id => {
    setLoadingId(id);
    const res = await joinClub(id);
    setLoadingId(null);
    Toast.show({ type: res.success ? 'success' : 'error', text1: res.success ? 'Joined club! 🎉' : (res.message || 'Failed to join') });
  };

  const confirmLeave = async () => {
    if (!leaveTarget) return;
    setLoadingId(leaveTarget);
    const res = await leaveClub(leaveTarget);
    setLoadingId(null); setLeaveTarget(null);
    Toast.show({ type: 'success', text1: 'Left club' });
  };

  const confirmDelete = async () => {
    setLoading(true);
    const res = await deleteClub(clubToDelete);
    setLoading(false); setConfirmVisible(false); setClubToDelete(null);
    Toast.show({ type: res.success ? 'success' : 'error', text1: res.success ? 'Club deleted' : 'Delete failed' });
  };

  const handleSave = async () => {
    if (!name.trim() || !desc.trim()) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Name and description are required.' }); return;
    }
    setLoading(true);
    const res = editingClub
      ? await editClub(editingClub.id, { name, description: desc })
      : await createClub({ name, description: desc });
    setLoading(false);
    if (res.success) {
      setModalVisible(false);
      Toast.show({ type: 'success', text1: editingClub ? 'Club updated ✓' : 'Club created ✓' });
    } else {
      Toast.show({ type: 'error', text1: res.message || 'Operation failed' });
    }
  };

  const renderItem = ({ item }) => (
    <PremiumCard style={styles.card}>
      <View style={styles.cardHeader}>
        <LinearGradient colors={GRADIENTS.gold} style={styles.clubInitial}>
          <Text style={styles.initialText}>{item.name?.[0]?.toUpperCase() || 'C'}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.clubName}>{item.name}</Text>
          <View style={styles.memberRow}>
            <MaterialCommunityIcons name="account-multiple" size={12} color={COLORS.textMuted} />
            <Text style={styles.memberText}>{item.memberCount || 0} {item.memberCount === 1 ? 'Member' : 'Members'}</Text>
          </View>
        </View>
        {item.joined && (
          <View style={styles.joinedPill}>
            <MaterialCommunityIcons name="check-circle" size={13} color={COLORS.success} />
            <Text style={styles.joinedText}>Joined</Text>
          </View>
        )}
      </View>

      {item.description ? (
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      ) : null}

      <View style={styles.cardDivider} />
      <View style={styles.actions}>
        {item.joined ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => setLeaveTarget(item.id)}>
            <MaterialCommunityIcons name="account-minus" size={16} color={COLORS.textSecond} />
            <Text style={[styles.actionText, { color: COLORS.textSecond }]}>Leave</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleJoin(item.id)}>
            <MaterialCommunityIcons name="account-plus" size={16} color={COLORS.success} />
            <Text style={[styles.actionText, { color: COLORS.success }]}>Join</Text>
          </TouchableOpacity>
        )}
        <View style={styles.actionSep} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color={COLORS.gold} />
          <Text style={[styles.actionText, { color: COLORS.gold }]}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.actionSep} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => askDelete(item.id)}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </PremiumCard>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Clubs</Text>
          <Text style={styles.headerSub}>{clubs.length} club{clubs.length !== 1 ? 's' : ''} registered</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.addBtnGrad}>
            <MaterialCommunityIcons name="plus" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={clubs}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No clubs yet</Text>
            <Text style={styles.emptySub}>Tap + to create the first club</Text>
          </View>
        }
      />

      {/* Create/Edit modal */}
      <PremiumModal
        visible={modalVisible}
        title={editingClub ? 'Edit Club' : 'New Club'}
        subtitle={editingClub ? 'Update club details' : 'Start a new campus group'}
        icon={editingClub ? 'pencil-circle' : 'plus-circle'}
        onClose={() => { setModalVisible(false); setEditingClub(null); }}
        footer={
          <>
            <GradientButton title="Cancel" variant="ghost" onPress={() => { setModalVisible(false); setEditingClub(null); }} style={{ flex: 1 }} fullWidth={false} />
            <GradientButton title={editingClub ? 'Save Changes' : 'Create Club'} variant="gold" onPress={handleSave} loading={loading} style={{ flex: 1 }} fullWidth={false} />
          </>
        }
      >
        <PremiumInput label="Club Name" placeholder="e.g. Finance Society" value={name} onChangeText={setName} leftIcon="account-group-outline" autoCapitalize="words" />
        <PremiumInput label="Description" placeholder="What is this club about?" value={desc} onChangeText={setDesc} multiline numberOfLines={3} leftIcon="text-box-outline" />
      </PremiumModal>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete Club?"
        message="This action cannot be undone. All club data will be permanently removed."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmVisible(false); setClubToDelete(null); }}
      />

      <ConfirmModal
        visible={!!leaveTarget}
        title="Leave Club?"
        message="You can rejoin at any time, but you'll lose your member status."
        confirmLabel="Leave"
        onConfirm={confirmLeave}
        onCancel={() => setLeaveTarget(null)}
        variant="gold"
      />
    </SafeAreaView>
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
  headerSub:   { fontSize: 13, color: COLORS.textSecond, marginTop: 2 },
  addBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', ...SHADOWS.gold },
  addBtnGrad: { width: 44, height: 44, borderRadius: RADIUS.pill, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.l, paddingBottom: 120 },
  card: { marginBottom: SPACING.m },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.m },
  clubInitial: {
    width: 48, height: 48, borderRadius: RADIUS.m,
    justifyContent: 'center', alignItems: 'center',
  },
  initialText: { fontSize: 20, fontWeight: '800', color: '#000' },
  clubName:    { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  memberRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  memberText:  { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  desc:        { fontSize: 13, color: COLORS.textSecond, lineHeight: 20, marginBottom: SPACING.m },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.m },
  actions:     { flexDirection: 'row', alignItems: 'center' },
  actionBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6 },
  actionText:  { fontSize: 13, fontWeight: '600' },
  actionSep:   { width: 1, height: 20, backgroundColor: COLORS.border },
  empty:       { alignItems: 'center', paddingTop: 80, gap: SPACING.m },
  emptyText:   { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  emptySub:    { fontSize: 14, color: COLORS.textSecond },
  joinedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.successGlow, borderRadius: RADIUS.pill,
    paddingVertical: 4, paddingHorizontal: 8,
    borderWidth: 1, borderColor: `${COLORS.success}44`,
  },
  joinedText: { fontSize: 11, color: COLORS.success, fontWeight: '700' },
});
