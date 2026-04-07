import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { certificates } = useContext(DataContext);

  const handleDisplayCert = (title) => {
    Alert.alert("Viewing Certificate", `Mock viewing UI for ${title}. PDF functionality would render here.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.l }}>
      
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0] || 'S'}</Text></View>
        <Text style={[theme.typography.h2, {marginTop: theme.spacing.m}]}>{user?.name}</Text>
        <Badge label={`Level ${user?.level || 1} ${user?.role}`} status="warning" />
        <Text style={[theme.typography.caption, {marginTop: theme.spacing.s}]}>{user?.email || 'student@test.com'}</Text>
      </Card>

      {/* Gamification Badges */}
      <View>
        <Text style={[theme.typography.h3, styles.sectionTitle]}>My Badges</Text>
        <View style={styles.badgeGrid}>
           <Card style={styles.badgeItem}>
              <Text style={{ fontSize: 32 }}>🌱</Text>
              <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 4 }]}>First Step</Text>
           </Card>
           {(user?.xp || 0) > 100 && (
             <Card style={[styles.badgeItem, { borderColor: theme.colors.accent, borderWidth: 1 }]}>
                <Text style={{ fontSize: 32 }}>🔥</Text>
                <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 4 }]}>Active Member</Text>
             </Card>
           )}
           {(user?.xp || 0) > 300 && (
             <Card style={styles.badgeItem}>
                <Text style={{ fontSize: 32 }}>⭐</Text>
                <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 4 }]}>Contributor</Text>
             </Card>
           )}
        </View>
      </View>

      {/* Certificates Section */}
      <View>
        <Text style={[theme.typography.h3, styles.sectionTitle]}>My Certificates</Text>
        {certificates.length > 0 ? certificates.map((cert) => (
          <Card key={cert.id} style={styles.certCard}>
            <View style={{flex: 1}}>
              <Text style={theme.typography.h3} numberOfLines={1}>🏆 {cert.eventTitle}</Text>
              <Text style={theme.typography.caption}>Issued: {cert.date}</Text>
            </View>
            <Button title="View" variant="outline" size="sm" onPress={() => handleDisplayCert(cert.eventTitle)} style={{paddingVertical: 8, paddingHorizontal: 12}} />
          </Card>
        )) : (
           <Text style={theme.typography.caption}>No certificates earned yet.</Text>
        )}
      </View>

      <View style={{flex: 1, justifyContent: 'flex-end', marginTop: theme.spacing.xxl}}>
         <Button title="Log Out" variant="danger" onPress={logout} icon="logout" />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  profileCard: { alignItems: 'center', paddingVertical: theme.spacing.xl, marginTop: theme.spacing.s },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 36, fontWeight: '800', color: theme.colors.surface, marginTop: -4 },
  sectionTitle: { marginBottom: theme.spacing.s },
  certCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m },
  badgeGrid: { flexDirection: 'row', gap: theme.spacing.s },
  badgeItem: { flex: 1, alignItems: 'center', padding: theme.spacing.m }
});
