import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.l }}>
      
      {/* Profile Card */}
      <Card style={[styles.profileCard, { alignItems: 'center', paddingVertical: theme.spacing.xl, marginTop: theme.spacing.s }]}>
        <View style={[styles.avatar, { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
           <Text style={[styles.avatarText, { fontSize: 36, fontWeight: '800', color: theme.colors.surface, marginTop: -4 }]}>
             {user?.name?.[0] || 'A'}
           </Text>
        </View>
        <Text style={[{ fontSize: 24, fontWeight: '700', marginTop: theme.spacing.m, color: theme.colors.text }]}>{user?.name || 'Administrator'}</Text>
        <Badge label="System Admin" status="primary" />
        <Text style={[{ fontSize: 12, color: theme.colors.textSecondary, marginTop: theme.spacing.s }]}>{user?.email || 'admin@test.com'}</Text>
      </Card>

      <View style={{flex: 1, justifyContent: 'flex-end', marginTop: theme.spacing.xxl}}>
         <Button title="Log Out" variant="danger" onPress={logout} icon="logout" />
      </View>

    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  profileCard: { ...theme.shadows.small },
  avatar: {},
  avatarText: {}
});
