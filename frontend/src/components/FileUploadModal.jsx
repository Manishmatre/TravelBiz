import React, { useState } from 'react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload File"
      overlayClassName="bg-black/10 backdrop-blur-sm"
      cardClassName="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
    >
      {error && <div className="mb-2 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit}>
        <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">File Type</label>
          <select name="fileType" value={form.fileType} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required>
            <option value="">Select type</option>
            <option value="Visa">Visa</option>
            <option value="Passport">Passport</option>
            <option value="Ticket">Ticket</option>
            <option value="Hotel">Hotel</option>
            <option value="Insurance">Insurance</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Client</label>
          <select name="clientId" value={form.clientId} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-white/70 shadow-sm px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required>
            <option value="">Select client</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">File</label>
          <input name="file" type="file" onChange={handleChange} className="w-full" required />
        </div>
        <Button type="submit" color="primary" className="w-full mt-2">
          Upload File
        </Button>
      </form>
    </Modal>
  );
}

export default FileUploadModal; 