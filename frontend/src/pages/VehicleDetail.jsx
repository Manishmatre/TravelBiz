import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Tab from '../components/common/Tab';
import Loader from '../components/common/Loader';
import VehicleDocumentsTab from '../components/VehicleDocumentsTab';
import { useAuth } from '../contexts/AuthContext';
import {
  getVehicleAssignments,
  addVehicleAssignment,
  updateVehicleAssignment,
  deleteVehicleAssignment,
  getVehicleMaintenance,
  addVehicleMaintenance,
  updateVehicleMaintenance,
  deleteVehicleMaintenance,
  getVehicleFuelLogs,
  addVehicleFuelLog,
  updateVehicleFuelLog,
  deleteVehicleFuelLog,
  getVehicleDocuments,
  uploadVehicleDocument,
  deleteVehicleDocument,
  updateVehicle,
} from '../services/vehicleService';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import Button from '../components/common/Button';

const tabLabels = [
  'General Info',
  'Current Assignment',
  'Documents',
  'Insurance',
  'PUC',
  'Maintenance',
  'Fuel Management',
  'Activity Log',
  'Photos',
];

function VehicleDetail() {
  const { id } = useParams();
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Assignment state
  const [assignments, setAssignments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [assignForm, setAssignForm] = useState({ driver: '', status: 'Assigned', assignedAt: '' });
  const [assignSaving, setAssignSaving] = useState(false);

  // Maintenance state
  const [maintenance, setMaintenance] = useState([]);
  const [maintLoading, setMaintLoading] = useState(false);
  const [maintError, setMaintError] = useState('');
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [editMaint, setEditMaint] = useState(null);
  const [maintForm, setMaintForm] = useState({ type: '', date: '', status: 'Upcoming', cost: '', notes: '' });
  const [maintSaving, setMaintSaving] = useState(false);

  // Fuel state
  const [fuelLogs, setFuelLogs] = useState([]);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelError, setFuelError] = useState('');
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [editFuel, setEditFuel] = useState(null);
  const [fuelForm, setFuelForm] = useState({ date: '', fuel: '', cost: '', mileage: '' });
  const [fuelSaving, setFuelSaving] = useState(false);

  // Documents for Insurance/PUC
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState('');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({ type: '', expiryDate: '', notes: '', file: null });
  const [docSaving, setDocSaving] = useState(false);
  const [docTypeFilter, setDocTypeFilter] = useState('');

  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError('');
      try {
        const authToken = token || localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error('Failed to fetch vehicle');
        const data = await res.json();
        setVehicle(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicle');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVehicle();
  }, [id, token]);

  // Fetch assignments
  useEffect(() => {
    if (!id || !token) return;
    setAssignLoading(true);
    getVehicleAssignments(id, token)
      .then(setAssignments)
      .catch(e => setAssignError(e.response?.data?.message || 'Failed to load assignments'))
      .finally(() => setAssignLoading(false));
  }, [id, token]);
  // Fetch maintenance
  useEffect(() => {
    if (!id || !token) return;
    setMaintLoading(true);
    getVehicleMaintenance(id, token)
      .then(setMaintenance)
      .catch(e => setMaintError(e.response?.data?.message || 'Failed to load maintenance'))
      .finally(() => setMaintLoading(false));
  }, [id, token]);
  // Fetch fuel logs
  useEffect(() => {
    if (!id || !token) return;
    setFuelLoading(true);
    getVehicleFuelLogs(id, token)
      .then(setFuelLogs)
      .catch(e => setFuelError(e.response?.data?.message || 'Failed to load fuel logs'))
      .finally(() => setFuelLoading(false));
  }, [id, token]);
  // Fetch docs (for insurance/PUC tabs)
  useEffect(() => {
    if (!id || !token) return;
    setDocsLoading(true);
    getVehicleDocuments(id, token)
      .then(setDocs)
      .catch(e => setDocsError(e.response?.data?.message || 'Failed to load documents'))
      .finally(() => setDocsLoading(false));
  }, [id, token]);

  // Assignment handlers
  const handleOpenAssignModal = (record = null) => {
    setEditAssignment(record);
    setAssignForm(record ? {
      driver: record.driver?._id || record.driver || '',
      status: record.status || 'Assigned',
      assignedAt: record.assignedAt ? record.assignedAt.slice(0, 10) : '',
    } : { driver: '', status: 'Assigned', assignedAt: '' });
    setAssignModalOpen(true);
  };
  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setEditAssignment(null);
    setAssignForm({ driver: '', status: 'Assigned', assignedAt: '' });
  };
  const handleAssignChange = e => {
    const { name, value } = e.target;
    setAssignForm(f => ({ ...f, [name]: value }));
  };
  const handleAssignSubmit = async e => {
    e.preventDefault();
    setAssignSaving(true);
    try {
      if (editAssignment) {
        await updateVehicleAssignment(id, editAssignment._id, assignForm, token);
      } else {
        await addVehicleAssignment(id, assignForm, token);
      }
      const updated = await getVehicleAssignments(id, token);
      setAssignments(updated);
      handleCloseAssignModal();
    } catch (err) {
      setAssignError(err.response?.data?.message || err.message || 'Failed to save assignment');
    } finally {
      setAssignSaving(false);
    }
  };
  const handleDeleteAssignment = async record => {
    if (!window.confirm('Delete this assignment?')) return;
    setAssignSaving(true);
    try {
      await deleteVehicleAssignment(id, record._id, token);
      setAssignments(assignments.filter(a => a._id !== record._id));
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setAssignSaving(false);
    }
  };

  // Maintenance handlers
  const handleOpenMaintModal = (record = null) => {
    setEditMaint(record);
    setMaintForm(record ? {
      type: record.type || '',
      date: record.date ? record.date.slice(0, 10) : '',
      status: record.status || 'Upcoming',
      cost: record.cost || '',
      notes: record.notes || '',
    } : { type: '', date: '', status: 'Upcoming', cost: '', notes: '' });
    setMaintModalOpen(true);
  };
  const handleCloseMaintModal = () => {
    setMaintModalOpen(false);
    setEditMaint(null);
    setMaintForm({ type: '', date: '', status: 'Upcoming', cost: '', notes: '' });
  };
  const handleMaintChange = e => {
    const { name, value } = e.target;
    setMaintForm(f => ({ ...f, [name]: value }));
  };
  const handleMaintSubmit = async e => {
    e.preventDefault();
    setMaintSaving(true);
    try {
      if (editMaint) {
        await updateVehicleMaintenance(id, editMaint._id, maintForm, token);
      } else {
        await addVehicleMaintenance(id, maintForm, token);
      }
      const updated = await getVehicleMaintenance(id, token);
      setMaintenance(updated);
      handleCloseMaintModal();
    } catch (err) {
      setMaintError(err.response?.data?.message || err.message || 'Failed to save maintenance');
    } finally {
      setMaintSaving(false);
    }
  };
  const handleDeleteMaint = async record => {
    if (!window.confirm('Delete this maintenance record?')) return;
    setMaintSaving(true);
    try {
      await deleteVehicleMaintenance(id, record._id, token);
      setMaintenance(maintenance.filter(m => m._id !== record._id));
    } catch (err) {
      setMaintError(err.response?.data?.message || 'Failed to delete maintenance');
    } finally {
      setMaintSaving(false);
    }
  };

  // Fuel handlers
  const handleOpenFuelModal = (log = null) => {
    setEditFuel(log);
    setFuelForm(log ? {
      date: log.date ? log.date.slice(0, 10) : '',
      fuel: log.fuel || '',
      cost: log.cost || '',
      mileage: log.mileage || '',
    } : { date: '', fuel: '', cost: '', mileage: '' });
    setFuelModalOpen(true);
  };
  const handleCloseFuelModal = () => {
    setFuelModalOpen(false);
    setEditFuel(null);
    setFuelForm({ date: '', fuel: '', cost: '', mileage: '' });
  };
  const handleFuelChange = e => {
    const { name, value } = e.target;
    setFuelForm(f => ({ ...f, [name]: value }));
  };
  const handleFuelSubmit = async e => {
    e.preventDefault();
    setFuelSaving(true);
    try {
      if (editFuel) {
        await updateVehicleFuelLog(id, editFuel._id, fuelForm, token);
      } else {
        await addVehicleFuelLog(id, fuelForm, token);
      }
      const updated = await getVehicleFuelLogs(id, token);
      setFuelLogs(updated);
      handleCloseFuelModal();
    } catch (err) {
      setFuelError(err.response?.data?.message || err.message || 'Failed to save fuel log');
    } finally {
      setFuelSaving(false);
    }
  };
  const handleDeleteFuel = async log => {
    if (!window.confirm('Delete this fuel log?')) return;
    setFuelSaving(true);
    try {
      await deleteVehicleFuelLog(id, log._id, token);
      setFuelLogs(fuelLogs.filter(f => f._id !== log._id));
    } catch (err) {
      setFuelError(err.response?.data?.message || 'Failed to delete fuel log');
    } finally {
      setFuelSaving(false);
    }
  };

  // Document handlers for Insurance/PUC
  const handleOpenDocModal = (type) => {
    setDocTypeFilter(type);
    setDocForm({ type, expiryDate: '', notes: '', file: null });
    setDocModalOpen(true);
  };
  const handleDocChange = e => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setDocForm(f => ({ ...f, file: files[0] }));
    } else {
      setDocForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleDocSubmit = async e => {
    e.preventDefault();
    setDocSaving(true);
    try {
      await uploadVehicleDocument(id, docForm, token);
      const updated = await getVehicleDocuments(id, token);
      setDocs(updated);
      setDocModalOpen(false);
      setDocForm({ type: docTypeFilter, expiryDate: '', notes: '', file: null });
    } catch (err) {
      setDocsError(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setDocSaving(false);
    }
  };
  const handleDeleteDoc = async docId => {
    if (!window.confirm('Delete this document?')) return;
    setDocSaving(true);
    try {
      await deleteVehicleDocument(id, docId, token);
      setDocs(docs.filter(d => d._id !== docId));
    } catch (err) {
      setDocsError(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDocSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <Link to="/vehicles" className="text-blue-600 hover:underline font-semibold">&larr; Back to Vehicles</Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center flex-1">Vehicle Details</h1>
          <div className="hidden md:block" style={{ width: 120 }} />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full">
          <Tab tabs={tabLabels.map(label => ({ label }))} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />
          {loading ? (
            <Loader className="my-10" />
          ) : error ? (
            <div className="text-red-500 p-6">{error}</div>
          ) : !vehicle ? (
            <div className="text-gray-500 p-6">Vehicle not found.</div>
          ) : (
            <>
              {activeTab === 0 && (
                <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                  <img src={vehicle.photoUrl || '/default-vehicle.png'} alt={vehicle.name} className="w-40 h-28 object-cover rounded-xl border mb-4 md:mb-0" />
                  <div className="flex-1">
                    <div className="text-xl font-bold mb-2">{vehicle.name}</div>
                    <div className="mb-1"><span className="font-semibold">Number Plate:</span> <span className="cursor-pointer" onClick={() => navigator.clipboard.writeText(vehicle.numberPlate)}>{vehicle.numberPlate}</span></div>
                    <div className="mb-1"><span className="font-semibold">Type:</span> {vehicle.vehicleType}</div>
                    <div className="mb-1"><span className="font-semibold">Status:</span> <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                      vehicle.status === 'on-trip' ? 'bg-yellow-100 text-yellow-700' :
                      vehicle.status === 'maintenance' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>{vehicle.status}</span></div>
                    <div className="mb-1"><span className="font-semibold">Insurance Expiry:</span> {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '-'}</div>
                    <div className="mb-1"><span className="font-semibold">PUC Expiry:</span> {vehicle.pucExpiry ? new Date(vehicle.pucExpiry).toLocaleDateString() : '-'}</div>
                    {/* Add more fields as needed */}
                  </div>
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold">Current Assignments</div>
                    <Button color="primary" size="sm" onClick={() => handleOpenAssignModal()}>Add Assignment</Button>
                  </div>
                  {assignLoading ? <Loader /> : assignError ? <div className="text-red-500">{assignError}</div> : (
                    <Table
                      columns={[
                        { label: 'Driver', accessor: 'driver', render: v => v && v.name ? v.name : '-' },
                        { label: 'Status', accessor: 'status' },
                        { label: 'Assignment Date', accessor: 'assignedAt', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                      ]}
                      data={assignments}
                      actions={record => (
                        <>
                          <Button color="secondary" size="sm" className="mr-2" onClick={() => handleOpenAssignModal(record)}>Edit</Button>
                          <Button color="danger" size="sm" onClick={() => handleDeleteAssignment(record)}>Delete</Button>
                        </>
                      )}
                    />
                  )}
                  <Modal open={assignModalOpen} onClose={handleCloseAssignModal} title={editAssignment ? 'Edit Assignment' : 'Add Assignment'}>
                    <form onSubmit={handleAssignSubmit} className="space-y-2">
                      <Input label="Driver" name="driver" value={assignForm.driver} onChange={handleAssignChange} required />
                      <Dropdown
                        value={assignForm.status}
                        onChange={e => setAssignForm(f => ({ ...f, status: e.target.value }))}
                        options={[
                          { value: 'Assigned', label: 'Assigned' },
                          { value: 'Unassigned', label: 'Unassigned' },
                        ]}
                        className="w-full"
                      />
                      <Input label="Assignment Date" name="assignedAt" type="date" value={assignForm.assignedAt} onChange={handleAssignChange} />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" color="secondary" onClick={handleCloseAssignModal}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={assignSaving}>{assignSaving ? 'Saving...' : (editAssignment ? 'Update' : 'Add')}</Button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
              {activeTab === 2 && (<VehicleDocumentsTab vehicleId={vehicle._id} token={token} />)}
              {activeTab === 3 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold">Insurance Documents</div>
                    <Button color="primary" size="sm" onClick={() => handleOpenDocModal('Insurance')}>Upload Insurance</Button>
                  </div>
                  {docsLoading ? <Loader /> : docsError ? <div className="text-red-500">{docsError}</div> : (
                    <Table
                      columns={[
                        { label: 'Type', accessor: 'type' },
                        { label: 'Expiry', accessor: 'expiryDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                        { label: 'File', accessor: 'fileUrl', render: v => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : '-' },
                        { label: 'Notes', accessor: 'notes' },
                      ]}
                      data={docs.filter(d => d.type === 'Insurance')}
                      actions={doc => (
                        <Button color="danger" size="sm" onClick={() => handleDeleteDoc(doc._id)}>Delete</Button>
                      )}
                    />
                  )}
                  <Modal open={docModalOpen && docTypeFilter === 'Insurance'} onClose={() => setDocModalOpen(false)} title="Upload Insurance Document">
                    <form onSubmit={handleDocSubmit} className="space-y-2">
                      <Input label="Expiry Date" name="expiryDate" type="date" value={docForm.expiryDate} onChange={handleDocChange} />
                      <Input label="Notes" name="notes" value={docForm.notes} onChange={handleDocChange} />
                      <input name="file" type="file" accept="*" onChange={handleDocChange} required className="w-full" />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" color="secondary" onClick={() => setDocModalOpen(false)}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={docSaving}>{docSaving ? 'Saving...' : 'Upload'}</Button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
              {activeTab === 4 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold">PUC Documents</div>
                    <Button color="primary" size="sm" onClick={() => handleOpenDocModal('PUC')}>Upload PUC</Button>
                  </div>
                  {docsLoading ? <Loader /> : docsError ? <div className="text-red-500">{docsError}</div> : (
                    <Table
                      columns={[
                        { label: 'Type', accessor: 'type' },
                        { label: 'Expiry', accessor: 'expiryDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                        { label: 'File', accessor: 'fileUrl', render: v => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : '-' },
                        { label: 'Notes', accessor: 'notes' },
                      ]}
                      data={docs.filter(d => d.type === 'PUC')}
                      actions={doc => (
                        <Button color="danger" size="sm" onClick={() => handleDeleteDoc(doc._id)}>Delete</Button>
                      )}
                    />
                  )}
                  <Modal open={docModalOpen && docTypeFilter === 'PUC'} onClose={() => setDocModalOpen(false)} title="Upload PUC Document">
                    <form onSubmit={handleDocSubmit} className="space-y-2">
                      <Input label="Expiry Date" name="expiryDate" type="date" value={docForm.expiryDate} onChange={handleDocChange} />
                      <Input label="Notes" name="notes" value={docForm.notes} onChange={handleDocChange} />
                      <input name="file" type="file" accept="*" onChange={handleDocChange} required className="w-full" />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" color="secondary" onClick={() => setDocModalOpen(false)}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={docSaving}>{docSaving ? 'Saving...' : 'Upload'}</Button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
              {activeTab === 5 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold">Maintenance Records</div>
                    <Button color="primary" size="sm" onClick={() => handleOpenMaintModal()}>Add Maintenance</Button>
                  </div>
                  {maintLoading ? <Loader /> : maintError ? <div className="text-red-500">{maintError}</div> : (
                    <Table
                      columns={[
                        { label: 'Type', accessor: 'type' },
                        { label: 'Date', accessor: 'date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                        { label: 'Status', accessor: 'status' },
                        { label: 'Cost', accessor: 'cost', render: v => v ? `$${v}` : '-' },
                        { label: 'Notes', accessor: 'notes' },
                      ]}
                      data={maintenance}
                      actions={record => (
                        <>
                          <Button color="secondary" size="sm" className="mr-2" onClick={() => handleOpenMaintModal(record)}>Edit</Button>
                          <Button color="danger" size="sm" onClick={() => handleDeleteMaint(record)}>Delete</Button>
                        </>
                      )}
                    />
                  )}
                  <Modal open={maintModalOpen} onClose={handleCloseMaintModal} title={editMaint ? 'Edit Maintenance' : 'Add Maintenance'}>
                    <form onSubmit={handleMaintSubmit} className="space-y-2">
                      <Input label="Type" name="type" value={maintForm.type} onChange={handleMaintChange} required />
                      <Input label="Date" name="date" type="date" value={maintForm.date} onChange={handleMaintChange} required />
                      <Dropdown
                        value={maintForm.status}
                        onChange={e => setMaintForm(f => ({ ...f, status: e.target.value }))}
                        options={[
                          { value: 'Upcoming', label: 'Upcoming' },
                          { value: 'Completed', label: 'Completed' },
                          { value: 'Overdue', label: 'Overdue' },
                        ]}
                        className="w-full"
                      />
                      <Input label="Cost" name="cost" type="number" value={maintForm.cost} onChange={handleMaintChange} min="0" step="0.01" />
                      <Input label="Notes" name="notes" value={maintForm.notes} onChange={handleMaintChange} />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" color="secondary" onClick={handleCloseMaintModal}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={maintSaving}>{maintSaving ? 'Saving...' : (editMaint ? 'Update' : 'Add')}</Button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
              {activeTab === 6 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold">Fuel Logs</div>
                    <Button color="primary" size="sm" onClick={() => handleOpenFuelModal()}>Add Fuel Log</Button>
                  </div>
                  {fuelLoading ? <Loader /> : fuelError ? <div className="text-red-500">{fuelError}</div> : (
                    <Table
                      columns={[
                        { label: 'Date', accessor: 'date', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                        { label: 'Fuel (L)', accessor: 'fuel' },
                        { label: 'Cost', accessor: 'cost', render: v => v ? `$${v}` : '-' },
                        { label: 'Mileage', accessor: 'mileage' },
                      ]}
                      data={fuelLogs}
                      actions={log => (
                        <>
                          <Button color="secondary" size="sm" className="mr-2" onClick={() => handleOpenFuelModal(log)}>Edit</Button>
                          <Button color="danger" size="sm" onClick={() => handleDeleteFuel(log)}>Delete</Button>
                        </>
                      )}
                    />
                  )}
                  <Modal open={fuelModalOpen} onClose={handleCloseFuelModal} title={editFuel ? 'Edit Fuel Log' : 'Add Fuel Log'}>
                    <form onSubmit={handleFuelSubmit} className="space-y-2">
                      <Input label="Date" name="date" type="date" value={fuelForm.date} onChange={handleFuelChange} required />
                      <Input label="Fuel (L)" name="fuel" type="number" value={fuelForm.fuel} onChange={handleFuelChange} required min="0" step="0.01" />
                      <Input label="Cost" name="cost" type="number" value={fuelForm.cost} onChange={handleFuelChange} min="0" step="0.01" />
                      <Input label="Mileage" name="mileage" type="number" value={fuelForm.mileage} onChange={handleFuelChange} min="0" step="0.01" />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" color="secondary" onClick={handleCloseFuelModal}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={fuelSaving}>{fuelSaving ? 'Saving...' : (editFuel ? 'Update' : 'Add')}</Button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
              {activeTab === 7 && (
                <div className="text-gray-500 p-6 text-center">Activity Log feature coming soon.</div>
              )}
              {activeTab === 8 && (
                <div className="flex flex-col items-center justify-center gap-6">
                  <img src={vehicle.photoUrl || '/default-vehicle.png'} alt={vehicle.name} className="w-64 h-40 object-cover rounded-xl border" />
                  <form onSubmit={async e => {
                    e.preventDefault();
                    if (!photoFile) return;
                    // Only allow image files
                    if (!photoFile.type.startsWith('image/')) {
                      alert('Please select a valid image file.');
                      return;
                    }
                    setPhotoUploading(true);
                    try {
                      await updateVehicle(vehicle._id, {
                        name: vehicle.name,
                        vehicleType: vehicle.vehicleType,
                        numberPlate: vehicle.numberPlate,
                        insuranceExpiry: vehicle.insuranceExpiry,
                        pucExpiry: vehicle.pucExpiry || '',
                        assignedClient: vehicle.assignedClient?._id || (typeof vehicle.assignedClient === 'string' ? vehicle.assignedClient : undefined),
                        assignedTrip: vehicle.assignedTrip || '',
                        driverName: vehicle.driverName || '',
                        driverContact: vehicle.driverContact || '',
                        status: vehicle.status || 'available',
                        agencyId: vehicle.agencyId?._id || (typeof vehicle.agencyId === 'string' ? vehicle.agencyId : undefined),
                        photo: photoFile,
                      }, token);
                      // Refetch vehicle
                      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vehicles/${vehicle._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const data = await res.json();
                      setVehicle(data);
                      setPhotoFile(null);
                    } finally {
                      setPhotoUploading(false);
                    }
                  }}>
                    <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="mb-2" />
                    <Button color="primary" size="sm" type="submit" disabled={photoUploading}>{photoUploading ? 'Uploading...' : 'Change Photo'}</Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleDetail; 