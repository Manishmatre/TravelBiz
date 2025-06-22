import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import ScreenLayout from '../../src/components/ScreenLayout';
import Header from '../../src/components/Header';
import UserCard from '../../src/components/UserCard';
import UserFormModal from '../../src/components/UserFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { getUsers } from '../../services/api';

const TABS = ['All', 'Drivers', 'Clients', 'Admins'];

export default function UsersScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) return;
      const data = await getUsers(token, activeTab);
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const renderTab = (tab) => (
    <TouchableOpacity 
      key={tab}
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      header={
        <Header 
          title="Users"
          rightActions={[{ icon: 'plus-circle-outline', onPress: () => setShowModal(true) }]}
        />
      }
    >
      <View style={styles.tabContainer}>
        {TABS.map(renderTab)}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => <UserCard user={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={{ paddingTop: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found for this role.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
      <UserFormModal 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={fetchUsers}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 4,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
}); 