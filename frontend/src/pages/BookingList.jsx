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
import { FaPlus, FaSearch, FaEye, FaTrash, FaCalendarAlt, FaUsers, FaUserTie } from 'react-icons/fa';
import { useBookings } from '../contexts/BookingsContext';
import Notification from '../components/common/Notification';
import StatCard from '../components/common/StatCard';

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
      b.destination?.toLowerCase().includes(search.toLowerCase()) ||
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
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

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<FaCalendarAlt />} label="Total Bookings" value={totalBookings} accentColor="blue" />
        <StatCard icon={<FaCalendarAlt />} label="Pending" value={pendingBookings} accentColor="yellow" />
        <StatCard icon={<FaCalendarAlt />} label="Confirmed" value={confirmedBookings} accentColor="green" />
        <StatCard icon={<FaCalendarAlt />} label="Completed" value={completedBookings} accentColor="blue" />
        <StatCard icon={<FaCalendarAlt />} label="Cancelled" value={cancelledBookings} accentColor="red" />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
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

        {/* Bookings Table */}
        {loading ? (
          <Loader className="my-10" />
        ) : (
          <>
            <Table
              columns={[
                { 
                  label: 'Booking #', 
                  accessor: 'bookingNumber',
                  render: (v, row) => (
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {v || `BK${row._id.slice(-6).toUpperCase()}`}
                    </span>
                  )
                },
                { 
                  label: 'Client', 
                  accessor: 'client', 
                  render: c => (
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-blue-500" />
                      {c?._id ? (
                        <Link 
                          to={`/clients/${c._id}`} 
                          className="font-medium text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                        >
                          {c.name || '-'}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-500">{c?.name || '-'}</span>
                      )}
                    </div>
                  )
                },
                { 
                  label: 'Agent', 
                  accessor: 'agent', 
                  render: a => (
                    <div className="flex items-center gap-2">
                      <FaUserTie className="text-green-500" />
                      <span className="font-medium">{a?.name || '-'}</span>
                    </div>
                  )
                },
                { 
                  label: 'Dates', 
                  accessor: 'startDate',
                  render: (startDate, row) => {
                    const start = startDate ? new Date(startDate).toLocaleDateString() : '-';
                    const end = row.endDate ? new Date(row.endDate).toLocaleDateString() : '-';
                    return (
                      <div className="text-sm">
                        <div className="font-medium">{start}</div>
                        <div className="text-gray-500">to {end}</div>
                      </div>
                    );
                  }
                },
                { label: 'Destination', accessor: 'destination' },
                { 
                  label: 'Status', 
                  accessor: 'status',
                  render: status => (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                  )
                },
                { 
                  label: 'Price', 
                  accessor: 'price',
                  render: price => price ? (
                    <span className="font-semibold text-green-600">
                      ${Number(price).toLocaleString()}
                    </span>
                  ) : '-'
                },
              ]}
              data={paginatedBookings}
              actions={row => (
                <>
                  <Button 
                    color="primary" 
                    size="sm" 
                    className="mr-2 flex items-center gap-1" 
                    onClick={() => navigate(`/bookings/${row._id}`)}
                  >
                    <FaEye className="w-3 h-3" />
                    View & Edit
                  </Button>
                  <Button 
                    color="danger" 
                    size="sm" 
                    onClick={() => { setSelectedBooking(row); setDeleteModalOpen(true); }}
                  >
                    <FaTrash className="w-3 h-3" />
                  </Button>
                </>
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