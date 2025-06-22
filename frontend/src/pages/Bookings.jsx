import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, addBooking, deleteBooking } from '../services/bookingService';
import { getClients } from '../services/clientService';
import { getUsers } from '../services/userService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/common/StatCard';
import { FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaMoneyBillWave, FaPlus, FaFilter, FaSearch, FaEye, FaEdit, FaTrash, FaSyncAlt, FaDownload, FaMapMarkerAlt, FaUser, FaCar } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useBookings } from '../contexts/BookingsContext';
import Notification from '../components/common/Notification';

function Bookings({ filterStatus: initialFilterStatus, view, filterDate }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const bookingsContext = useBookings();
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus || '');
  const [filterDateRange, setFilterDateRange] = useState(filterDate || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newBooking, setNewBooking] = useState({ client: '', agent: '', startDate: '', endDate: '', destination: '', status: 'Pending', price: '', notes: '' });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [bookingsPerPage] = useState(15);

  // Use context if available, otherwise use local state
  const bookings = bookingsContext?.bookings || [];
  const loading = bookingsContext?.loading || false;
  const fetchBookings = bookingsContext?.fetchBookings;

  useEffect(() => {
    getClients(token).then(setClients);
    getUsers({ role: 'agent' }, token).then(setAgents);
  }, [token]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.destination?.toLowerCase().includes(search.toLowerCase()) ||
      (b.client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.agent?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.vehicle?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesClient = filterClient ? String(b.client?._id) === filterClient : true;
    const matchesAgent = filterAgent ? String(b.agent?._id) === filterAgent : true;
    const matchesStatus = filterStatus ? b.status === filterStatus : true;
    
    // Date filtering
    let matchesDate = true;
    if (filterDateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = b.startDate ? new Date(b.startDate) : null;
      
      if (filterDateRange === 'today' && bookingDate) {
        const bookingDay = new Date(bookingDate);
        bookingDay.setHours(0, 0, 0, 0);
        matchesDate = bookingDay.getTime() === today.getTime();
      } else if (filterDateRange === 'upcoming' && bookingDate) {
        matchesDate = bookingDate > today;
      } else if (filterDateRange === 'overdue' && bookingDate) {
        matchesDate = bookingDate < today && b.status !== 'Completed' && b.status !== 'Cancelled';
      } else if (filterDateRange === 'this-week' && bookingDate) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        matchesDate = bookingDate >= weekStart && bookingDate <= weekEnd;
      } else if (filterDateRange === 'this-month' && bookingDate) {
        matchesDate = bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear();
      }
    }
    
    return matchesSearch && matchesClient && matchesAgent && matchesStatus && matchesDate;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    if (sortBy === 'startDate' || sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);
  const paginatedBookings = sortedBookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);

  const handleInput = e => {
    const { name, value } = e.target;
    setNewBooking(b => ({ ...b, [name]: value }));
  };

  const handleAddBooking = async () => {
    setAdding(true);
    try {
      await addBooking(newBooking, token);
      setModalOpen(false);
      setNewBooking({ client: '', agent: '', startDate: '', endDate: '', destination: '', status: 'Pending', price: '', notes: '' });
      if (fetchBookings) {
        await fetchBookings();
      }
      setNotification({ message: 'Booking added successfully!', type: 'success' });
    } catch (e) {
      setNotification({ message: e.response?.data?.message || 'Failed to add booking', type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteBooking = async () => {
    setDeleting(true);
    try {
      await deleteBooking(selectedBooking._id, token);
      setDeleteModalOpen(false);
      setSelectedBooking(null);
      if (fetchBookings) {
        await fetchBookings();
      }
      setNotification({ message: 'Booking deleted successfully!', type: 'success' });
    } catch (e) {
      setNotification({ message: e.response?.data?.message || 'Failed to delete booking', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedBookings.length} selected bookings?`)) return;
    
    for (const id of selectedBookings) {
      try {
        await deleteBooking(id, token);
      } catch (err) {
        console.error(`Failed to delete booking ${id}:`, err);
      }
    }
    
    if (fetchBookings) {
      await fetchBookings();
    }
    setSelectedBookings([]);
    setNotification({ 
      message: `Successfully deleted ${selectedBookings.length} bookings!`, 
      type: 'success' 
    });
  };

  const handleRefresh = async () => {
    if (!fetchBookings) return;
    
    try {
      await fetchBookings();
      setNotification({ message: 'Bookings refreshed successfully!', type: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh bookings');
      setNotification({ 
        message: 'Failed to refresh bookings: ' + (err.response?.data?.message || err.message), 
        type: 'error' 
      });
    }
  };

  // Stats calculation
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Analytics data
  const bookingsByDate = (() => {
    const map = {};
    bookings.forEach(b => {
      const date = b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Unknown';
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  })();
  
  const revenueByDate = (() => {
    const map = {};
    bookings.forEach(b => {
      const date = b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Unknown';
      map[date] = (map[date] || 0) + (Number(b.price) || 0);
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  })();
  
  const statusColors = {
    Pending: '#facc15',
    Confirmed: '#22c55e',
    Completed: '#14b8a6',
    Cancelled: '#ef4444',
  };
  
  const bookingsByStatus = [
    { name: 'Pending', value: pendingCount },
    { name: 'Confirmed', value: confirmedCount },
    { name: 'Completed', value: completedCount },
    { name: 'Cancelled', value: cancelledCount },
  ];

  // Bookings by Agent
  const bookingsByAgent = (() => {
    const map = {};
    bookings.forEach(b => {
      const agent = b.agent?.name || 'Unknown';
      map[agent] = (map[agent] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();
  
  // Bookings by Destination
  const bookingsByDestination = (() => {
    const map = {};
    bookings.forEach(b => {
      const dest = b.destination || 'Unknown';
      map[dest] = (map[dest] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // CSV Export
  function exportCSV(rows) {
    if (!rows.length) return;
    const header = Object.keys(rows[0]);
    const csv = [header.join(',')].concat(
      rows.map(row => header.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Recent Activity Feed
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
    .slice(0, 10);

  const getPageTitle = () => {
    if (view === 'calendar') return 'Booking Calendar';
    if (view === 'reports') return 'Booking Reports';
    if (filterDateRange === 'today') return 'Today\'s Bookings';
    if (filterDateRange === 'upcoming') return 'Upcoming Bookings';
    if (filterDateRange === 'overdue') return 'Overdue Bookings';
    if (filterStatus) return `${filterStatus} Bookings`;
    return 'All Bookings';
  };

  const getPageDescription = () => {
    if (view === 'calendar') return 'Calendar view of all bookings';
    if (view === 'reports') return 'Analytics and reports for bookings';
    if (filterDateRange === 'today') return 'Bookings scheduled for today';
    if (filterDateRange === 'upcoming') return 'Future bookings and reservations';
    if (filterDateRange === 'overdue') return 'Past bookings that are not completed or cancelled';
    if (filterStatus) return `Showing ${filterStatus.toLowerCase()} bookings`;
    return 'Manage all client bookings and reservations';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { 
      label: 'Booking', 
      accessor: 'destination',
      render: (v, row) => (
        <div>
          <div className="font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => navigate(`/bookings/${row._id}`)}>
            {v}
          </div>
          <div className="text-sm text-gray-500">
            {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'No date'} - {row.endDate ? new Date(row.endDate).toLocaleDateString() : 'No end date'}
          </div>
        </div>
      )
    },
    { 
      label: 'Client', 
      accessor: 'client',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400" />
          <span>{v?.name || 'Unknown'}</span>
        </div>
      )
    },
    { 
      label: 'Agent', 
      accessor: 'agent',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <FaUserTie className="text-gray-400" />
          <span>{v?.name || 'Unassigned'}</span>
        </div>
      )
    },
    { 
      label: 'Vehicle', 
      accessor: 'vehicle',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <FaCar className="text-gray-400" />
          <span>{v?.name || 'Unassigned'}</span>
        </div>
      )
    },
    { 
      label: 'Status', 
      accessor: 'status',
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(v)}`}>
          {v}
        </span>
      )
    },
    { 
      label: 'Price', 
      accessor: 'price',
      render: (v) => (
        <span className="font-medium text-green-600">
          ${Number(v || 0).toLocaleString()}
        </span>
      )
    },
    { 
      label: 'Created', 
      accessor: 'createdAt',
      render: (v) => new Date(v).toLocaleDateString()
    },
  ];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isAllSelected = paginatedBookings.length > 0 && paginatedBookings.every(b => selectedBookings.includes(b._id));
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBookings(selectedBookings.filter(id => !paginatedBookings.some(b => b._id === id)));
    } else {
      setSelectedBookings([
        ...selectedBookings,
        ...paginatedBookings.filter(b => !selectedBookings.includes(b._id)).map(b => b._id)
      ]);
    }
  };
  const handleSelectOne = (id) => {
    setSelectedBookings(selectedBookings.includes(id)
      ? selectedBookings.filter(bid => bid !== id)
      : [...selectedBookings, id]);
  };

  const columnsWithCheckbox = [
    {
      label: <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />,
      accessor: '_checkbox',
      render: (val, row) => (
        <input
          type="checkbox"
          checked={selectedBookings.includes(row._id)}
          onChange={() => handleSelectOne(row._id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      )
    },
    ...columns
  ];

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
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-1">{getPageDescription()}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            color="secondary" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading || !fetchBookings}
          >
            <FaSyncAlt className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            color="primary" 
            onClick={() => navigate('/bookings/add')}
            className="flex items-center gap-2"
          >
            <FaPlus /> New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={<FaCalendarAlt />} label="Total Bookings" value={totalBookings} accentColor="blue" />
        <StatCard icon={<FaHourglassHalf />} label="Pending" value={pendingCount} accentColor="yellow" />
        <StatCard icon={<FaCheckCircle />} label="Confirmed" value={confirmedCount} accentColor="green" />
        <StatCard icon={<FaCheckCircle />} label="Completed" value={completedCount} accentColor="emerald" />
        <StatCard icon={<FaTimesCircle />} label="Cancelled" value={cancelledCount} accentColor="red" />
        <StatCard icon={<FaMoneyBillWave />} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} accentColor="teal" />
      </div>

      {/* Analytics Charts Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Booking Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Bookings Over Time */}
          <div>
            <h3 className="font-semibold mb-2">Bookings Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bookingsByDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Bookings by Status */}
          <div>
            <h3 className="font-semibold mb-2">Bookings by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={bookingsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {bookingsByStatus.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={statusColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Revenue Over Time */}
          <div>
            <h3 className="font-semibold mb-2">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueByDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bookings by Agent */}
          <div>
            <h3 className="font-semibold mb-2">Bookings by Agent</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bookingsByAgent} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Bookings by Destination */}
          <div>
            <h3 className="font-semibold mb-2">Bookings by Destination</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bookingsByDestination} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e42" />
              </BarChart>
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
              placeholder="Search bookings..."
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
            {selectedBookings.length > 0 && (
              <Button
                color="danger"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <FaTrash />
                Delete Selected ({selectedBookings.length})
              </Button>
            )}
            <Button
              color="secondary"
              onClick={() => exportCSV(filteredBookings)}
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
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              options={[
                { value: '', label: 'All Clients' },
                ...clients.map(client => ({ value: client._id, label: client.name }))
              ]}
              className="w-full"
            />
            <Dropdown
              value={filterAgent}
              onChange={e => setFilterAgent(e.target.value)}
              options={[
                { value: '', label: 'All Agents' },
                ...agents.map(agent => ({ value: agent._id, label: agent.name }))
              ]}
              className="w-full"
            />
            <Dropdown
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Confirmed', label: 'Confirmed' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              className="w-full"
            />
            <Dropdown
              value={filterDateRange}
              onChange={e => setFilterDateRange(e.target.value)}
              options={[
                { value: '', label: 'All Dates' },
                { value: 'today', label: 'Today' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'this-week', label: 'This Week' },
                { value: 'this-month', label: 'This Month' }
              ]}
              className="w-full"
            />
            <Dropdown
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              options={[
                { value: 'startDate', label: 'Sort by Date' },
                { value: 'destination', label: 'Sort by Destination' },
                { value: 'price', label: 'Sort by Price' },
                { value: 'status', label: 'Sort by Status' },
                { value: 'createdAt', label: 'Sort by Created' }
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
                Showing {((currentPage - 1) * bookingsPerPage) + 1} to {Math.min(currentPage * bookingsPerPage, sortedBookings.length)} of {sortedBookings.length} bookings
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
              columns={selectedBookings.length > 0 ? columnsWithCheckbox : columns}
              data={paginatedBookings}
              actions={booking => (
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => navigate(`/bookings/${booking._id}`)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => navigate(`/bookings/${booking._id}/edit`)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => { setSelectedBooking(booking); setDeleteModalOpen(true); }}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Booking"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this booking? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              color="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDeleteBooking}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Bookings; 