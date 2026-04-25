import React, { useContext, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar,
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
import { formatCurrency } from '../../utils/currency';

export default function AdminBudgetScreen() {
  const { budgets, addBudget, editBudget, deleteBudget } = useContext(DataContext);
  const [modalVisible,   setModalVisible]   = useState(false);
  const [editingRecord,  setEditingRecord]  = useState(null);
  const [title,          setTitle]          = useState('');
  const [amount,         setAmount]         = useState('');
  const [type,           setType]           = useState('expense');
  const [loading,        setLoading]        = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const totalIncome  = budgets.filter(b => b.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = budgets.filter(b => b.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const openCreate = () => { setEditingRecord(null); setTitle(''); setAmount(''); setType('expense'); setModalVisible(true); };
  const openEdit   = r  => { setEditingRecord(r); setTitle(r.title); setAmount(String(r.amount)); setType(r.type); setModalVisible(true); };
  const askDelete  = id => { setRecordToDelete(id); setConfirmVisible(true); };

  const confirmDelete = async () => {
    setLoading(true);
    const res = await deleteBudget(recordToDelete);
    setLoading(false); setConfirmVisible(false); setRecordToDelete(null);
    Toast.show({ type: res.success ? 'success' : 'error', text1: res.success ? 'Record deleted' : 'Delete failed' });
  };

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Title and amount are required.' }); return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid amount', text2: 'Enter a valid positive number.' }); return;
    }
    setLoading(true);
    const payload = { title, amount: numAmount, type, date: new Date().toISOString().split('T')[0] };
    const res = editingRecord ? await editBudget(editingRecord.id, { ...editingRecord, ...payload }) : await addBudget(payload);
    setLoading(false);
    if (res.success) {
      setModalVisible(false);
      Toast.show({ type: 'success', text1: editingRecord ? 'Transaction updated ✓' : 'Transaction logged ✓' });
    } else {
      Toast.show({ type: 'error', text1: res.message || 'Operation failed' });
    }
  };

  const renderItem = ({ item }) => {
    const isIncome = item.type === 'income';
    return (
      <PremiumCard style={styles.txCard}>
        <View style={styles.txRow}>
          <View style={[styles.txIcon, { backgroundColor: isIncome ? COLORS.successGlow : COLORS.errorGlow }]}>
            <MaterialCommunityIcons
              name={isIncome ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={22}
              color={isIncome ? COLORS.success : COLORS.error}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txTitle}>{item.title}</Text>
            <Text style={styles.txDate}>{item.date}</Text>
          </View>
          <Text style={[styles.txAmount, { color: isIncome ? COLORS.success : COLORS.error }]}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        </View>
        <View style={styles.txActions}>
          <TouchableOpacity style={styles.txBtn} onPress={() => openEdit(item)}>
            <MaterialCommunityIcons name="pencil-outline" size={14} color={COLORS.gold} />
            <Text style={[styles.txBtnText, { color: COLORS.gold }]}>Edit</Text>
          </TouchableOpacity>
          <View style={styles.txSep} />
          <TouchableOpacity style={styles.txBtn} onPress={() => askDelete(item.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={14} color={COLORS.error} />
            <Text style={[styles.txBtnText, { color: COLORS.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </PremiumCard>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Summary hero */}
      <LinearGradient colors={['#1A1A26', '#0A0A0F']} style={styles.summaryHero}>
        <View style={styles.heroOrb} />
        <Text style={styles.summaryLabel}>NET BALANCE</Text>
        <Text style={[styles.summaryBalance, { color: balance >= 0 ? COLORS.gold : COLORS.error }]}>
          {formatCurrency(balance)}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="arrow-up-circle" size={16} color={COLORS.success} />
            <Text style={styles.summaryItemLabel}>Income</Text>
            <Text style={[styles.summaryItemValue, { color: COLORS.success }]}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="arrow-down-circle" size={16} color={COLORS.error} />
            <Text style={styles.summaryItemLabel}>Expense</Text>
            <Text style={[styles.summaryItemValue, { color: COLORS.error }]}>{formatCurrency(totalExpense)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Transaction list */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Transactions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.addBtnGrad}>
            <MaterialCommunityIcons name="plus" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...budgets].reverse()}
        keyExtractor={b => b.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cash-remove" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />

      <PremiumModal
        visible={modalVisible}
        title={editingRecord ? 'Edit Transaction' : 'New Transaction'}
        icon="cash-multiple"
        onClose={() => { setModalVisible(false); setEditingRecord(null); }}
        footer={
          <>
            <GradientButton title="Cancel" variant="ghost" onPress={() => { setModalVisible(false); setEditingRecord(null); }} style={{ flex: 1 }} fullWidth={false} />
            <GradientButton title={editingRecord ? 'Save' : 'Log It'} variant="gold" onPress={handleSave} loading={loading} style={{ flex: 1 }} fullWidth={false} />
          </>
        }
      >
        {/* Type toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnDanger]}
            onPress={() => setType('expense')}
          >
            {type === 'expense' && <LinearGradient colors={GRADIENTS.crimson} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />}
            <MaterialCommunityIcons name="arrow-down-circle" size={16} color={type === 'expense' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.typeBtnText, type === 'expense' && { color: '#fff' }]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'income' && styles.typeBtnSuccess]}
            onPress={() => setType('income')}
          >
            {type === 'income' && <LinearGradient colors={['#22C55E', '#15803D']} style={StyleSheet.absoluteFill} borderRadius={RADIUS.m} />}
            <MaterialCommunityIcons name="arrow-up-circle" size={16} color={type === 'income' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.typeBtnText, type === 'income' && { color: '#fff' }]}>Income</Text>
          </TouchableOpacity>
        </View>

        <PremiumInput label="Title" placeholder="e.g. Event Supplies" value={title} onChangeText={setTitle} leftIcon="text-box-outline" autoCapitalize="words" />
        <PremiumInput
          label="Amount (₹)"
          placeholder="0.00"
          value={amount}
          onChangeText={t => setAmount(t.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
          keyboardType="decimal-pad"
          leftIcon="currency-inr"
        />
      </PremiumModal>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete Transaction?"
        message="This record will be permanently removed from the budget."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmVisible(false); setRecordToDelete(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  summaryHero: {
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl + 12,
    paddingBottom: SPACING.xl, overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(201,168,76,0.06)', right: -60, top: -40,
  },
  summaryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.textMuted, marginBottom: 6 },
  summaryBalance: { fontSize: 44, fontWeight: '800', letterSpacing: -2, marginBottom: SPACING.l },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryItemLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  summaryItemValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  summaryDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  listHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  listTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  addBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', ...SHADOWS.gold },
  addBtnGrad: { width: 40, height: 40, borderRadius: RADIUS.pill, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.l, paddingBottom: 120 },
  txCard: { marginBottom: SPACING.s },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.m },
  txIcon: { width: 44, height: 44, borderRadius: RADIUS.m, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  txDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  txAmount: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  txActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.m },
  txBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  txBtnText: { fontSize: 12, fontWeight: '600' },
  txSep: { width: 1, height: 16, backgroundColor: COLORS.border },
  empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.m },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  typeToggle: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.l },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: RADIUS.m,
    backgroundColor: COLORS.bgElevated, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  typeBtnDanger: { borderColor: COLORS.crimson },
  typeBtnSuccess: { borderColor: COLORS.success },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecond },
});
