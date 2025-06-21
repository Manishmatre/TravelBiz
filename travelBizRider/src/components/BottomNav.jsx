import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const tabs = [
  { label: 'Dashboard', route: '/dashboard' },
  { label: 'Trips', route: '/trips' },
  { label: 'Location', route: '/location' },
  { label: 'Profile', route: '/profile' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.route}
          style={[styles.tab, pathname.startsWith(tab.route) && styles.activeTab]}
          onPress={() => router.push(tab.route)}
        >
          <Text style={[styles.label, pathname.startsWith(tab.route) && styles.activeLabel]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
    color: '#888',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#007bff',
  },
  activeLabel: {
    color: '#007bff',
    fontWeight: 'bold',
  },
}); 