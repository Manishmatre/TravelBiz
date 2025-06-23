import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaSms, FaWhatsapp, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaEye, FaReply, FaDownload } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import PageHeading from '../../components/common/PageHeading';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import Dropdown from '../../components/common/Dropdown';
import { getClients } from '../../services/clientService';
import { useAuth } from '../../contexts/AuthContext';

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

  // Stats
  const totalComms = communications.length;
  const emailComms = communications.filter(c => c.type === 'email').length;
  const smsComms = communications.filter(c => c.type === 'sms').length;
  const phoneComms = communications.filter(c => c.type === 'phone').length;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6">
        <PageHeading
          icon={<FaEnvelope />}
          title="Client Communications"
          subtitle="Track all communication history with your clients"
          iconColor="text-blue-600"
        >
          <Button>
            <FaEnvelope className="mr-2" />
            New Communication
          </Button>
        </PageHeading>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FaEnvelope />} label="Total Communications" value={totalComms} accentColor="blue" />
          <StatCard icon={<FaEnvelope />} label="Emails" value={emailComms} accentColor="yellow" />
          <StatCard icon={<FaSms />} label="SMS" value={smsComms} accentColor="purple" />
          <StatCard icon={<FaPhone />} label="Phone Calls" value={phoneComms} accentColor="green" />
        </div>

        <Card className="p-4">
          <div className="p-4">
            {/* Table-integrated Filter/Search Bar */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              <SearchInput
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search communications..."
                className="w-80"
              />
              <div className="flex gap-3 items-center">
                <Dropdown
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'whatsapp', label: 'WhatsApp' }
                  ]}
                  className="w-36"
                />
                <Dropdown
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'sent', label: 'Sent' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'failed', label: 'Failed' }
                  ]}
                  className="w-36"
                />
                <Button variant="outline">
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <Table
              data={filteredCommunications}
              columns={columns}
              loading={loading}
              emptyMessage="No communications found"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ClientCommunications; 