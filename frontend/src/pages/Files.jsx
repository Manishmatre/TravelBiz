import React, { useEffect, useState } from 'react';
import { getFiles, uploadFile, deleteFile } from '../services/fileService';
import { getClients } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import FileUploadModal from '../components/FileUploadModal';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import { FaFileAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Files() {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [filesData, clientsData] = await Promise.all([
          getFiles(token),
          getClients(token),
        ]);
        setFiles(filesData);
        setClients(clientsData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load files');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleUploadFile = async (formData) => {
    try {
      const newFile = await uploadFile(formData, token);
      setFiles([newFile, ...files]);
      setModalOpen(false);
      toast.success('File uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteFile(id, token);
      setFiles(files.filter(f => f._id !== id));
      toast.success('File deleted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete file');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Files</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition-all" onClick={() => setModalOpen(true)}>Upload File</button>
      </div>
      {/* Quick Stat */}
      <div className="mb-6 max-w-xs">
        <StatCard icon={<FaFileAlt />} label="Total Files" value={loading ? '--' : files.length} accentColor="purple" />
      </div>
      {/* Modal */}
      <FileUploadModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleUploadFile} clients={clients} />
      {/* Table or Loader/Error */}
      <div className="">
        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <Table
            columns={[
              { label: 'File Name', accessor: 'fileName' },
              { label: 'Client', accessor: 'clientName' },
              { label: 'Type', accessor: 'fileType' },
              { label: 'Uploaded', accessor: 'uploadDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
            ]}
            data={files.map(f => ({ ...f, clientName: f.clientId?.name || '-', uploadDate: f.uploadDate }))}
            actions={file => (
              <>
                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">View</a>
                <button className="text-red-600 hover:underline" onClick={() => handleDeleteFile(file._id)}>Delete</button>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default Files;