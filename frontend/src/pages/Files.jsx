import React, { useEffect, useState } from 'react';
import { getFiles, uploadFile, deleteFile } from '../services/fileService';
import { getClients } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import FileUploadModal from '../components/FileUploadModal';
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
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Files</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" onClick={() => setModalOpen(true)}>Upload File</button>
      </div>
      <FileUploadModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleUploadFile} clients={clients} />
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Client</th>
                <th className="py-2 px-4 text-left">Uploaded By</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file._id}>
                  <td className="py-2 px-4">{file.title}</td>
                  <td className="py-2 px-4">{file.fileType}</td>
                  <td className="py-2 px-4">{file.clientId?.name || '-'}</td>
                  <td className="py-2 px-4">{file.uploadedBy?.name || '-'}</td>
                  <td className="py-2 px-4">{file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : '-'}</td>
                  <td className="py-2 px-4">
                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">View</a>
                    <button className="text-red-600 hover:underline" onClick={() => handleDeleteFile(file._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Files; 