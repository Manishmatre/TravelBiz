import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomNav from '../src/components/BottomNav';

export default function Trips() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Trips</Text>
        <Text style={styles.placeholder}>This feature is coming soon.</Text>
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 