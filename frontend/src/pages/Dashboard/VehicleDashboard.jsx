import React, { useEffect, useState } from 'react';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getVehicles } from '../../services/vehicleService';
import { FaCar, FaExclamationTriangle, FaTools } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Dropdown from '../../components/common/Dropdown';
import SearchInput from '../../components/common/SearchInput';

const tableColumns = [
  { label: 'Vehicle', accessor: 'name' },
  { label: 'Type', accessor: 'vehicleType' },
  { label: 'Status', accessor: 'status' },
  { label: 'Insurance Expiry', accessor: 'insuranceExpiry', render: v => v ? new Date(v).toLocaleDateString() : '-' },
];

function VehicleDashboard() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getVehicles(token);
        setVehicles(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // Stat cards
  const total = vehicles.length;
  const available = vehicles.filter(v => v.status === 'available').length;
  const onTrip = vehicles.filter(v => v.status === 'on-trip').length;
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
  const expiringInsurance = vehicles.filter(v => v.insuranceExpiry && (new Date(v.insuranceExpiry) - new Date())/(1000*60*60*24) <= 30 && (new Date(v.insuranceExpiry) - new Date())/(1000*60*60*24) >= 0).length;
  const expiringPUC = vehicles.filter(v => v.pucExpiry && (new Date(v.pucExpiry) - new Date())/(1000*60*60*24) <= 30 && (new Date(v.pucExpiry) - new Date())/(1000*60*60*24) >= 0).length;
  const stats = [
    { label: 'Total Vehicles', value: total, icon: <FaCar />, accentColor: 'blue' },
    { label: 'Available', value: available, icon: <FaCar />, accentColor: 'green' },
    { label: 'On Trip', value: onTrip, icon: <FaCar />, accentColor: 'yellow' },
    { label: 'Maintenance', value: maintenance, icon: <FaTools />, accentColor: 'red' },
    { label: 'Expiring Insurance', value: expiringInsurance, icon: <FaExclamationTriangle />, accentColor: 'orange' },
    { label: 'Expiring PUC', value: expiringPUC, icon: <FaExclamationTriangle />, accentColor: 'purple' },
  ];

  // Filtering logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = search ? (
      Object.values(v).some(val => val && val.toString().toLowerCase().includes(search.toLowerCase()))
    ) : true;
    const matchesStatus = statusFilter ? v.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vehicle Management Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} accentColor={stat.accentColor} />
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold">All Vehicles</div>
          <Button color="primary" size="sm">View All</Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search any field..."
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'available', label: 'Available' },
              { value: 'on-trip', label: 'On Trip' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>
        {loading ? <Loader /> : error ? <div className="text-red-500">{error}</div> : (
          <Table columns={tableColumns} data={filteredVehicles} />
        )}
      </div>
    </div>
  );
}

export default VehicleDashboard; 