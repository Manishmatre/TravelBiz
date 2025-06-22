import React, { useState, useEffect } from 'react';
import { FaFileContract, FaUpload, FaDownload, FaEye, FaTrash, FaSearch, FaFilter, FaFolder, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function ClientDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  useEffect(() => {
    const mockDocuments = [
      {
        id: 1,
        name: 'Contract Agreement - John Smith',
        type: 'contract',
        fileType: 'pdf',
        size: '2.3 MB',
        clientName: 'John Smith',
        clientEmail: 'john.smith@email.com',
        uploadedBy: 'Sarah Johnson',
        uploadDate: '2024-01-15T10:30:00',
        status: 'active',
        description: 'Service agreement for airport transfer services'
      },
      {
        id: 2,
        name: 'ID Verification - Sarah Johnson',
        type: 'verification',
        fileType: 'image',
        size: '1.8 MB',
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah.j@email.com',
        uploadedBy: 'Mike Chen',
        uploadDate: '2024-01-14T14:20:00',
        status: 'active',
        description: 'Passport copy for identity verification'
      },
      {
        id: 3,
        name: 'Invoice #INV-2024-001',
        type: 'invoice',
        fileType: 'pdf',
        size: '0.9 MB',
        clientName: 'Michael Brown',
        clientEmail: 'michael.b@email.com',
        uploadedBy: 'Lisa Rodriguez',
        uploadDate: '2024-01-13T16:45:00',
        status: 'active',
        description: 'Invoice for recent booking services'
      }
    ];
    
    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <FaFilePdf className="text-red-600" />;
      case 'image': return <FaFileImage className="text-green-600" />;
      case 'word': return <FaFileWord className="text-blue-600" />;
      default: return <FaFileAlt className="text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'verification': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { key: 'document', label: 'Document', render: (doc) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {getFileTypeIcon(doc.fileType)}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{doc.name}</div>
          <div className="text-sm text-gray-500">{doc.description}</div>
        </div>
      </div>
    )},
    { key: 'client', label: 'Client', render: (doc) => (
      <div>
        <div className="font-medium text-gray-900">{doc.clientName}</div>
        <div className="text-sm text-gray-500">{doc.clientEmail}</div>
      </div>
    )},
    { key: 'type', label: 'Type', render: (doc) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(doc.type)}`}>
        {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
      </span>
    )},
    { key: 'size', label: 'Size', render: (doc) => (
      <span className="text-sm font-medium">{doc.size}</span>
    )},
    { key: 'uploadDate', label: 'Upload Date', render: (doc) => (
      <div className="text-sm">
        <div className="font-medium">{new Date(doc.uploadDate).toLocaleDateString()}</div>
        <div className="text-gray-500">{new Date(doc.uploadDate).toLocaleTimeString()}</div>
      </div>
    )},
    { key: 'actions', label: 'Actions', render: (doc) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <FaEye className="text-sm" />
        </Button>
        <Button size="sm" variant="outline">
          <FaDownload className="text-sm" />
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
          <FaTrash className="text-sm" />
        </Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaFileContract className="text-blue-600" />
            Client Documents
          </h1>
          <p className="text-gray-600 mt-2">Manage all client-related documents and contracts</p>
        </div>
        <Button>
          <FaUpload className="mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaFileContract className="text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Documents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaFileAlt className="text-green-600" />
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.reduce((total, doc) => {
                    const size = parseFloat(doc.size);
                    return total + size;
                  }, 0).toFixed(1)} MB
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaFolder className="text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search documents..."
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
                  <option value="contract">Contract</option>
                  <option value="verification">Verification</option>
                  <option value="invoice">Invoice</option>
                  <option value="insurance">Insurance</option>
                  <option value="requirements">Requirements</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FaDownload className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <Table
            data={filteredDocuments}
            columns={columns}
            loading={loading}
            emptyMessage="No documents found"
          />
        </div>
      </Card>
    </div>
  );
}

export default ClientDocuments; 