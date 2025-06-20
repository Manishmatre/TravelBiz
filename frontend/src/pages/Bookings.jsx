import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, addBooking, updateBooking, deleteBooking } from '../services/bookingService';
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
import { FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useBookings } from '../contexts/BookingsContext';

function Bookings() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { bookings, loading } = useBookings();
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newBooking, setNewBooking] = useState({ client: '', agent: '', startDate: '', endDate: '', destination: '', status: 'Pending', price: '', notes: '' });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getClients(token).then(setClients);
    getUsers({ role: 'agent' }, token).then(setAgents);
  }, [token]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.destination.toLowerCase().includes(search.toLowerCase()) ||
      (b.client?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesClient = filterClient ? String(b.client?._id) === filterClient : true;
    const matchesAgent = filterAgent ? String(b.agent?._id) === filterAgent : true;
    const matchesStatus = filterStatus ? b.status === filterStatus : true;
    return matchesSearch && matchesClient && matchesAgent && matchesStatus;
  });

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
      const updated = await getBookings(null, token);
      setBookings(updated);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add booking');
      setAdding(false);
    }
  };
  const handleEditInput = e => {
    const { name, value } = e.target;
    setSelectedBooking(b => ({ ...b, [name]: value }));
  };
  const handleEditBooking = async () => {
    setSaving(true);
    try {
      await updateBooking(selectedBooking._id, selectedBooking, token);
      setEditModalOpen(false);
      setSelectedBooking(null);
      const updated = await getBookings(null, token);
      setBookings(updated);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update booking');
      setSaving(false);
    }
  };
  const handleDeleteBooking = async () => {
    setDeleting(true);
    try {
      await deleteBooking(selectedBooking._id, token);
      setDeleteModalOpen(false);
      setSelectedBooking(null);
      const updated = await getBookings(null, token);
      setBookings(updated);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete booking');
      setDeleting(false);
    }
  };

  // Stats calculation (mocked for now)
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  // Analytics data (mocked from bookings)
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

  // Recent Activity Feed (last 10 bookings by createdAt desc)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
    .slice(0, 10);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
        <Button color="primary" onClick={() => setModalOpen(true)}>Add Booking</Button>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
      {/* Recent Activity Feed */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        {recentBookings.length === 0 ? (
          <div className="text-gray-500">No recent bookings.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white/60">
                <th className="py-2 px-4 text-left font-semibold text-gray-700">Date</th>
                <th className="py-2 px-4 text-left font-semibold text-gray-700">Client</th>
                <th className="py-2 px-4 text-left font-semibold text-gray-700">Agent</th>
                <th className="py-2 px-4 text-left font-semibold text-gray-700">Status</th>
                <th className="py-2 px-4 text-left font-semibold text-gray-700">Destination</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b._id} className="border-t border-blue-50 hover:bg-blue-50/60 transition-colors">
                  <td className="py-2 px-4">{b.createdAt ? new Date(b.createdAt).toLocaleString() : (b.startDate ? new Date(b.startDate).toLocaleString() : '-')}</td>
                  <td className="py-2 px-4">{b.client?.name || '-'}</td>
                  <td className="py-2 px-4">{b.agent?.name || '-'}</td>
                  <td className="py-2 px-4">{b.status}</td>
                  <td className="py-2 px-4">{b.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Export CSV Button */}
      <div className="flex justify-end mb-2">
        <Button color="secondary" size="sm" onClick={() => exportCSV(filteredBookings)}>
          Export CSV
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by destination or client..."
          className="w-full md:w-64"
        />
        <Dropdown
          label="Client"
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          options={[{ value: '', label: 'All Clients' }, ...clients.map(c => ({ value: c._id, label: c.name }))]}
          className="w-full md:w-48"
        />
        <Dropdown
          label="Agent"
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          options={[{ value: '', label: 'All Agents' }, ...agents.map(a => ({ value: a._id, label: a.name }))]}
          className="w-full md:w-48"
        />
        <Dropdown
          label="Status"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Confirmed', label: 'Confirmed' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          className="w-full md:w-40"
        />
      </div>
      {loading ? (
        <Loader className="my-10" />
      ) : (
        <Table
          columns={[
            { label: 'Client', accessor: 'client', render: c => c?.name || '-' },
            { label: 'Agent', accessor: 'agent', render: a => a?.name || '-' },
            { label: 'Start Date', accessor: 'startDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
            { label: 'End Date', accessor: 'endDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
            { label: 'Destination', accessor: 'destination' },
            { label: 'Status', accessor: 'status' },
            { label: 'Price', accessor: 'price' },
            { label: 'Notes', accessor: 'notes' },
          ]}
          data={filteredBookings}
          actions={row => (
            <>
              <Button color="primary" size="sm" className="mr-2" onClick={() => navigate(`/bookings/${row._id}`)}>View</Button>
              <Button color="secondary" size="sm" className="mr-2" onClick={() => { setSelectedBooking(row); setEditModalOpen(true); }}>Edit</Button>
              <Button color="danger" size="sm" onClick={() => { setSelectedBooking(row); setDeleteModalOpen(true); }}>Delete</Button>
            </>
          )}
        />
      )}
      {/* Add Booking Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-4">
          <h3 className="font-bold mb-2">Add Booking</h3>
          <Dropdown
            label="Client"
            name="client"
            value={newBooking.client}
            onChange={handleInput}
            options={[{ value: '', label: 'Select Client' }, ...clients.map(c => ({ value: c._id, label: c.name }))]}
          />
          <Dropdown
            label="Agent"
            name="agent"
            value={newBooking.agent}
            onChange={handleInput}
            options={[{ value: '', label: 'Select Agent' }, ...agents.map(a => ({ value: a._id, label: a.name }))]}
          />
          <Input label="Start Date" name="startDate" type="date" value={newBooking.startDate} onChange={handleInput} />
          <Input label="End Date" name="endDate" type="date" value={newBooking.endDate} onChange={handleInput} />
          <Input label="Destination" name="destination" value={newBooking.destination} onChange={handleInput} />
          <Dropdown
            label="Status"
            name="status"
            value={newBooking.status}
            onChange={handleInput}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
          <Input label="Price" name="price" type="number" value={newBooking.price} onChange={handleInput} />
          <Input label="Notes" name="notes" value={newBooking.notes} onChange={handleInput} />
          <Button color="primary" className="mt-2 w-full" onClick={handleAddBooking} loading={adding}>Save</Button>
        </div>
      </Modal>
      {/* Edit Booking Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="p-4">
          <h3 className="font-bold mb-2">Edit Booking</h3>
          <Dropdown
            label="Client"
            name="client"
            value={selectedBooking?.client || ''}
            onChange={handleEditInput}
            options={[{ value: '', label: 'Select Client' }, ...clients.map(c => ({ value: c._id, label: c.name }))]}
          />
          <Dropdown
            label="Agent"
            name="agent"
            value={selectedBooking?.agent || ''}
            onChange={handleEditInput}
            options={[{ value: '', label: 'Select Agent' }, ...agents.map(a => ({ value: a._id, label: a.name }))]}
          />
          <Input label="Start Date" name="startDate" type="date" value={selectedBooking?.startDate?.slice(0,10) || ''} onChange={handleEditInput} />
          <Input label="End Date" name="endDate" type="date" value={selectedBooking?.endDate?.slice(0,10) || ''} onChange={handleEditInput} />
          <Input label="Destination" name="destination" value={selectedBooking?.destination || ''} onChange={handleEditInput} />
          <Dropdown
            label="Status"
            name="status"
            value={selectedBooking?.status || 'Pending'}
            onChange={handleEditInput}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
          <Input label="Price" name="price" type="number" value={selectedBooking?.price || ''} onChange={handleEditInput} />
          <Input label="Notes" name="notes" value={selectedBooking?.notes || ''} onChange={handleEditInput} />
          <Button color="primary" className="mt-2 w-full" onClick={handleEditBooking} loading={saving}>Save</Button>
        </div>
      </Modal>
      {/* Delete Booking Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-4">
          <h3 className="font-bold mb-2">Delete Booking</h3>
          <div className="mb-4">Are you sure you want to delete this booking?</div>
          <Button color="danger" className="w-full" onClick={handleDeleteBooking} loading={deleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

export default Bookings; 