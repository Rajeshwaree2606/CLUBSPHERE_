import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LeaderboardScreen() {
  const { leaderboard } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  
  const styles = useMemo(() => getStyles(theme), [theme]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getRankBadgeProps = (rank) => {
      if (rank === 1) return { icon: 'trophy', color: theme.colors.accent, bg: theme.colors.accent + '20' };
      if (rank === 2) return { icon: 'medal', color: '#9CA3AF', bg: '#9CA3AF20' };
      if (rank === 3) return { icon: 'medal', color: '#B45309', bg: '#B4530920' };
      return { icon: 'star-circle', color: theme.colors.primary, bg: theme.colors.primaryLight };
  };

  const renderPodium = () => {
    if (top3.length === 0) return null;
    
    // Reorder for podium: 2nd, 1st, 3rd
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
      <View style={styles.podiumContainer}>
        {podiumOrder.map((item, index) => {
          const isFirst = item.rank === 1;
          const { icon, color, bg } = getRankBadgeProps(item.rank);
          const isMe = item.id === user?.id;

          return (
            <View key={item.id} style={[styles.podiumItem, isFirst ? styles.podiumFirst : styles.podiumOthers]}>
              <View style={[styles.avatarBox, { borderColor: color, borderWidth: isFirst ? 3 : 2 }]}>
                <Text style={[styles.avatarText, { color }]}>{item.name[0]}</Text>
                <View style={[styles.rankBadge, { backgroundColor: color }]}>
                  <Text style={styles.rankText}>{item.rank}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name={icon} size={isFirst ? 32 : 24} color={color} style={{ marginVertical: theme.spacing.xs }} />
              <Text style={[theme.typography.small, { fontWeight: '700', textAlign: 'center', color: isMe ? theme.colors.primary : theme.colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{item.xp} XP</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const isMe = item.id === user?.id;
    const { icon, color, bg } = getRankBadgeProps(item.rank);
    
    return (
      <View style={[styles.card, isMe && styles.myCard]}>
        <View style={styles.rankCol}>
           <Text style={[theme.typography.caption, { fontWeight: '700', color: theme.colors.textSecondary }]}>#{item.rank}</Text>
        </View>
        <View style={[styles.listAvatar, { backgroundColor: bg }]}>
          <Text style={[theme.typography.h3, { color }]}>{item.name[0]}</Text>
        </View>
        <View style={styles.userCol}>
           <Text style={[theme.typography.h3, isMe && {color: theme.colors.primary}]}>{item.name} {isMe ? '(You)' : ''}</Text>
           <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Level {item.level}</Text>
        </View>
        <Text style={[styles.xpText, { color: theme.colors.primary }]}>{item.xp} XP</Text>
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
         data={rest}
         keyExtractor={item => item.id}
         renderItem={renderItem}
         ListHeaderComponent={renderPodium}
         contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.s, paddingBottom: 100 }}
         showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBlock: { padding: theme.spacing.l, paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xxl, borderBottomLeftRadius: theme.borderRadius.l, borderBottomRightRadius: theme.borderRadius.l, ...theme.shadows.medium },
  podiumContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginTop: -40, marginBottom: theme.spacing.xl, gap: theme.spacing.m },
  podiumItem: { alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.l, ...theme.shadows.medium, width: '30%' },
  podiumFirst: { paddingVertical: theme.spacing.xl, zIndex: 10, ...theme.shadows.large },
  podiumOthers: { paddingVertical: theme.spacing.l },
  avatarBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarText: { fontSize: 24, fontWeight: '800' },
  rankBadge: { position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.surface },
  rankText: { color: 'white', fontSize: 10, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, ...theme.shadows.small },
  myCard: { borderWidth: 2, borderColor: theme.colors.primary },
  rankCol: { alignItems: 'center', width: 40 },
  listAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.m },
  userCol: { flex: 1 },
  xpText: { ...theme.typography.h3, fontWeight: '800' }
});
