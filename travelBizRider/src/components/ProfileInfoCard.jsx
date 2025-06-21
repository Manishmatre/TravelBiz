import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={22} color="#6b7280" style={styles.infoIcon} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
  </View>
);

export default function ProfileInfoCard({ title, items }) {
  const visibleItems = items.filter(Boolean);
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {visibleItems.map((item, index) => (
          <InfoRow
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 12 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoIcon: { 
    marginRight: 12 
  },
  infoLabel: { 
    fontSize: 15, 
    color: '#6b7280', 
    width: 110 
  },
  infoValue: { 
    flex: 1, 
    fontSize: 15, 
    color: '#1f2937', 
    fontWeight: '500', 
    textAlign: 'left' 
  },
}); 