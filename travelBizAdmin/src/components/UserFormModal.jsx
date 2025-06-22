import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { inviteUser, updateUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { label: 'Admin', value: 'admin' },
  { label: 'Driver', value: 'driver' },
  { label: 'Client', value: 'client' },
];
const STATUSES = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function UserFormModal({ visible, onClose, onSuccess, initialData }) {
  const { token } = useAuth();
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'client',
    phone: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (isEdit && initialData) {
        setForm({
          name: initialData.name || '',
          email: initialData.email || '',
          role: initialData.role || 'client',
          phone: initialData.phone || '',
          status: initialData.status || 'active',
        });
      } else {
        setForm({ name: '', email: '', role: 'client', phone: '', status: 'active' });
      }
    }
  }, [visible, isEdit, initialData]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.role) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }
    try {
      setLoading(true);
      if (isEdit) {
        await updateUser(token, initialData._id, form);
      } else {
        await inviteUser(token, form);
      }
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Could not save user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{isEdit ? 'Edit User' : 'New User'}</Text>
          <ScrollView>
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={v => handleChange('name', v)} placeholder="Full name" />
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={v => handleChange('email', v)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Role *</Text>
            <ScrollView horizontal style={styles.pickerRow}>
              {ROLES.map(r => (
                <TouchableOpacity key={r.value} style={[styles.pickerOption, form.role === r.value && styles.selectedOption]} onPress={() => handleChange('role', r.value)}>
                  <Text style={styles.pickerText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={v => handleChange('phone', v)} placeholder="Phone number" keyboardType="phone-pad" />
            <Text style={styles.label}>Status</Text>
            <ScrollView horizontal style={styles.pickerRow}>
              {STATUSES.map(s => (
                <TouchableOpacity key={s.value} style={[styles.pickerOption, form.status === s.value && styles.selectedOption]} onPress={() => handleChange('status', s.value)}>
                  <Text style={styles.pickerText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                <MaterialCommunityIcons name="close" size={20} color="#fff" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
                <Text style={styles.buttonText}>{isEdit ? 'Save' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pickerOption: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: '#2563eb',
  },
  pickerText: {
    color: '#1f2937',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
}); 