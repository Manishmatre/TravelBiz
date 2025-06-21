import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileSecurityCard({ pwForm, onPwFormChange, onSubmit, isLoading }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Security</Text>
      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#9ca3af" />
          <TextInput
            style={styles.input}
            value={pwForm.oldPassword}
            onChangeText={v => onPwFormChange('oldPassword', v)}
            placeholder="Current Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-plus-outline" size={20} color="#9ca3af" />
          <TextInput
            style={styles.input}
            value={pwForm.newPassword}
            onChangeText={v => onPwFormChange('newPassword', v)}
            placeholder="New Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={onSubmit} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Changing...' : 'Change Password'}</Text>
        </TouchableOpacity>
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
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: 16, 
    marginLeft: 8,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 