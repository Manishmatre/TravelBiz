import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUsers, getVehicles, createBooking, updateBooking } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingFormModal({ visible, onClose, onSuccess, initialData }) {
  const { token } = useAuth();
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    client: '',
    driver: '',
    vehicle: '',
    pickup: '',
    destination: '',
    startDate: '',
    endDate: '',
    payment: { amountPaid: '', mode: '' },
  });
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchData();
      if (isEdit && initialData) {
        setForm({
          client: initialData.client?._id || '',
          driver: initialData.driver?._id || '',
          vehicle: initialData.vehicle?._id || '',
          pickup: initialData.pickup || '',
          destination: initialData.destination || '',
          startDate: initialData.startDate || '',
          endDate: initialData.endDate || '',
          payment: {
            amountPaid: initialData.payment?.amountPaid?.toString() || '',
            mode: initialData.payment?.mode || '',
          },
        });
      } else {
        setForm({
          client: '', driver: '', vehicle: '', pickup: '', destination: '', startDate: '', endDate: '', payment: { amountPaid: '', mode: '' }
        });
      }
    }
  }, [visible, isEdit, initialData]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [clientsData, driversData, vehiclesData] = await Promise.all([
        getUsers(token, 'Clients'),
        getUsers(token, 'Drivers'),
        getVehicles(token),
      ]);
      setClients(clientsData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch form data.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith('payment.')) {
      setForm(f => ({ ...f, payment: { ...f.payment, [field.split('.')[1]]: value } }));
    } else {
      setForm(f => ({ ...f, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.client || !form.pickup || !form.destination || !form.payment.amountPaid || !form.payment.mode) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }
    try {
      setLoading(true);
      if (isEdit) {
        await updateBooking(token, initialData._id, form);
      } else {
        await createBooking(token, form);
      }
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Could not save booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{isEdit ? 'Edit Booking' : 'New Booking'}</Text>
          {fetching ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <ScrollView>
              <Text style={styles.label}>Client *</Text>
              <ScrollView horizontal style={styles.pickerRow}>
                {clients.map(c => (
                  <TouchableOpacity key={c._id} style={[styles.pickerOption, form.client === c._id && styles.selectedOption]} onPress={() => handleChange('client', c._id)}>
                    <Text style={styles.pickerText}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.label}>Driver</Text>
              <ScrollView horizontal style={styles.pickerRow}>
                {drivers.map(d => (
                  <TouchableOpacity key={d._id} style={[styles.pickerOption, form.driver === d._id && styles.selectedOption]} onPress={() => handleChange('driver', d._id)}>
                    <Text style={styles.pickerText}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.label}>Vehicle</Text>
              <ScrollView horizontal style={styles.pickerRow}>
                {vehicles.map(v => (
                  <TouchableOpacity key={v._id} style={[styles.pickerOption, form.vehicle === v._id && styles.selectedOption]} onPress={() => handleChange('vehicle', v._id)}>
                    <Text style={styles.pickerText}>{v.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.label}>Pickup *</Text>
              <TextInput style={styles.input} value={form.pickup} onChangeText={v => handleChange('pickup', v)} placeholder="Pickup location" />
              <Text style={styles.label}>Destination *</Text>
              <TextInput style={styles.input} value={form.destination} onChangeText={v => handleChange('destination', v)} placeholder="Destination" />
              <Text style={styles.label}>Start Date</Text>
              <TextInput style={styles.input} value={form.startDate} onChangeText={v => handleChange('startDate', v)} placeholder="YYYY-MM-DD" />
              <Text style={styles.label}>End Date</Text>
              <TextInput style={styles.input} value={form.endDate} onChangeText={v => handleChange('endDate', v)} placeholder="YYYY-MM-DD" />
              <Text style={styles.label}>Payment Amount *</Text>
              <TextInput style={styles.input} value={form.payment.amountPaid} onChangeText={v => handleChange('payment.amountPaid', v)} placeholder="$" keyboardType="numeric" />
              <Text style={styles.label}>Payment Mode *</Text>
              <TextInput style={styles.input} value={form.payment.mode} onChangeText={v => handleChange('payment.mode', v)} placeholder="e.g. Cash, Card" />
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
          )}
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