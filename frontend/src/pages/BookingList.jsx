import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBookings, deleteBooking } from '../services/bookingService';
import { getClients } from '../services/clientService';
import { getUsers } from '../services/userService';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';
import SearchInput from '../components/common/SearchInput';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus, FaSearch, FaEye, FaTrash, FaCalendarAlt, FaUsers, FaUserTie, FaCar } from 'react-icons/fa';
import { useBookings } from '../contexts/BookingsContext';
import Notification from '../components/common/Notification';
import StatCard from '../components/common/StatCard';
import PageHeading from '../components/common/PageHeading';
import Card from '../components/common/Card';

function BookingList({ filterStatus: initialFilterStatus, filterDate }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const bookingsContext = useBookings();
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus || '');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);

  // Use context if available, otherwise use local state
  const bookings = bookingsContext?.bookings || [];
  const loading = bookingsContext?.loading || false;
  const fetchBookings = bookingsContext?.fetchBookings;

  const bookingsPerPage = 10;

  useEffect(() => {
    getClients(token).then(setClients);
    getUsers({ role: 'agent' }, token).then(setAgents);
  }, [token]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.destination?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.pickup?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (b.client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.agent?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.bookingNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesClient = filterClient ? String(b.client?._id) === filterClient : true;
    const matchesAgent = filterAgent ? String(b.agent?._id) === filterAgent : true;
    const matchesStatus = filterStatus ? b.status === filterStatus : true;
    
    // Date filtering
    let matchesDate = true;
    if (filterDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = b.startDate ? new Date(b.startDate) : null;
      
      if (filterDate === 'today' && bookingDate) {
        const bookingDay = new Date(bookingDate);
        bookingDay.setHours(0, 0, 0, 0);
        matchesDate = bookingDay.getTime() === today.getTime();
      } else if (filterDate === 'upcoming' && bookingDate) {
        matchesDate = bookingDate > today;
      } else if (filterDate === 'overdue' && bookingDate) {
        matchesDate = bookingDate < today && b.status !== 'Completed' && b.status !== 'Cancelled';
      }
    }
    
    return matchesSearch && matchesClient && matchesAgent && matchesStatus && matchesDate;
  });

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

  const handleRefresh = async () => {
    if (fetchBookings) {
      await fetchBookings();
      setNotification({ message: 'Bookings refreshed successfully!', type: 'success' });
    }
  };

  // Pagination
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Get page title based on filters
  const getPageTitle = () => {
    if (filterStatus) return `${filterStatus} Bookings`;
    if (filterDate === 'today') return "Today's Bookings";
    if (filterDate === 'upcoming') return 'Upcoming Bookings';
    if (filterDate === 'overdue') return 'Overdue Bookings';
    return 'All Bookings';
  };

  const getPageDescription = () => {
    if (filterStatus) return `Showing ${filterStatus.toLowerCase()} bookings`;
    if (filterDate === 'today') return 'Bookings scheduled for today';
    if (filterDate === 'upcoming') return 'Future bookings';
    if (filterDate === 'overdue') return 'Past bookings that are not completed';
    return `Showing ${filteredBookings.length} bookings`;
  };

  // Booking statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;

  function getStatusColor(status) {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

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
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaCalendarAlt />}
          title={getPageTitle()}
          subtitle={getPageDescription()}
          iconColor="text-blue-600"
        >
          <Button 
            color="secondary" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading || !fetchBookings}
          >
            <FaCalendarAlt className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            color="primary" 
            onClick={() => navigate('/bookings/add')}
            className="flex items-center gap-2"
          >
            <FaPlus /> New Booking
          </Button>
        </PageHeading>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<FaCalendarAlt />} label="Total Bookings" value={totalBookings} accentColor="blue" />
        <StatCard icon={<FaCalendarAlt />} label="Pending" value={pendingBookings} accentColor="yellow" />
        <StatCard icon={<FaCalendarAlt />} label="Confirmed" value={confirmedBookings} accentColor="green" />
        <StatCard icon={<FaCalendarAlt />} label="Completed" value={completedBookings} accentColor="blue" />
        <StatCard icon={<FaCalendarAlt />} label="Cancelled" value={cancelledBookings} accentColor="red" />
      </div>
      {/* Table Container */}
      <Card className="p-0 mb-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 pb-0">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by destination, client, agent, or booking number..."
            className="w-full h-[44px]"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            options={[{ value: '', label: 'All Clients' }, ...clients.map(c => ({ value: c._id, label: c.name }))]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            options={[{ value: '', label: 'All Agents' }, ...agents.map(a => ({ value: a._id, label: a.name }))]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
          <Dropdown
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
            className="min-w-[200px] h-[44px] w-full md:w-auto mb-0"
            style={{ marginBottom: 0 }}
          />
        </div>
        {/* Table */}
        <div className="p-6 pt-0">
          {loading ? (
            <Loader className="my-10" />
          ) : (
            <>
              <Table
                columns={[
                  { 
                    label: 'Booking Details', 
                    key: 'details',
                    render: (row) => (
                      <div>
                        <Link to={`/bookings/${row._id}`} className="font-bold text-blue-700 hover:underline">
                          {row.destination?.name || `Trip to ${row.pickup?.name || 'Unknown'}`}
                        </Link>
                        <div className="text-xs text-gray-500 font-mono">
                          {row.bookingNumber || `BK-${row._id.slice(-6).toUpperCase()}`}
                        </div>
                      </div>
                    )
                  },
                  { 
                    label: 'Client', 
                    key: 'client',
                    render: (row) => row.client ? (
                      <Link to={`/clients/${row.client._id}`} className="hover:underline">{row.client.name}</Link>
                    ) : 'N/A'
                  },
                  { 
                    label: 'Date', 
                    key: 'startDate',
                    render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A'
                  },
                  {
                    label: 'Vehicle',
                    key: 'vehicle',
                    render: (row) => row.vehicle ? (
                      <Link to={`/vehicles/${row.vehicle._id}`} className="hover:underline">{row.vehicle.name}</Link>
                    ) : 'N/A'
                  },
                  { 
                    label: 'Status', 
                    key: 'status',
                    render: (row) => (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    )
                  },
                ]}
                data={paginatedBookings}
                actions={(row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/bookings/${row._id}`)}>
                      <FaEye />
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(row);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                )}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      color={currentPage === i + 1 ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? 'font-bold' : ''}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <FaTrash className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete Booking</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this booking? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <Button 
              color="secondary" 
              className="flex-1" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="danger" 
              className="flex-1" 
              onClick={handleDeleteBooking} 
              loading={deleting}
            >
              Delete Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BookingList; 