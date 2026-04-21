import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TextInput, Modal, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { ThemeContext } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminBudgetScreen() {
  const { budgets, addBudget, editBudget, deleteBudget } = useContext(DataContext);
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);

  const totalIncome = budgets.filter(b => b.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = budgets.filter(b => b.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const openCreateModal = () => {
    setEditingRecord(null);
    setTitle(''); setAmount(''); setType('expense');
    setModalVisible(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setTitle(record.title);
    setAmount(record.amount.toString());
    setType(record.type);
    setModalVisible(true);
  };

  const handleDelete = (recordId) => {
    const performDelete = async () => {
      const res = await deleteBudget(recordId);
      if (res.success) Toast.show({ type: 'success', text1: 'Record deleted' });
      else Toast.show({ type: 'error', text1: 'Deletion failed' });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this transaction?')) {
        performDelete();
      }
    } else {
      Alert.alert('Delete Record', 'Are you sure you want to delete this transaction?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleAdd = async () => {
    if (!title || !amount) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please input all data' });
      return;
    }
    setLoading(true);
    let res;
    if (editingRecord) {
      res = await editBudget(editingRecord.id, { ...editingRecord, title, amount: parseFloat(amount), type });
    } else {
      res = await addBudget({ title, amount: parseFloat(amount), type, date: new Date().toISOString().split('T')[0] });
    }
    setLoading(false);
    
    if (res.success) {
      setModalVisible(false);
      setTitle(''); setAmount(''); setEditingRecord(null);
      Toast.show({ type: 'success', text1: editingRecord ? 'Transaction Updated' : 'Transaction Logged' });
    } else {
      Toast.show({ type: 'error', text1: editingRecord ? 'Update failed' : 'Creation failed' });
    }
  };

  const renderItem = ({ item }) => {
    const isIncome = item.type === 'income';
    return (
      <View style={[styles.transactionRow, { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m, flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={[styles.iconBox, { backgroundColor: isIncome ? theme.colors.secondaryLight : theme.colors.errorLight }]}>
             <MaterialCommunityIcons name={isIncome ? 'arrow-up' : 'arrow-down'} size={20} color={isIncome ? theme.colors.secondary : theme.colors.error} />
          </View>
          <View style={{flex: 1}}>
            <Text style={[{ fontSize: 16, fontWeight: '600' }, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>{item.date}</Text>
          </View>
          <Text style={[styles.amount, { color: isIncome ? theme.colors.secondary : theme.colors.error }]}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.s, marginTop: theme.spacing.s}}>
           <Button title="Edit" variant="outline" size="small" onPress={() => openEditModal(item)} style={{paddingVertical: 4, paddingHorizontal: 8}} />
           <Button title="Delete" variant="danger" size="small" onPress={() => handleDelete(item.id)} style={{paddingVertical: 4, paddingHorizontal: 8}} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.text, padding: theme.spacing.xl, borderRadius: theme.borderRadius.l }]}>
        <Text style={[{ fontSize: 12, fontWeight: '700', letterSpacing: 1 }, { color: theme.colors.border, opacity: 0.8 }]}>Current Balance</Text>
        <Text style={[{ fontSize: 32, fontWeight: '800' }, { color: theme.colors.surface, marginVertical: theme.spacing.s }]}>
           {formatCurrency(totalIncome - totalExpense)}
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.m}}>
           <View><Text style={[{ color: theme.colors.border, fontSize: 12, fontWeight: '700', letterSpacing: 1 }]}>INCOME</Text><Text style={[{ color: theme.colors.surface, fontSize: 18, fontWeight: '800', marginTop: 4 }]}>{formatCurrency(totalIncome)}</Text></View>
           <View><Text style={[{ textAlign: 'right', color: theme.colors.border, fontSize: 12, fontWeight: '700', letterSpacing: 1 }]}>EXPENSE</Text><Text style={[{ textAlign: 'right', color: theme.colors.surface, fontSize: 18, fontWeight: '800', marginTop: 4 }]}>{formatCurrency(totalExpense)}</Text></View>
        </View>
      </Card>

      <View style={[styles.timelineBox, { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, paddingTop: theme.spacing.l }]}>
        <Text style={[{ fontSize: 18, fontWeight: '600', marginBottom: theme.spacing.m, marginLeft: theme.spacing.m }, { color: theme.colors.text }]}>Recent Transactions</Text>
        <FlatList 
          data={budgets.slice().reverse()} 
          keyExtractor={c => c.id} 
          renderItem={renderItem} 
          contentContainerStyle={{ paddingHorizontal: theme.spacing.m, paddingBottom: 100 }}
        />
      </View>
      
      <View style={[styles.fabContainer, { bottom: theme.spacing.m, right: theme.spacing.m, zIndex: 10 }]}>
         <Button title="Add Record" onPress={openCreateModal} icon="plus" style={{ borderRadius: 100 }} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }]}>
          <ScrollView contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface, padding: theme.spacing.l, paddingTop: theme.spacing.xl }]} showsVerticalScrollIndicator={false}>
             <Text style={[{ fontSize: 24, fontWeight: '700', marginBottom: theme.spacing.l }, { color: theme.colors.text }]}>{editingRecord ? 'Edit Transaction' : 'New Transaction'}</Text>
             
             <View style={[styles.selectorRow, { flexDirection: 'row', gap: theme.spacing.s, marginBottom: theme.spacing.xl }]}>
               <Button title="Expense" variant={type === 'expense' ? 'danger' : 'ghost'} onPress={() => setType('expense')} style={{flex:1}} />
               <Button title="Income" variant={type === 'income' ? 'secondary' : 'ghost'} onPress={() => setType('income')} style={{flex:1}} />
             </View>

             <TextInput 
               style={[styles.input, { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.m }]} 
               placeholder="Title (e.g. Pizza Party)" 
               placeholderTextColor={theme.colors.textSecondary}
               value={title} 
               onChangeText={setTitle} 
             />
             <TextInput 
               style={[styles.input, { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.m }]} 
               placeholder="Amount (₹)" 
               placeholderTextColor={theme.colors.textSecondary}
               value={amount} 
               onChangeText={setAmount} 
               keyboardType="numeric" 
             />

             <View style={[styles.modalActions, { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.s }]}>
               <Button title="Cancel" variant="ghost" style={{flex: 1}} onPress={() => { setModalVisible(false); setEditingRecord(null); }} />
               <Button title={editingRecord ? 'Save Changes' : 'Log Transaction'} style={{flex: 1}} onPress={handleAdd} loading={loading} />
             </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: { margin: 16 },
  timelineBox: { flex: 1 },
  transactionRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  amount: { fontSize: 16, fontWeight: '800' },
  fabContainer: { position: 'absolute' },
  modalBg: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  selectorRow: {},
  input: {},
  modalActions: {}
});
