import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const { user, logout } = useContext(AuthContext);
  const { clubs, events, budgets } = useContext(DataContext);
  
  const totalIncome = budgets.filter(b => b.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = budgets.filter(b => b.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const topClub = clubs.length > 0 ? clubs.reduce((prev, current) => (prev.memberCount > current.memberCount) ? prev : current) : null;
  const popularEvent = events.length > 0 ? events.find(e => e.joined) : null; // Simulating logic

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      
      {/* Overview Block */}
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={styles.gradientHeader}>
         <Text style={[theme.typography.caption, { color: theme.colors.surface, opacity: 0.8 }]}>Admin Control Center</Text>
         <Text style={[theme.typography.h1, { color: theme.colors.surface }]}>Welcome, {user?.name}</Text>
      </LinearGradient>

      <View style={{ padding: theme.spacing.m, gap: theme.spacing.xl }}>
        {/* Stats Grid */}
        <View style={styles.grid}>
        <Card style={styles.gridItem}>
           <View style={styles.iconCircle}><MaterialCommunityIcons name="google-circles-extended" size={24} color={theme.colors.primary} /></View>
           <Text style={[theme.typography.h1, { marginTop: theme.spacing.s }]}>{clubs.length}</Text>
           <Text style={theme.typography.small}>Total Clubs</Text>
        </Card>
        <Card style={styles.gridItem}>
           <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondaryLight }]}><MaterialCommunityIcons name="calendar-star" size={24} color={theme.colors.secondary} /></View>
           <Text style={[theme.typography.h1, { marginTop: theme.spacing.s }]}>{events.length}</Text>
           <Text style={theme.typography.small}>Total Events</Text>
        </Card>
      </View>

      {/* Finance Summary */}
      <Card>
        <Text style={[theme.typography.h3, { marginBottom: theme.spacing.l }]}>Financial Summary</Text>
        
        <View style={styles.financeRow}>
          <Text style={theme.typography.body}>Income</Text>
          <Text style={[theme.typography.h3, { color: theme.colors.secondary }]}>+${totalIncome}</Text>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.financeRow}>
          <Text style={theme.typography.body}>Expenses</Text>
          <Text style={[theme.typography.h3, { color: theme.colors.error }]}>-${totalExpense}</Text>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.financeRow}>
          <Text style={theme.typography.h3}>Net Balance</Text>
          <Text style={[theme.typography.h2, { color: (totalIncome - totalExpense) >= 0 ? theme.colors.text : theme.colors.error }]}>
            ${totalIncome - totalExpense}
          </Text>
        </View>
      </Card>

      {/* Insights Block */}
      <View>
        <Text style={[theme.typography.h3, { marginBottom: theme.spacing.s }]}>Intelligence System</Text>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, marginBottom: theme.spacing.m }}>
            <MaterialCommunityIcons name="trending-up" size={24} color={theme.colors.secondary} />
            <View style={{ flex: 1 }}>
               <Text style={theme.typography.caption}>Most Active Club 📈</Text>
               <Text style={theme.typography.h3}>{topClub?.name || 'N/A'}</Text>
            </View>
            <Badge label={`${topClub?.memberCount || 0} Mem`} status="primary" />
          </View>
          
          <View style={styles.divider} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, marginTop: theme.spacing.m }}>
            <MaterialCommunityIcons name="star-shooting" size={24} color={theme.colors.accent} />
            <View style={{ flex: 1 }}>
               <Text style={theme.typography.caption}>Highest Rating Event ⭐</Text>
               <Text style={theme.typography.h3}>{popularEvent?.title || 'No Events Booked'}</Text>
            </View>
          </View>
        </Card>
      </View>
      
      <Button title="Log Out" variant="danger" onPress={logout} icon="logout" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  gradientHeader: { padding: theme.spacing.l, paddingTop: theme.spacing.xxl, borderBottomLeftRadius: theme.borderRadius.xl, borderBottomRightRadius: theme.borderRadius.xl, ...theme.shadows.medium },
  grid: { flexDirection: 'row', gap: theme.spacing.m },
  gridItem: { flex: 1, alignItems: 'center', margin: 0 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: theme.spacing.xs },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.s }
});
