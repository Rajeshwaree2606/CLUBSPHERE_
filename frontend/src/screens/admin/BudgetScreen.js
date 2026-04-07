import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TextInput, Modal, StyleSheet, ScrollView } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { theme } from '../../utils/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminBudgetScreen() {
  const { budgets, addBudget } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);

  const totalIncome = budgets.filter(b => b.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = budgets.filter(b => b.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const handleAdd = async () => {
    if (!title || !amount) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please input all data' });
      return;
    }
    setLoading(true);
    const res = await addBudget({ title, amount: parseFloat(amount), type, date: new Date().toISOString().split('T')[0] });
    setLoading(false);
    
    if (res.success) {
      setModalVisible(false);
      setTitle(''); setAmount('');
      Toast.show({ type: 'success', text1: 'Transaction Logged' });
    }
  };

  const renderItem = ({ item }) => {
    const isIncome = item.type === 'income';
    return (
      <View style={styles.transactionRow}>
        <View style={[styles.iconBox, { backgroundColor: isIncome ? theme.colors.secondaryLight : theme.colors.errorLight }]}>
           <MaterialCommunityIcons name={isIncome ? 'arrow-up' : 'arrow-down'} size={20} color={isIncome ? theme.colors.secondary : theme.colors.error} />
        </View>
        <View style={{flex: 1}}>
          <Text style={theme.typography.h3}>{item.title}</Text>
          <Text style={theme.typography.caption}>{item.date}</Text>
        </View>
        <Text style={[styles.amount, { color: isIncome ? theme.colors.secondary : theme.colors.error }]}>
          {isIncome ? '+' : '-'}${item.amount}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Text style={[theme.typography.caption, { color: theme.colors.surface, opacity: 0.8 }]}>Current Balance</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.surface, marginVertical: theme.spacing.s }]}>
           ${totalIncome - totalExpense}
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.m}}>
           <View><Text style={styles.summaryLabel}>INCOME</Text><Text style={styles.summaryValue}>${totalIncome}</Text></View>
           <View><Text style={[styles.summaryLabel, {textAlign: 'right'}]}>EXPENSE</Text><Text style={[styles.summaryValue, {textAlign: 'right'}]}>${totalExpense}</Text></View>
        </View>
      </Card>

      <View style={styles.timelineBox}>
        <Text style={[theme.typography.h3, { marginBottom: theme.spacing.m, marginLeft: theme.spacing.m }]}>Recent Transactions</Text>
        <FlatList 
          data={budgets.slice().reverse()} 
          keyExtractor={c => c.id} 
          renderItem={renderItem} 
          contentContainerStyle={{ paddingHorizontal: theme.spacing.m, paddingBottom: 100 }}
        />
      </View>
      
      <View style={styles.fabContainer}>
         <Button title="Add Record" onPress={() => setModalVisible(true)} icon="plus" style={{ borderRadius: 100 }} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
             <Text style={[theme.typography.h2, { marginBottom: theme.spacing.l }]}>New Transaction</Text>
             
             <View style={styles.selectorRow}>
               <Button title="Expense" variant={type === 'expense' ? 'danger' : 'ghost'} onPress={() => setType('expense')} style={{flex:1}} />
               <Button title="Income" variant={type === 'income' ? 'secondary' : 'ghost'} onPress={() => setType('income')} style={{flex:1}} />
             </View>

             <TextInput style={styles.input} placeholder="Title (e.g. Pizza Party)" value={title} onChangeText={setTitle} />
             <TextInput style={styles.input} placeholder="Amount ($)" value={amount} onChangeText={setAmount} keyboardType="numeric" />

             <View style={styles.modalActions}>
               <Button title="Cancel" variant="ghost" style={{flex: 1}} onPress={() => setModalVisible(false)} />
               <Button title="Log Transaction" style={{flex: 1}} onPress={handleAdd} loading={loading} />
             </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  summaryCard: { margin: theme.spacing.m, backgroundColor: theme.colors.text, padding: theme.spacing.xl, borderRadius: theme.borderRadius.l },
  summaryLabel: { color: theme.colors.border, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  summaryValue: { color: theme.colors.surface, fontSize: 18, fontWeight: '800', marginTop: 4 },
  timelineBox: { flex: 1, backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, paddingTop: theme.spacing.l },
  transactionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.m },
  amount: { fontSize: 16, fontWeight: '800' },
  fabContainer: { position: 'absolute', bottom: theme.spacing.m, left: theme.spacing.m, right: theme.spacing.m },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, paddingTop: theme.spacing.xl, borderTopLeftRadius: theme.borderRadius.l, borderTopRightRadius: theme.borderRadius.l },
  selectorRow: { flexDirection: 'row', gap: theme.spacing.s, marginBottom: theme.spacing.xl },
  input: { backgroundColor: theme.colors.background, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, fontSize: 16, color: theme.colors.text, marginBottom: theme.spacing.m },
  modalActions: { flexDirection: 'row', gap: theme.spacing.m, marginTop: theme.spacing.s }
});
