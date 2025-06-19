import React, { useState } from 'react';

function FileUploadModal({ open, onClose, onSubmit, clients }) {
  const [form, setForm] = useState({
    title: '',
    fileType: '',
    clientId: '',
    file: null,
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title || !form.fileType || !form.clientId || !form.file) {
      setError('All fields are required');
      return;
    }
    setError('');
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('fileType', form.fileType);
    formData.append('clientId', form.clientId);
    formData.append('file', form.file);
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-xl font-bold mb-4">Upload File</h2>
        {error && <div className="mb-2 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">File Type</label>
            <select name="fileType" value={form.fileType} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              <option value="">Select type</option>
              <option value="Visa">Visa</option>
              <option value="Passport">Passport</option>
              <option value="Ticket">Ticket</option>
              <option value="Hotel">Hotel</option>
              <option value="Insurance">Insurance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Client</label>
            <select name="clientId" value={form.clientId} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              <option value="">Select client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">File</label>
            <input name="file" type="file" onChange={handleChange} className="w-full" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
            Upload File
          </button>
        </form>
      </div>
    </div>
  );
}

export default FileUploadModal; 