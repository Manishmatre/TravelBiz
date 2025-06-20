import React, { useEffect, useState } from 'react';
import { getVehicleDocuments, uploadVehicleDocument, deleteVehicleDocument } from '../services/vehicleService';
import Button from './common/Button';
import Loader from './common/Loader';
import Modal from './common/Modal';

const DOC_TYPES = ['Insurance', 'PUC', 'Registration', 'Permit', 'Fitness', 'Other'];

function daysUntil(date) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function VehicleDocumentsTab({ vehicleId, token }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ type: '', expiryDate: '', notes: '', file: null });
  const [uploadError, setUploadError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getVehicleDocuments(vehicleId, token);
        setDocs(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    if (vehicleId && token) fetchDocs();
  }, [vehicleId, token]);

  const handleUploadChange = e => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setUploadForm({ ...uploadForm, file: files[0] });
    } else {
      setUploadForm({ ...uploadForm, [name]: value });
    }
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!uploadForm.type || !uploadForm.file) {
      setUploadError('Type and file are required');
      return;
    }
    setUploadError('');
    try {
      await uploadVehicleDocument(vehicleId, uploadForm, token);
      setUploadOpen(false);
      setUploadForm({ type: '', expiryDate: '', notes: '', file: null });
      // Refresh docs
      const data = await getVehicleDocuments(vehicleId, token);
      setDocs(data);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleDelete = async docId => {
    if (!window.confirm('Delete this document?')) return;
    setDeleting(docId);
    try {
      await deleteVehicleDocument(vehicleId, docId, token);
      setDocs(docs.filter(d => d._id !== docId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  // Analytics
  const now = new Date();
  const expiringSoon = docs.filter(d => d.expiryDate && daysUntil(d.expiryDate) <= 30 && daysUntil(d.expiryDate) >= 0).length;
  const expired = docs.filter(d => d.expiryDate && daysUntil(d.expiryDate) < 0).length;

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="bg-blue-50 rounded-xl px-5 py-3 text-blue-800 font-bold shadow">Total: {docs.length}</div>
        <div className="bg-yellow-50 rounded-xl px-5 py-3 text-yellow-800 font-bold shadow">Expiring Soon: {expiringSoon}</div>
        <div className="bg-red-50 rounded-xl px-5 py-3 text-red-800 font-bold shadow">Expired: {expired}</div>
        <Button color="primary" size="sm" className="ml-auto" onClick={() => setUploadOpen(true)}>Upload Document</Button>
      </div>
      {/* List */}
      {loading ? <Loader /> : error ? <div className="text-red-500">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Expiry</th>
                <th className="py-2 px-4 text-left">File</th>
                <th className="py-2 px-4 text-left">Notes</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No documents</td></tr>
              ) : docs.map(doc => {
                const days = daysUntil(doc.expiryDate);
                let badge = '';
                if (days !== null) {
                  if (days < 0) badge = 'bg-red-100 text-red-700';
                  else if (days <= 30) badge = 'bg-yellow-100 text-yellow-700';
                  else badge = 'bg-green-100 text-green-700';
                }
                return (
                  <tr key={doc._id} className="border-t">
                    <td className="py-2 px-4 font-semibold">{doc.type}</td>
                    <td className="py-2 px-4">
                      {doc.expiryDate ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${badge}`}>
                          {new Date(doc.expiryDate).toLocaleDateString()} {days < 0 ? '(Expired)' : days <= 30 ? `(${days}d)` : ''}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-2 px-4">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                    </td>
                    <td className="py-2 px-4">{doc.notes || '-'}</td>
                    <td className="py-2 px-4">
                      <Button color="danger" size="sm" disabled={deleting === doc._id} onClick={() => handleDelete(doc._id)}>
                        {deleting === doc._id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document">
        {uploadError && <div className="mb-2 text-red-500">{uploadError}</div>}
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Type</label>
            <select name="type" value={uploadForm.type} onChange={handleUploadChange} className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required>
              <option value="">Select type</option>
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Expiry Date</label>
            <input name="expiryDate" type="date" value={uploadForm.expiryDate} onChange={handleUploadChange} className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Notes</label>
            <input name="notes" value={uploadForm.notes} onChange={handleUploadChange} className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">File</label>
            <input name="file" type="file" onChange={handleUploadChange} className="w-full" required />
          </div>
          <Button type="submit" color="primary" className="w-full mt-2">Upload</Button>
        </form>
      </Modal>
    </div>
  );
}

export default VehicleDocumentsTab; 