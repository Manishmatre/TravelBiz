import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Tab from '../components/common/Tab';
import Loader from '../components/common/Loader';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Dropdown from '../components/common/Dropdown';
import { getUserById, updateUser, getUserDocuments, uploadUserDocument, deleteUserDocument, updateUserPhoto } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { getVehicles, addVehicleAssignment, updateVehicleAssignment, deleteVehicleAssignment } from '../services/vehicleService';

const tabLabels = [
  'General Info',
  'Documents',
  'Assignments',
  'Activity Log',
  'Photo',
];

function DriverDetail() {
  const { id } = useParams();
  const { token } = useAuth ? useAuth() : { token: localStorage.getItem('token') };
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState('');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({ type: '', expiryDate: '', file: null });
  const [docSaving, setDocSaving] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(true);
  const [assignError, setAssignError] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [assignForm, setAssignForm] = useState({ vehicleId: '', status: 'Assigned', assignedAt: '' });
  const [assignSaving, setAssignSaving] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const fetchDriver = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getUserById(id, token);
        setDriver(data);
      } catch (err) {
        setError('Failed to fetch driver');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDriver();
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;
    setDocsLoading(true);
    getUserDocuments(id, token)
      .then(setDocs)
      .catch(e => setDocsError(e.response?.data?.message || 'Failed to load documents'))
      .finally(() => setDocsLoading(false));
  }, [id, token]);

  useEffect(() => {
    if (!token || !driver?._id) return;
    setAssignLoading(true);
    getVehicles(token)
      .then(vehiclesRes => {
        setVehicles(vehiclesRes);
        // Flatten all assignments for this driver
        const allAssign = vehiclesRes.flatMap(vehicle =>
          (vehicle.assignments || []).filter(a => (a.driver?._id || a.driver) === driver._id).map(a => ({
            ...a,
            vehicleName: vehicle.name,
            vehicleId: vehicle._id,
            numberPlate: vehicle.numberPlate,
          }))
        );
        setAssignments(allAssign);
      })
      .catch(e => setAssignError(e.response?.data?.message || 'Failed to load assignments'))
      .finally(() => setAssignLoading(false));
  }, [token, driver?._id]);

  useEffect(() => {
    if (!token || !driver?._id) return;
    setActivityLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/activity?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActivity(data.filter(a => a.performedBy === driver._id));
        } else {
          setActivity([]);
          setActivityError('Unexpected response from server');
        }
      })
      .catch(err => setActivityError(err.message || 'Failed to fetch activity log'))
      .finally(() => setActivityLoading(false));
  }, [token, driver?._id]);

  const handleEdit = () => {
    setEditForm({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      gender: driver.gender || '',
      dateOfBirth: driver.dateOfBirth || '',
      joiningDate: driver.joiningDate ? driver.joiningDate.slice(0, 10) : '',
      status: driver.status || 'Active',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.slice(0, 10) : '',
      address: driver.address || { street: '', city: '', state: '', country: '', postalCode: '' },
    });
    setEditMode(true);
    setFormError('');
  };
  const handleCancelEdit = () => {
    setEditMode(false);
    setFormError('');
  };
  const handleEditChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setEditForm(f => ({ ...f, address: { ...f.address, [key]: value } }));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleEditSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    if (!editForm.name || !editForm.email) {
      setFormError('Name and email are required');
      setSaving(false);
      return;
    }
    const payload = { ...editForm, status: editForm.status || 'Active' };
    try {
      await updateUser(driver._id, payload, token);
      const updated = await getUserById(driver._id, token);
      setDriver(updated);
      setEditMode(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update driver');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDocModal = () => {
    setDocForm({ type: '', expiryDate: '', file: null });
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
      await uploadUserDocument(id, docForm, token);
      const updated = await getUserDocuments(id, token);
      setDocs(updated);
      setDocModalOpen(false);
      setDocForm({ type: '', expiryDate: '', file: null });
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
      await deleteUserDocument(id, docId, token);
      setDocs(docs.filter(d => d._id !== docId));
    } catch (err) {
      setDocsError(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDocSaving(false);
    }
  };

  const handleOpenAssignModal = (record = null) => {
    setEditAssignment(record);
    setAssignForm(record ? {
      vehicleId: record.vehicleId,
      status: record.status || 'Assigned',
      assignedAt: record.assignedAt ? record.assignedAt.slice(0, 10) : '',
    } : { vehicleId: '', status: 'Assigned', assignedAt: '' });
    setAssignModalOpen(true);
  };
  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setEditAssignment(null);
    setAssignForm({ vehicleId: '', status: 'Assigned', assignedAt: '' });
  };
  const handleAssignChange = e => {
    const { name, value } = e.target;
    setAssignForm(f => ({ ...f, [name]: value }));
  };
  const handleAssignSubmit = async e => {
    e.preventDefault();
    setAssignSaving(true);
    try {
      if (!assignForm.vehicleId) throw new Error('Please select a vehicle');
      const payload = {
        driver: driver._id,
        status: assignForm.status,
        assignedAt: assignForm.assignedAt,
      };
      if (editAssignment) {
        await updateVehicleAssignment(assignForm.vehicleId, editAssignment._id, payload, token);
      } else {
        await addVehicleAssignment(assignForm.vehicleId, payload, token);
      }
      // Refresh assignments
      const vehiclesRes = await getVehicles(token);
      setVehicles(vehiclesRes);
      const allAssign = vehiclesRes.flatMap(vehicle =>
        (vehicle.assignments || []).filter(a => (a.driver?._id || a.driver) === driver._id).map(a => ({
          ...a,
          vehicleName: vehicle.name,
          vehicleId: vehicle._id,
          numberPlate: vehicle.numberPlate,
        }))
      );
      setAssignments(allAssign);
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
      await deleteVehicleAssignment(record.vehicleId, record._id, token);
      setAssignments(assignments.filter(a => a._id !== record._id));
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setAssignSaving(false);
    }
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setPhotoError('Only image files are allowed');
      setPhotoFile(null);
      return;
    }
    setPhotoFile(file);
    setPhotoError('');
  };
  const handlePhotoUpload = async e => {
    e.preventDefault();
    if (!photoFile) {
      setPhotoError('Please select an image file');
      return;
    }
    setPhotoSaving(true);
    setPhotoError('');
    try {
      const updated = await updateUserPhoto(driver._id, photoFile, token);
      setDriver(updated);
      setPhotoFile(null);
    } catch (err) {
      setPhotoError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Driver Details</h1>
          <Link to="/drivers" className="ml-auto">
            <Button color="secondary" size="sm">&larr; Back to Drivers</Button>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full">
          <Tab tabs={tabLabels.map(label => ({ label }))} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />
          {loading ? (
            <Loader className="my-10" />
          ) : error ? (
            <div className="text-red-500 p-6">{error}</div>
          ) : !driver ? (
            <div className="text-gray-500 p-6">Driver not found.</div>
          ) : (
            <>
              {activeTab === 0 && (
                <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                  {/* Photo */}
                  <img src={driver.avatarUrl || '/default-user.png'} alt={driver.name} className="w-40 h-40 object-cover rounded-xl border mb-4 md:mb-0" />
                  <div className="flex-1">
                    {!editMode ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xl font-bold">{driver.name}</div>
                          <Button color="primary" size="sm" onClick={handleEdit}>Edit</Button>
                        </div>
                        <div className="mb-1"><span className="font-semibold">Email:</span> {driver.email}</div>
                        <div className="mb-1"><span className="font-semibold">Phone:</span> {driver.phone || '-'}</div>
                        <div className="mb-1"><span className="font-semibold">Gender:</span> {driver.gender || '-'}</div>
                        <div className="mb-1"><span className="font-semibold">Date of Birth:</span> {driver.dateOfBirth || '-'}</div>
                        <div className="mb-1"><span className="font-semibold">Joining Date:</span> {driver.joiningDate ? new Date(driver.joiningDate).toLocaleDateString() : '-'}</div>
                        <div className="mb-1"><span className="font-semibold">Status:</span> {driver.status || 'Not Set'}</div>
                        <div className="mb-1"><span className="font-semibold">License Number:</span> {driver.licenseNumber || '-'}</div>
                        <div className="mb-1"><span className="font-semibold">License Expiry:</span> {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : '-'}</div>
                        <div className="mb-1"><span className="font-semibold">Assigned Vehicle:</span> {driver.assignedVehicle?.numberPlate || driver.assignedVehicle?.name || 'Not Assigned'}</div>
                        <div className="mb-1"><span className="font-semibold">Address:</span> {driver.address ? `${driver.address.street || ''} ${driver.address.city || ''} ${driver.address.state || ''}` : '-'}</div>
                      </>
                    ) : (
                      <form onSubmit={handleEditSubmit} className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Name" name="name" value={editForm.name} onChange={handleEditChange} required />
                          <Input label="Email" name="email" value={editForm.email} onChange={handleEditChange} required type="email" />
                          <Input label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
                          <Dropdown label="Gender" name="gender" value={editForm.gender} onChange={handleEditChange} options={[
                            { value: '', label: 'Select Gender' },
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' },
                          ]} className="w-full" required />
                          <Input label="Date of Birth" name="dateOfBirth" value={editForm.dateOfBirth} onChange={handleEditChange} type="date" />
                          <Input label="Joining Date" name="joiningDate" value={editForm.joiningDate} onChange={handleEditChange} type="date" />
                          <Dropdown label="Status" name="status" value={editForm.status} onChange={handleEditChange} options={[
                            { value: '', label: 'Select Status' },
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                            { value: 'On Leave', label: 'On Leave' },
                            { value: 'Suspended', label: 'Suspended' },
                          ]} className="w-full" required />
                          <Input label="License Number" name="licenseNumber" value={editForm.licenseNumber} onChange={handleEditChange} />
                          <Input label="License Expiry" name="licenseExpiry" value={editForm.licenseExpiry} onChange={handleEditChange} type="date" />
                          <Input label="Street" name="address.street" value={editForm.address?.street || ''} onChange={handleEditChange} />
                          <Input label="City" name="address.city" value={editForm.address?.city || ''} onChange={handleEditChange} />
                          <Input label="State" name="address.state" value={editForm.address?.state || ''} onChange={handleEditChange} />
                          <Input label="Country" name="address.country" value={editForm.address?.country || ''} onChange={handleEditChange} />
                          <Input label="Postal Code" name="address.postalCode" value={editForm.address?.postalCode || ''} onChange={handleEditChange} />
                        </div>
                        {formError && <div className="text-red-500 text-sm">{formError}</div>}
                        <div className="flex justify-end gap-2 mt-4">
                          <Button type="button" color="secondary" onClick={handleCancelEdit}>Cancel</Button>
                          <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold">Documents</div>
                    <Button color="primary" size="sm" onClick={handleOpenDocModal}>Upload Document</Button>
                  </div>
                  {docsLoading ? <Loader /> : docsError ? <div className="text-red-500">{docsError}</div> : (
                    <Table
                      columns={[
                        { label: 'Type', accessor: 'type' },
                        { label: 'Expiry', accessor: 'expiryDate', render: v => v ? new Date(v).toLocaleDateString() : '-' },
                        { label: 'File', accessor: 'url', render: v => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> : '-' },
                      ]}
                      data={docs}
                      actions={doc => (
                        <Button color="danger" size="sm" onClick={() => handleDeleteDoc(doc._id)}>Delete</Button>
                      )}
                    />
                  )}
                  <Modal open={docModalOpen} onClose={() => setDocModalOpen(false)} title="Upload Document">
                    <form onSubmit={handleDocSubmit} className="space-y-2">
                      <Input label="Type" name="type" value={docForm.type} onChange={handleDocChange} required />
                      <Input label="Expiry Date" name="expiryDate" type="date" value={docForm.expiryDate} onChange={handleDocChange} />
                      <input name="file" type="file" onChange={handleDocChange} required className="w-full" />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" color="secondary" onClick={() => setDocModalOpen(false)}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={docSaving}>{docSaving ? 'Saving...' : 'Upload'}</Button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold">Assignments</div>
                    <Button color="primary" size="sm" onClick={() => handleOpenAssignModal()}>Add Assignment</Button>
                  </div>
                  {assignLoading ? <Loader /> : assignError ? <div className="text-red-500">{assignError}</div> : (
                    <Table
                      columns={[
                        { label: 'Vehicle', accessor: 'vehicleName' },
                        { label: 'Number Plate', accessor: 'numberPlate' },
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
                      <Dropdown
                        label="Vehicle"
                        name="vehicleId"
                        value={assignForm.vehicleId}
                        onChange={handleAssignChange}
                        options={[{ value: '', label: 'Select vehicle' }, ...vehicles.map(v => ({ value: v._id, label: v.name }))]}
                        className="w-full"
                        required
                      />
                      <Input label="Assignment Date" name="assignedAt" type="date" value={assignForm.assignedAt} onChange={handleAssignChange} />
                      <Dropdown
                        label="Status"
                        name="status"
                        value={assignForm.status}
                        onChange={handleAssignChange}
                        options={[
                          { value: 'Assigned', label: 'Assigned' },
                          { value: 'Unassigned', label: 'Unassigned' },
                        ]}
                        className="w-full"
                      />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" color="secondary" onClick={handleCloseAssignModal}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={assignSaving}>{assignSaving ? 'Saving...' : (editAssignment ? 'Update' : 'Add')}</Button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
              {activeTab === 3 && (
                <div>
                  <div className="text-xl font-bold mb-4">Activity Log</div>
                  {activityLoading ? <Loader /> : activityError ? <div className="text-red-500">{activityError}</div> : (
                    Array.isArray(activity) && activity.length > 0 ? (
                      <Table
                        columns={[
                          { label: 'Timestamp', accessor: 'timestamp', render: v => v ? new Date(v).toLocaleString() : '' },
                          { label: 'Action', accessor: 'actionType' },
                          { label: 'Entity', accessor: 'entityType' },
                          { label: 'Name', accessor: 'entityName' },
                          { label: 'Details', accessor: 'details', render: v => v ? JSON.stringify(v) : '' },
                        ]}
                        data={activity}
                      />
                    ) : (
                      <div className="text-gray-500 p-6">No activity log data found for this driver.</div>
                    )
                  )}
                </div>
              )}
              {activeTab === 4 && (
                <div className="flex flex-col items-center justify-center gap-6">
                  <img src={
                    photoFile
                      ? URL.createObjectURL(photoFile)
                      : driver.avatarUrl
                        ? driver.avatarUrl.startsWith('/uploads/')
                          ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\\/g, '').replace(/\/api$/, '')}${driver.avatarUrl}`
                          : driver.avatarUrl
                        : '/default-user.png'
                  } alt={driver.name} className="w-64 h-64 object-cover rounded-xl border" />
                  <form onSubmit={handlePhotoUpload} className="flex flex-col items-center gap-2 w-full max-w-xs">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full" />
                    {photoError && <div className="text-red-500 text-sm">{photoError}</div>}
                    <Button color="primary" size="sm" type="submit" disabled={photoSaving}>{photoSaving ? 'Uploading...' : 'Change Photo'}</Button>
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

export default DriverDetail; 