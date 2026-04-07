import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LeaderboardScreen() {
  const { leaderboard } = useContext(DataContext);
  const { user } = useContext(AuthContext);

  const getRankBadgeProps = (rank) => {
      if (rank === 1) return { status: 'warning', icon: 'trophy', color: theme.colors.accent };
      if (rank === 2) return { status: 'neutral', icon: 'medal', color: '#9CA3AF' };
      if (rank === 3) return { status: 'danger', icon: 'medal', color: '#B45309' }; // Bronze
      return { status: 'primary', icon: 'star-circle', color: theme.colors.primary };
  };

  const renderItem = ({ item }) => {
    const isMe = item.id === user?.id;
    const { status, icon, color } = getRankBadgeProps(item.rank);
    
    return (
      <View style={[styles.card, isMe && styles.myCard]}>
        <View style={styles.rankCol}>
           <Text style={theme.typography.caption}>#{item.rank}</Text>
           <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <View style={styles.userCol}>
           <Text style={[theme.typography.h3, isMe && {color: theme.colors.primary}]}>{item.name} {isMe ? '(You)' : ''}</Text>
           <Text style={theme.typography.caption}>Level {item.level}</Text>
        </View>
        <Text style={[styles.xpText, { color }]}>{item.xp} XP</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={styles.headerBlock}>
         <Text style={[theme.typography.h1, { color: theme.colors.surface, textAlign: 'center' }]}>Top Contributors</Text>
         <Text style={[theme.typography.caption, { color: theme.colors.surface, textAlign: 'center', opacity: 0.8 }]}>Climb the ranks by joining clubs and attending events!</Text>
      </LinearGradient>
      
      <FlatList 
         data={leaderboard}
         keyExtractor={item => item.id}
         renderItem={renderItem}
         contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.s }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBlock: { padding: theme.spacing.l, paddingTop: theme.spacing.xxl, marginBottom: theme.spacing.m },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, ...theme.shadows.small },
  myCard: { borderWidth: 2, borderColor: theme.colors.primary },
  rankCol: { alignItems: 'center', width: 40, marginRight: theme.spacing.m },
  userCol: { flex: 1 },
  xpText: { ...theme.typography.h3, fontWeight: '800' }
});
