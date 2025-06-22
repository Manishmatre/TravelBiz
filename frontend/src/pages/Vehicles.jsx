import React, { useEffect, useState } from 'react';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';
import VehicleFormModal from '../components/VehicleFormModal';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import { FaCar, FaPlus, FaSearch, FaFilter, FaDownload, FaEye, FaEdit, FaTrash, FaSyncAlt, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaTools, FaGasPump, FaFileAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';
import Notification from '../components/common/Notification';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

function Vehicles() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiclesPerPage] = useState(15);

  useEffect(() => {
    const fetchVehicles = async () => {
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
    if (token) fetchVehicles();
  }, [token]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = search ? (
      vehicle.name?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.numberPlate?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.vehicleType?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(search.toLowerCase())
    ) : true;
    
    const matchesStatus = statusFilter ? vehicle.status === statusFilter : true;
    const matchesType = typeFilter ? vehicle.vehicleType === typeFilter : true;
    const matchesDriver = driverFilter ? vehicle.driverName === driverFilter : true;
    
    return matchesSearch && matchesStatus && matchesType && matchesDriver;
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedVehicles.length / vehiclesPerPage);
  const paginatedVehicles = sortedVehicles.slice((currentPage - 1) * vehiclesPerPage, currentPage * vehiclesPerPage);

  // Before rendering the Table, normalize paginatedVehicles to ensure _id, name, and numberPlate are always defined and _id is always a non-empty string
  const safePaginatedVehicles = paginatedVehicles.map((v, idx) => {
    let safeId = v._id || v.id || `vehicle-${idx}-${Math.random().toString(36).slice(2)}`;
    if (!safeId || typeof safeId !== 'string') safeId = `vehicle-${idx}-${Math.random().toString(36).slice(2)}`;
    return {
      ...v,
      _id: safeId,
      name: v.name || 'Unknown',
      numberPlate: v.numberPlate || 'N/A',
    };
  });

  // Ensure selectedVehicles only contains valid, non-empty string ids
  const safeSelectedVehicles = selectedVehicles.filter(id => typeof id === 'string' && id.length > 0);

  // Vehicle statistics
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const onTripVehicles = vehicles.filter(v => v.status === 'on-trip').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const expiringInsurance = vehicles.filter(v => {
    if (!v.insuranceExpiry) return false;
    const expiryDate = new Date(v.insuranceExpiry);
    const now = new Date();
    const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }).length;
  const expiringPUC = vehicles.filter(v => {
    if (!v.pucExpiry) return false;
    const expiryDate = new Date(v.pucExpiry);
    const now = new Date();
    const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }).length;

  // Analytics data
  const statusData = [
    { name: 'Available', value: availableVehicles, color: '#10B981' },
    { name: 'On Trip', value: onTripVehicles, color: '#3B82F6' },
    { name: 'Maintenance', value: maintenanceVehicles, color: '#F59E0B' },
  ];

  const vehicleTypeData = (() => {
    const map = {};
    vehicles.forEach(v => {
      const type = v.vehicleType || 'Unknown';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const vehiclesByMonth = (() => {
    const map = {};
    vehicles.forEach(v => {
      const month = new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  })();

  const handleAddVehicle = async (form) => {
    try {
      await addVehicle(form, token);
      const updatedData = await getVehicles(token);
      setVehicles(updatedData);
      setModalOpen(false);
      setNotification({ message: 'Vehicle added successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
      setNotification({ message: err.response?.data?.message || 'Failed to add vehicle', type: 'error' });
    }
  };

  const handleEditVehicle = async (form) => {
    try {
      await updateVehicle(editVehicle._id, form, token);
      const updatedData = await getVehicles(token);
      setVehicles(updatedData);
      setEditVehicle(null);
      setModalOpen(false);
      setNotification({ message: 'Vehicle updated successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vehicle');
      setNotification({ message: err.response?.data?.message || 'Failed to update vehicle', type: 'error' });
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id, token);
      const updatedData = await getVehicles(token);
      setVehicles(updatedData);
      setNotification({ message: 'Vehicle deleted successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
      setNotification({ message: err.response?.data?.message || 'Failed to delete vehicle', type: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedVehicles.length} selected vehicles?`)) return;
    
    for (const id of selectedVehicles) {
      try {
        await deleteVehicle(id, token);
      } catch (err) {
        console.error(`Failed to delete vehicle ${id}:`, err);
      }
    }
    
    const updatedData = await getVehicles(token);
    setVehicles(updatedData);
    setSelectedVehicles([]);
    setNotification({ 
      message: `Successfully deleted ${selectedVehicles.length} vehicles!`, 
      type: 'success' 
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVehicles(token);
      setVehicles(data);
      setNotification({ message: 'Vehicles refreshed successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh data');
      setNotification({ 
        message: 'Failed to refresh vehicles: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!filteredVehicles.length) return;
    
    const headers = ['Name', 'Number Plate', 'Vehicle Type', 'Model', 'Driver', 'Status', 'Insurance Expiry', 'PUC Expiry', 'Created Date'];
    const csvData = filteredVehicles.map(vehicle => [
      vehicle.name,
      vehicle.numberPlate,
      vehicle.vehicleType,
      vehicle.model,
      vehicle.driverName,
      vehicle.status,
      vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '',
      vehicle.pucExpiry ? new Date(vehicle.pucExpiry).toLocaleDateString() : '',
      new Date(vehicle.createdAt).toLocaleDateString()
    ]);
    
    const csv = [headers, ...csvData].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-trip': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'none', color: 'text-gray-500' };
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'text-red-600' };
    if (daysUntilExpiry <= 7) return { status: 'critical', color: 'text-red-500' };
    if (daysUntilExpiry <= 30) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'valid', color: 'text-green-600' };
  };

  const columns = [
    { 
      label: 'Vehicle', 
      accessor: 'name',
      render: (v, row) => (
        <Link to={`/vehicles/${(row && row._id) ? row._id : 'unknown'}`} className="text-blue-700 hover:underline font-semibold">
          <div className="flex items-center gap-2">
            <FaCar className="text-gray-400" />
            <div>
              <div>{typeof v === 'string' ? v : (v?.name || 'Unknown')}</div>
              <div className="text-xs text-gray-500">{row && typeof row.numberPlate === 'string' ? row.numberPlate : 'N/A'}</div>
            </div>
          </div>
        </Link>
      )
    },
    { 
      label: 'Type & Model', 
      accessor: 'vehicleType',
      render: (v, row) => (
        <div>
          <div className="font-medium">{typeof v === 'string' ? v : (v?.name || 'N/A')}</div>
          {(row && typeof row.model === 'string') ? <div className="text-sm text-gray-500">{row.model}</div> : null}
        </div>
      )
    },
    { 
      label: 'Driver', 
      accessor: 'driverName',
      render: (v) => (
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400" />
          <span>{typeof v === 'string' ? v : (v?.name || 'Unassigned')}</span>
        </div>
      )
    },
    { 
      label: 'Status', 
      accessor: 'status',
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(v)}`}>
          {typeof v === 'string' ? v.replace('-', ' ').toUpperCase() : 'Unknown'}
        </span>
      )
    },
    { 
      label: 'Documents', 
      accessor: 'insuranceExpiry',
      render: (v, row) => {
        const insuranceStatus = getExpiryStatus(v);
        const pucStatus = getExpiryStatus(row && row.pucExpiry);
        return (
          <div className="space-y-1">
            <div className={`flex items-center gap-1 text-xs ${insuranceStatus.color}`}>
              {insuranceStatus.status === 'expired' ? <FaExclamationTriangle /> : <FaCheckCircle />}
              <span>Insurance: {typeof v === 'string' || typeof v === 'number' ? (v ? new Date(v).toLocaleDateString() : 'N/A') : 'N/A'}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${pucStatus.color}`}>
              {pucStatus.status === 'expired' ? <FaExclamationTriangle /> : <FaCheckCircle />}
              <span>PUC: {(row && (typeof row.pucExpiry === 'string' || typeof row.pucExpiry === 'number')) ? new Date(row.pucExpiry).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        );
      }
    },
    { 
      label: 'Created', 
      accessor: 'createdAt',
      render: (v) => (typeof v === 'string' || typeof v === 'number') && !isNaN(new Date(v)) ? new Date(v).toLocaleDateString() : 'N/A'
    },
  ];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isAllSelected = paginatedVehicles.length > 0 && paginatedVehicles.every(v => selectedVehicles.includes(v._id));
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVehicles(selectedVehicles.filter(id => !paginatedVehicles.some(v => v._id === id)));
    } else {
      setSelectedVehicles([
        ...selectedVehicles,
        ...paginatedVehicles.filter(v => !selectedVehicles.includes(v._id)).map(v => v._id)
      ]);
    }
  };
  const handleSelectOne = (id) => {
    setSelectedVehicles(selectedVehicles.includes(id)
      ? selectedVehicles.filter(vid => vid !== id)
      : [...selectedVehicles, id]);
  };

  const columnsWithCheckbox = [
    {
      label: <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />,
      accessor: '_checkbox',
      render: (val, row) => (
        <input
          type="checkbox"
          checked={safeSelectedVehicles.includes((row && row._id) ? row._id : '')}
          onChange={() => handleSelectOne((row && row._id) ? row._id : '')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      )
    },
    ...columns
  ];

  const uniqueVehicleTypes = [...new Set(vehicles.map(v => v.vehicleType).filter(Boolean))];
  const uniqueDrivers = [...new Set(vehicles.map(v => v.driverName).filter(Boolean))];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-1">Manage your fleet of vehicles and track their status</p>
        </div>
        <div className="flex gap-2">
          <Button 
            color="secondary" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <FaSyncAlt className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            color="primary" 
            onClick={() => { setEditVehicle(null); setModalOpen(true); }}
            className="flex items-center gap-2"
          >
            <FaPlus /> Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={<FaCar />} label="Total Vehicles" value={totalVehicles} accentColor="blue" />
        <StatCard icon={<FaCheckCircle />} label="Available" value={availableVehicles} accentColor="green" />
        <StatCard icon={<FaMapMarkerAlt />} label="On Trip" value={onTripVehicles} accentColor="blue" />
        <StatCard icon={<FaTools />} label="Maintenance" value={maintenanceVehicles} accentColor="yellow" />
        <StatCard icon={<FaExclamationTriangle />} label="Expiring Insurance" value={expiringInsurance} accentColor="orange" />
        <StatCard icon={<FaExclamationTriangle />} label="Expiring PUC" value={expiringPUC} accentColor="red" />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Vehicle Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Vehicle Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Vehicle Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleTypeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicles by Month */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">New Vehicles by Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vehiclesByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <SearchInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              className="w-64"
            />
            <Button
              color="secondary"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <FaFilter />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
          
          <div className="flex gap-2">
            {selectedVehicles.length > 0 && (
              <Button
                color="danger"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <FaTrash />
                Delete Selected ({selectedVehicles.length})
              </Button>
            )}
            <Button
              color="secondary"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <FaDownload />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <Dropdown
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'on-trip', label: 'On Trip' },
                { value: 'maintenance', label: 'Maintenance' }
              ]}
              className="w-full"
            />
            <Dropdown
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                ...uniqueVehicleTypes.map(type => ({ value: type, label: type }))
              ]}
              className="w-full"
            />
            <Dropdown
              value={driverFilter}
              onChange={e => setDriverFilter(e.target.value)}
              options={[
                { value: '', label: 'All Drivers' },
                ...uniqueDrivers.map(driver => ({ value: driver, label: driver }))
              ]}
              className="w-full"
            />
            <Dropdown
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              options={[
                { value: 'name', label: 'Sort by Name' },
                { value: 'numberPlate', label: 'Sort by Plate' },
                { value: 'vehicleType', label: 'Sort by Type' },
                { value: 'createdAt', label: 'Sort by Date' }
              ]}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * vehiclesPerPage) + 1} to {Math.min(currentPage * vehiclesPerPage, sortedVehicles.length)} of {sortedVehicles.length} vehicles
              </p>
              <div className="flex items-center gap-2">
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'} {sortBy}
                </Button>
              </div>
            </div>
            
            <Table
              columns={safeSelectedVehicles.length > 0 ? columnsWithCheckbox : columns}
              data={safePaginatedVehicles}
              actions={vehicle => (
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => { setEditVehicle(vehicle); setModalOpen(true); }}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteVehicle(vehicle._id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              )}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        color={currentPage === page ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <VehicleFormModal
        open={modalOpen}
        onClose={() => { setEditVehicle(null); setModalOpen(false); }}
        onSubmit={editVehicle ? handleEditVehicle : handleAddVehicle}
        initialData={editVehicle}
      />
    </div>
  );
}

export default Vehicles;