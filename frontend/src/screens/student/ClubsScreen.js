import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DataContext } from '../../context/DataContext';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ClubsScreen() {
  const { clubs, joinClub } = useContext(DataContext);
  const [loadingId, setLoadingId] = useState(null);

  const handleJoin = async (id) => {
    setLoadingId(id);
    const res = await joinClub(id);
    setLoadingId(null);
    if (res.success) Toast.show({ type: 'success', text1: 'Joined!', text2: 'Successfully joined the club.' });
  };

  const getIconForClub = (name) => {
    const l = name.toLowerCase();
    if (l.includes('code') || l.includes('tech')) return 'laptop';
    if (l.includes('photo')) return 'camera';
    if (l.includes('robot')) return 'robot';
    if (l.includes('art')) return 'palette';
    return 'account-group';
  };

  const renderItem = ({ item }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={getIconForClub(item.name)} size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={theme.typography.h3}>{item.name}</Text>
          <Text style={theme.typography.small}>{item.memberCount} Members</Text>
        </View>
      </View>
      <Text style={[theme.typography.body, styles.desc]}>{item.description}</Text>
      
      {item.joined ? (
        <Button variant="ghost" title="Joined" disabled icon="check-circle" />
      ) : (
        <Button 
          title="Join Club" 
          onPress={() => handleJoin(item.id)} 
          loading={loadingId === item.id} 
          icon="account-plus"
        />
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clubs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: theme.spacing.m }}
        ListHeaderComponent={<Text style={[theme.typography.h2, { marginBottom: theme.spacing.m }]}>Discover Clubs</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: theme.borderRadius.m, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.s },
  headerText: { flex: 1 },
  desc: { marginTop: theme.spacing.m, marginBottom: theme.spacing.l, color: theme.colors.textSecondary },
});
