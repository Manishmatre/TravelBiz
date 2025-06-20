import React, { useState, useEffect } from "react";
import Profile from "../components/common/Profile";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Tab from "../components/common/Tab";
import { FaUser, FaBriefcase, FaUniversity, FaLock, FaHistory, FaCog, FaUpload, FaFileAlt } from 'react-icons/fa';
import { getProfile, updateProfile } from '../services/userService';
import ProfileBankSection from "../components/ProfileBankSection";
import ProfileDocumentsSection from "../components/ProfileDocumentsSection";
import { getFiles, uploadFile, deleteFile } from '../services/fileService';

const tabList = [
  { label: 'Personal & Address', icon: <FaUser /> },
  { label: 'Professional Information', icon: <FaBriefcase /> },
  { label: 'Bank Account & Payment', icon: <FaUniversity /> },
  { label: 'Documents', icon: <FaFileAlt /> },
  { label: 'Settings', icon: <FaCog /> },
];

const ProfilePage = () => {
  const { user, token, reloadUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  // Local state for user documents (file objects)
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docSuccess, setDocSuccess] = useState("");
  const [docError, setDocError] = useState("");
  // Unified form state for all fields
  const [formData, setFormData] = useState({
    avatarUrl: user?.avatarUrl || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || '',
      postalCode: user?.address?.postalCode || '',
    },
    // Professional
    jobTitle: user?.jobTitle || '',
    department: user?.department || '',
    employeeId: user?.employeeId || '',
    joiningDate: user?.joiningDate || '',
    skills: user?.skills || '',
    linkedin: user?.linkedin || '',
    resume: user?.resume || '',
    // Bank
    bankHolder: user?.bankHolder || '',
    bankName: user?.bankName || '',
    account: user?.account || '',
    ifsc: user?.ifsc || '',
    upi: user?.upi || '',
    pan: user?.pan || '',
    salary: user?.salary || '',
    // Account
    twofa: user?.twofa || false,
    emailVerified: user?.emailVerified || false,
    // Settings
    notifications: user?.notifications ?? true,
    language: user?.language || 'en',
    theme: user?.theme || 'light',
    privacy: user?.privacy || false,
  });
  const [formDataBackup, setFormDataBackup] = useState(formData);
  // Add state for bankAccounts and paymentMethods
  const [bankAccounts, setBankAccounts] = useState(user?.bankAccounts?.length ? user.bankAccounts : [{
    bankHolder: user?.bankHolder || '',
    bankName: user?.bankName || '',
    account: user?.account || '',
    ifsc: user?.ifsc || '',
    upi: user?.upi || '',
    pan: user?.pan || '',
    salary: user?.salary || ''
  }]);
  const [paymentMethods, setPaymentMethods] = useState(user?.paymentMethods || []);
  const [loading, setLoading] = useState(true);

  // Unified handleChange supports dot notation for nested fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else {
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleEdit = () => {
    setFormDataBackup(formData); // backup current state
    setEditMode(true);
  };

  const handleCancel = () => {
    setFormData(formDataBackup); // revert to backup
    setEditMode(false);
    setSuccess("");
    setError("");
    setValidationError("");
    // Optionally reset documents to previous state if desired
  };

  // Fetch documents on mount
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const fetchDocs = async () => {
      setDocLoading(true);
      try {
        const docs = await getFiles(token);
        setDocuments(docs);
      } catch (err) {
        setDocError("Failed to load documents");
      } finally {
        setDocLoading(false);
      }
    };
    fetchDocs();
  }, [token]);

  // Document upload handler
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    setDocLoading(true);
    setDocError("");
    setDocSuccess("");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        await uploadFile(formData, token);
      }
      setDocSuccess("Documents uploaded successfully!");
      // Refresh document list
      const docs = await getFiles(token);
      setDocuments(docs);
    } catch (err) {
      setDocError("Failed to upload document(s)");
    } finally {
      setDocLoading(false);
    }
  };

  // Document remove handler
  const handleRemoveDocument = async (id) => {
    setDocLoading(true);
    setDocError("");
    setDocSuccess("");
    try {
      await deleteFile(id, token);
      setDocSuccess("Document removed successfully!");
      // Refresh document list
      const docs = await getFiles(token);
      setDocuments(docs);
    } catch (err) {
      setDocError("Failed to remove document");
    } finally {
      setDocLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setFormData(prev => ({ ...prev, avatarUrl: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  // Handlers for bank accounts
  const handleBankChange = (idx, field, value) => {
    setBankAccounts(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };
  const handleAddBank = () => {
    setBankAccounts(prev => [...prev, { bankHolder: '', bankName: '', account: '', ifsc: '', upi: '', pan: '', salary: '' }]);
  };
  const handleRemoveBank = (idx) => {
    setBankAccounts(prev => prev.filter((_, i) => i !== idx));
  };
  // Handlers for payment methods
  const handlePaymentChange = (idx, field, value) => {
    setPaymentMethods(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const handleAddPayment = () => {
    setPaymentMethods(prev => [...prev, { type: '', details: '' }]);
  };
  const handleRemovePayment = (idx) => {
    setPaymentMethods(prev => prev.filter((_, i) => i !== idx));
  };

  // Fetch user profile on mount and after update
  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const userData = await getProfile(token);
      setFormData({
        avatarUrl: userData.avatarUrl || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          country: userData.address?.country || '',
          postalCode: userData.address?.postalCode || '',
        },
        jobTitle: userData.jobTitle || '',
        department: userData.department || '',
        employeeId: userData.employeeId || '',
        joiningDate: userData.joiningDate || '',
        skills: userData.skills || '',
        linkedin: userData.linkedin || '',
        resume: userData.resume || '',
        bankHolder: userData.bankHolder || '',
        bankName: userData.bankName || '',
        account: userData.account || '',
        ifsc: userData.ifsc || '',
        upi: userData.upi || '',
        pan: userData.pan || '',
        salary: userData.salary || '',
        twofa: userData.twofa || false,
        emailVerified: userData.emailVerified || false,
        notifications: userData.notifications ?? true,
        language: userData.language || 'en',
        theme: userData.theme || 'light',
        privacy: userData.privacy || false,
      });
      setFormDataBackup({
        avatarUrl: userData.avatarUrl || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          country: userData.address?.country || '',
          postalCode: userData.address?.postalCode || '',
        },
        jobTitle: userData.jobTitle || '',
        department: userData.department || '',
        employeeId: userData.employeeId || '',
        joiningDate: userData.joiningDate || '',
        skills: userData.skills || '',
        linkedin: userData.linkedin || '',
        resume: userData.resume || '',
        bankHolder: userData.bankHolder || '',
        bankName: userData.bankName || '',
        account: userData.account || '',
        ifsc: userData.ifsc || '',
        upi: userData.upi || '',
        pan: userData.pan || '',
        salary: userData.salary || '',
        twofa: userData.twofa || false,
        emailVerified: userData.emailVerified || false,
        notifications: userData.notifications ?? true,
        language: userData.language || 'en',
        theme: userData.theme || 'light',
        privacy: userData.privacy || false,
      });
      setBankAccounts(userData.bankAccounts?.length ? userData.bankAccounts : [{
        bankHolder: userData.bankHolder || '',
        bankName: userData.bankName || '',
        account: userData.account || '',
        ifsc: userData.ifsc || '',
        upi: userData.upi || '',
        pan: userData.pan || '',
        salary: userData.salary || ''
      }]);
      setPaymentMethods(userData.paymentMethods || []);
    } catch (err) {
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchUserProfile();
    // eslint-disable-next-line
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...formData,
        bankAccounts,
        paymentMethods
      };
      await updateProfile(payload, token);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      await fetchUserProfile(); // Re-fetch user data after update
      reloadUser && reloadUser();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[300px]">Loading...</div>;

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <div className="w-full">
        {/* Header: Avatar, Name/Description, Edit Btn (matches AgencyProfile) */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="flex-shrink-0 flex flex-col items-center">
            {editMode ? (
              <div className="flex flex-col items-center">
                <img src={formData.avatarUrl || '/default-avatar.png'} alt="User Avatar" className="h-32 w-32 rounded-2xl object-cover border-4 border-blue-200 shadow mb-2" />
                <label className="inline-flex items-center px-3 py-2 mt-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                  <FaUpload className="mr-2" />
                  Upload Avatar
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            ) : (
              <img src={formData.avatarUrl || user.avatarUrl || '/default-avatar.png'} alt="User Avatar" className="h-32 w-32 rounded-2xl object-cover border-4 border-blue-200 shadow mb-2" />
            )}
          </div>
          <div className="flex-1 w-full">
            {editMode ? (
              <>
                <div className="mb-2 flex items-center gap-4">
                  <FaUser className="text-blue-600 text-2xl" />
                  <Input
                    className="w-full text-3xl font-bold"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input
                  className="mb-2"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
                <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-4">
                  <span><span className="font-semibold">Role:</span> {user.role}</span>
                  {user.agencyId && <span><span className="font-semibold">Agency:</span> {user.agencyId}</span>}
                  {user.createdAt && (
                    <span><span className="font-semibold">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-4"><FaUser className="text-blue-600" /> {formData.name || user.name}</h1>
                <p className="text-gray-600 mb-2">{formData.email || user.email}</p>
                <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-4">
                  <span><span className="font-semibold">Role:</span> {user.role}</span>
                  {user.agencyId && <span><span className="font-semibold">Agency:</span> {user.agencyId}</span>}
                  {user.createdAt && (
                    <span><span className="font-semibold">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </>
            )}
          </div>
          </div>
          {/* Edit/Save/Cancel Buttons in header (like AgencyProfile) */}
          {!editMode && (
            <Button color="primary" size="md" className="mt-4 md:mt-0" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
          {editMode && (
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
              <Button type="button" color="primary" disabled={saving} onClick={handleSubmit}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <Tab tabs={tabList} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {/* Tab Panels */}
        <div className="w-full">
          {/* Profile Tab */}
          {activeTab === 0 && (
            <form onSubmit={handleSubmit}>
              <Card title="Personal & Address" className="p-6 mb-6">
                <div className="flex flex-col gap-4">
                  {editMode ? (
                    <>
                      <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
                      <Input label="Email" name="email" value={formData.email} onChange={handleChange} required disabled />
                      <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                      <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                      <Input label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
                      <Input label="Street" name="address.street" value={formData.address.street} onChange={handleChange} />
                      <Input label="City" name="address.city" value={formData.address.city} onChange={handleChange} />
                      <Input label="State" name="address.state" value={formData.address.state} onChange={handleChange} />
                      <Input label="Country" name="address.country" value={formData.address.country} onChange={handleChange} />
                      <Input label="Postal Code" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} />
                    </>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Name:</span> {formData.name}</div>
                      <div className="mb-2"><span className="font-semibold">Email:</span> {formData.email}</div>
                      <div className="mb-2"><span className="font-semibold">Phone:</span> {formData.phone}</div>
                      <div className="mb-2"><span className="font-semibold">Date of Birth:</span> {formData.dateOfBirth}</div>
                      <div className="mb-2"><span className="font-semibold">Gender:</span> {formData.gender}</div>
                      <div className="mb-2"><span className="font-semibold">Street:</span> {formData.address.street}</div>
                      <div className="mb-2"><span className="font-semibold">City:</span> {formData.address.city}</div>
                      <div className="mb-2"><span className="font-semibold">State:</span> {formData.address.state}</div>
                      <div className="mb-2"><span className="font-semibold">Country:</span> {formData.address.country}</div>
                      <div className="mb-2"><span className="font-semibold">Postal Code:</span> {formData.address.postalCode}</div>
                    </>
                  )}
                  {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                  {error && <div className="text-red-600 text-center mt-2">{error}</div>}
                </div>
              </Card>
            </form>
          )}
          {/* Professional Information Tab */}
          {activeTab === 1 && (
            <form onSubmit={handleSubmit}>
              <Card title="Professional Information" className="p-6 mb-6">
                <div className="flex flex-col gap-4">
                  {editMode ? (
                    <>
                      <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
                      <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
                      <Input label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleChange} />
                      <Input label="Joining Date" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} />
                      <Input label="Skills" name="skills" value={formData.skills} onChange={handleChange} />
                      <Input label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                      <Input label="Resume Link" name="resume" value={formData.resume} onChange={handleChange} />
                    </>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Job Title:</span> {formData.jobTitle}</div>
                      <div className="mb-2"><span className="font-semibold">Department:</span> {formData.department}</div>
                      <div className="mb-2"><span className="font-semibold">Employee ID:</span> {formData.employeeId}</div>
                      <div className="mb-2"><span className="font-semibold">Joining Date:</span> {formData.joiningDate}</div>
                      <div className="mb-2"><span className="font-semibold">Skills:</span> {formData.skills}</div>
                      <div className="mb-2"><span className="font-semibold">LinkedIn:</span> {formData.linkedin}</div>
                      <div className="mb-2"><span className="font-semibold">Resume Link:</span> {formData.resume}</div>
                    </>
                  )}
                  {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                  {error && <div className="text-red-600 text-center mt-2">{error}</div>}
                </div>
              </Card>
            </form>
          )}
          {/* Bank Account & Payment Methods Tab */}
          {activeTab === 2 && (
            <ProfileBankSection
              bankAccounts={bankAccounts}
              paymentMethods={paymentMethods}
              editMode={editMode}
              onBankChange={handleBankChange}
              onAddBank={handleAddBank}
              onRemoveBank={handleRemoveBank}
              onPaymentChange={handlePaymentChange}
              onAddPayment={handleAddPayment}
              onRemovePayment={handleRemovePayment}
              onSubmit={handleSubmit}
              saving={saving}
              success={success}
              error={error}
            />
          )}
          {/* Documents Tab */}
          {activeTab === 3 && (
            <ProfileDocumentsSection
              documents={documents}
              editMode={editMode}
              onUpload={handleDocumentUpload}
              onRemove={handleRemoveDocument}
              loading={docLoading}
              success={docSuccess}
              error={docError}
            />
          )}
          {/* Settings Tab */}
          {activeTab === 4 && (
            <Card title="Settings" className="p-6 mb-6">
              <div className="flex flex-col gap-4">
                {editMode ? (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="font-semibold">Notifications</label>
                      <input type="checkbox" name="notifications" checked={formData.notifications} onChange={handleChange} />
                    </div>
                    <Input label="Language" name="language" value={formData.language} onChange={handleChange} />
                    <Input label="Theme" name="theme" value={formData.theme} onChange={handleChange} />
                    <div className="flex items-center gap-2">
                      <label className="font-semibold">Privacy</label>
                      <input type="checkbox" name="privacy" checked={formData.privacy} onChange={handleChange} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2"><span className="font-semibold">Notifications:</span> {formData.notifications ? 'On' : 'Off'}</div>
                    <div className="mb-2"><span className="font-semibold">Language:</span> {formData.language}</div>
                    <div className="mb-2"><span className="font-semibold">Theme:</span> {formData.theme}</div>
                    <div className="mb-2"><span className="font-semibold">Privacy:</span> {formData.privacy ? 'Enabled' : 'Disabled'}</div>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
