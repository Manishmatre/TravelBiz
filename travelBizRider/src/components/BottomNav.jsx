import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs = [
  { name: 'Dashboard', route: '/dashboard', icon: 'view-dashboard' },
  { name: 'Trips', route: '/trips', icon: 'map-marker-path' },
  { name: 'Location', route: '/location', icon: 'crosshairs-gps' },
  { name: 'Profile', route: '/profile', icon: 'account-circle' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { bottom } = useSafeAreaInsets();

  const handlePress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };

  const getIconName = (icon, isActive) => {
    if (isActive) return icon;
    
    // Try outline version first, fallback to regular icon
    const outlineIcon = `${icon}-outline`;
    // For now, we'll use the regular icon with reduced opacity for inactive state
    return icon;
  };

  return (
    <View style={[styles.container, { height: 70 + bottom, paddingBottom: bottom }]}>
      {tabs.map(tab => {
        const isActive = pathname.startsWith(tab.route);
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => handlePress(tab.route)}
          >
            <View style={[styles.tabContent, isActive && styles.activeTabContent]}>
              <MaterialCommunityIcons
                name={getIconName(tab.icon, isActive)}
                size={26}
                color={isActive ? '#fff' : '#9ca3af'}
              />
              {isActive && (
                <Text style={styles.label}>{tab.name}</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  activeTabContent: {
    backgroundColor: '#2563eb',
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 2,
  },
}); 