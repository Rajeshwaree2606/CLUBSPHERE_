import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { ThemeContext } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { certificates } = useContext(DataContext);
  const { theme } = useContext(ThemeContext);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleDisplayCert = (title) => {
    Alert.alert("Viewing Certificate", `Mock viewing UI for ${title}. PDF functionality would render here.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: 100, gap: theme.spacing.l }}>
      
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || 'S'}</Text>
        </View>
        <Text style={styles.nameText}>{user?.name}</Text>
        <Text style={styles.emailText}>{user?.email || 'student@test.com'}</Text>
        <View style={{ marginTop: theme.spacing.s }}>
          <Badge label={`Level ${user?.level || 1} ${user?.role}`} status="warning" />
        </View>
      </Card>

      {/* Gamification Badges */}
      <View>
        <Text style={styles.sectionTitle}>My Achievements</Text>
        <View style={styles.badgeGrid}>
           <Card style={styles.badgeItem}>
              <Text style={{ fontSize: 32 }}>🌱</Text>
              <Text style={styles.badgeText}>First Step</Text>
           </Card>
           {(user?.xp || 0) > 100 && (
             <Card style={[styles.badgeItem, { borderColor: theme.colors.accent, borderWidth: 1 }]}>
                <Text style={{ fontSize: 32 }}>🔥</Text>
                <Text style={styles.badgeText}>Active Member</Text>
             </Card>
           )}
           {(user?.xp || 0) > 300 && (
             <Card style={styles.badgeItem}>
                <Text style={{ fontSize: 32 }}>⭐</Text>
                <Text style={styles.badgeText}>Contributor</Text>
             </Card>
           )}
        </View>
      </View>

      {/* Certificates Section */}
      <View>
        <Text style={styles.sectionTitle}>My Certificates</Text>
        {certificates.length > 0 ? certificates.map((cert) => (
          <Card key={cert.id} style={styles.certCard}>
            <View style={styles.certIconBox}>
              <MaterialCommunityIcons name="certificate" size={24} color={theme.colors.secondary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={theme.typography.h3} numberOfLines={1}>{cert.eventTitle}</Text>
              <Text style={theme.typography.caption}>Issued: {cert.date}</Text>
            </View>
            <Button title="View" variant="outline" size="small" onPress={() => handleDisplayCert(cert.eventTitle)} />
          </Card>
        )) : (
           <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>No certificates earned yet.</Text>
        )}
      </View>

      <View style={styles.logoutContainer}>
         <Button title="Log Out" variant="danger" onPress={logout} icon="logout" />
      </View>

    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  profileCard: { alignItems: 'center', paddingVertical: theme.spacing.xl, marginTop: theme.spacing.s },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.m, ...theme.shadows.medium },
  avatarText: { fontSize: 36, fontWeight: '800', color: theme.colors.surface, marginTop: -4 },
  nameText: { ...theme.typography.h2, marginBottom: theme.spacing.xs },
  emailText: { ...theme.typography.body, color: theme.colors.textSecondary },
  sectionTitle: { ...theme.typography.h3, marginBottom: theme.spacing.m },
  badgeGrid: { flexDirection: 'row', gap: theme.spacing.s },
  badgeItem: { flex: 1, alignItems: 'center', padding: theme.spacing.m, marginBottom: 0 },
  badgeText: { ...theme.typography.caption, textAlign: 'center', marginTop: theme.spacing.s },
  certCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m, marginBottom: theme.spacing.m },
  certIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.secondaryLight, justifyContent: 'center', alignItems: 'center' },
  logoutContainer: { marginTop: theme.spacing.xl }
});
