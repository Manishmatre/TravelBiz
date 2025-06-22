import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaSms, FaWhatsapp, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaEye, FaReply } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function ClientCommunications() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock communications data
  useEffect(() => {
    const mockCommunications = [
      {
        id: 1,
        clientName: 'John Smith',
        clientEmail: 'john.smith@email.com',
        type: 'email',
        subject: 'Booking Confirmation - Trip to Paris',
        content: 'Thank you for your booking. Your trip to Paris has been confirmed...',
        status: 'sent',
        date: '2024-01-15T10:30:00',
        agent: 'Sarah Johnson',
        priority: 'high'
      },
      {
        id: 2,
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah.j@email.com',
        type: 'phone',
        subject: 'Follow-up call',
        content: 'Called to confirm pickup time for tomorrow\'s airport transfer',
        status: 'completed',
        date: '2024-01-15T14:20:00',
        agent: 'Mike Chen',
        priority: 'medium'
      },
      {
        id: 3,
        clientName: 'Michael Brown',
        clientEmail: 'michael.b@email.com',
        type: 'sms',
        subject: 'Reminder: Your booking tomorrow',
        content: 'Hi Michael, reminder that your airport transfer is scheduled for tomorrow at 8:00 AM',
        status: 'sent',
        date: '2024-01-15T16:45:00',
        agent: 'Lisa Rodriguez',
        priority: 'low'
      },
      {
        id: 4,
        clientName: 'Emily Davis',
        clientEmail: 'emily.d@email.com',
        type: 'whatsapp',
        subject: 'Vehicle change request',
        content: 'Hi Emily, we can accommodate your request for a larger vehicle...',
        status: 'pending',
        date: '2024-01-15T09:15:00',
        agent: 'Sarah Johnson',
        priority: 'high'
      },
      {
        id: 5,
        clientName: 'David Wilson',
        clientEmail: 'david.w@email.com',
        type: 'email',
        subject: 'Invoice for recent booking',
        content: 'Please find attached the invoice for your recent booking...',
        status: 'sent',
        date: '2024-01-14T11:30:00',
        agent: 'Mike Chen',
        priority: 'medium'
      }
    ];
    
    setTimeout(() => {
      setCommunications(mockCommunications);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || comm.type === filterType;
    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <FaEnvelope className="text-blue-600" />;
      case 'phone': return <FaPhone className="text-green-600" />;
      case 'sms': return <FaSms className="text-purple-600" />;
      case 'whatsapp': return <FaWhatsapp className="text-green-500" />;
      default: return <FaEnvelope className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { key: 'client', label: 'Client', render: (comm) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <FaUser className="text-blue-600 text-sm" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{comm.clientName}</div>
          <div className="text-sm text-gray-500">{comm.clientEmail}</div>
        </div>
      </div>
    )},
    { key: 'type', label: 'Type', render: (comm) => (
      <div className="flex items-center gap-2">
        {getTypeIcon(comm.type)}
        <span className="capitalize">{comm.type}</span>
      </div>
    )},
    { key: 'subject', label: 'Subject', render: (comm) => (
      <div className="max-w-xs">
        <div className="font-medium text-gray-900 truncate">{comm.subject}</div>
        <div className="text-sm text-gray-500 truncate">{comm.content}</div>
      </div>
    )},
    { key: 'priority', label: 'Priority', render: (comm) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(comm.priority)}`}>
        {comm.priority.charAt(0).toUpperCase() + comm.priority.slice(1)}
      </span>
    )},
    { key: 'status', label: 'Status', render: (comm) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(comm.status)}`}>
        {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
      </span>
    )},
    { key: 'date', label: 'Date', render: (comm) => (
      <div className="text-sm">
        <div className="font-medium">{new Date(comm.date).toLocaleDateString()}</div>
        <div className="text-gray-500">{new Date(comm.date).toLocaleTimeString()}</div>
      </div>
    )},
    { key: 'agent', label: 'Agent', render: (comm) => (
      <span className="text-sm font-medium">{comm.agent}</span>
    )},
    { key: 'actions', label: 'Actions', render: (comm) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <FaEye className="text-sm" />
        </Button>
        <Button size="sm" variant="outline">
          <FaReply className="text-sm" />
        </Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaEnvelope className="text-blue-600" />
            Client Communications
          </h1>
          <p className="text-gray-600 mt-2">Track all communication history with your clients</p>
        </div>
        <Button>
          <FaEnvelope className="mr-2" />
          New Communication
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Communications</p>
                <p className="text-2xl font-bold text-gray-900">{communications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {communications.filter(c => 
                    new Date(c.date).toDateString() === new Date().toDateString() && 
                    c.status === 'sent'
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="text-green-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {communications.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {communications.filter(c => c.priority === 'high').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FaEnvelope className="text-red-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FaCalendarAlt className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Communications Table */}
      <Card>
        <div className="p-6">
          <Table
            data={filteredCommunications}
            columns={columns}
            loading={loading}
            emptyMessage="No communications found"
          />
        </div>
      </Card>
    </div>
  );
}

export default ClientCommunications; 