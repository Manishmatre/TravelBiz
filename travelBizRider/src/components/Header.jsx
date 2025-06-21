import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

/**
 * Props:
 * - title: string (main title)
 * - subtitle: string (optional subtitle)
 * - icon: string (emoji or icon, optional)
 * - leftActions: array of { icon: string, onPress: fn }
 * - rightActions: array of { icon: string, onPress: fn }
 * - infoRow: React node (optional, for status/info)
 * - children: React node (optional, for search/filters)
 * - style: custom style for header
 */
export default function Header({
  title,
  subtitle,
  icon,
  leftActions = [],
  rightActions = [],
  infoRow,
  children,
  style,
}) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          {leftActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.headerButton} onPress={action.onPress}>
              <Text style={styles.headerButtonIcon}>{action.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.headerTitleBox}>
          {icon && <Text style={styles.headerIcon}>{icon}</Text>}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.headerRight}>
          {rightActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.headerButton} onPress={action.onPress}>
              <Text style={styles.headerButtonIcon}>{action.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      {infoRow ? <View style={styles.headerInfo}>{infoRow}</View> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2563eb',
    paddingTop: Platform.OS === 'ios' ? 48 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  headerTitleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#dbeafe',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 2,
    fontWeight: '500',
  },
  headerInfo: {
    marginTop: 4,
    marginBottom: 2,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 2,
  },
  headerButtonIcon: {
    fontSize: 20,
    color: '#fff',
  },
}); 