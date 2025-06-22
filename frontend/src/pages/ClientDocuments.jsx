import React, { useState, useEffect } from 'react';
import { FaFileContract, FaUpload, FaDownload, FaEye, FaTrash, FaSearch, FaFilter, FaFolder, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import PageHeading from '../components/common/PageHeading';
import { useAuth } from '../contexts/AuthContext';
import { getFilesForClient, uploadFileForClient, deleteFile } from '../services/fileService';
import SearchInput from '../components/common/SearchInput';
import Dropdown from '../components/common/Dropdown';

function ClientDocuments({ clientId: propClientId }) {
  const { token } = useAuth();
  // For demo, fallback to a hardcoded clientId if not provided
  const clientId = propClientId || 'demo-client-id';
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileInput, setFileInput] = useState(null);

  useEffect(() => {
    if (!clientId || !token) return;
    setLoading(true);
    getFilesForClient(clientId, token)
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [clientId, token]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // For demo, use file.name as title and 'other' as fileType
      await uploadFileForClient(clientId, file.name, 'other', file, token);
      const updated = await getFilesForClient(clientId, token);
      setDocuments(updated);
    } catch (err) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      setFileInput(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    setLoading(true);
    try {
      await deleteFile(id, token);
      setDocuments(await getFilesForClient(clientId, token));
    } catch {
      alert('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.fileType === filterType;
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

  const columns = [
    { key: 'document', label: 'Document', render: (doc) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {getFileTypeIcon(doc.fileType)}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{doc.title}</div>
          <div className="text-sm text-gray-500">{doc.description}</div>
        </div>
      </div>
    )},
    { key: 'type', label: 'Type', render: (doc) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800`}>
        {doc.fileType?.charAt(0).toUpperCase() + doc.fileType?.slice(1) || 'Other'}
      </span>
    )},
    { key: 'size', label: 'Size', render: (doc) => (
      <span className="text-sm font-medium">{doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : '--'}</span>
    )},
    { key: 'uploadDate', label: 'Upload Date', render: (doc) => (
      <div className="text-sm">
        <div className="font-medium">{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '--'}</div>
        <div className="text-gray-500">{doc.uploadDate ? new Date(doc.uploadDate).toLocaleTimeString() : ''}</div>
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
        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(doc._id)}>
          <FaTrash className="text-sm" />
        </Button>
      </div>
    )}
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6">
        <PageHeading
          icon={<FaFileContract />}
          title="Client Documents"
          subtitle="Manage all client-related documents and contracts"
          iconColor="text-blue-600"
        >
          <input
            type="file"
            className="hidden"
            id="upload-doc-input"
            onChange={handleUpload}
            disabled={uploading}
          />
          <label htmlFor="upload-doc-input">
            <Button as="span" disabled={uploading} loading={uploading}>
              <FaUpload className="mr-2" />
              Upload Document
            </Button>
          </label>
        </PageHeading>

        <Card className="p-4">
          <div className="p-4">
            {/* Table-integrated Filter/Search Bar */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              <SearchInput
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-80"
              />
              <div className="flex gap-3 items-center">
                <Dropdown
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'pdf', label: 'PDF' },
                    { value: 'image', label: 'Image' },
                    { value: 'word', label: 'Word' },
                    { value: 'other', label: 'Other' },
                  ]}
                  className="w-40"
                />
                <Button variant="outline">
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <Table
              data={filteredDocuments}
              columns={columns}
              loading={loading}
              emptyMessage="No documents found"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ClientDocuments; 