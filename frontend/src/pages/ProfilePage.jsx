import React, { useState } from "react";
import Profile from "../components/common/Profile";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Tab from "../components/common/Tab";
import { FaUser, FaBriefcase, FaUniversity, FaLock, FaHistory, FaCog, FaUpload, FaFileAlt } from 'react-icons/fa';

const tabList = [
  { label: 'Personal', icon: <FaUser /> },
  { label: 'Professional', icon: <FaBriefcase /> },
  { label: 'Bank', icon: <FaUniversity /> },
  { label: 'Account', icon: <FaLock /> },
  { label: 'Documents', icon: <FaFileAlt /> },
  { label: 'Activity', icon: <FaHistory /> },
  { label: 'Settings', icon: <FaCog /> },
];

const ProfilePage = () => {
  const { user, reloadUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  // Local state for user documents (file objects)
  const [documents, setDocuments] = useState([
    // Example: { name: 'ID Proof.pdf', file: null }
  ]);
  // Unified form state for all fields
  const [formData, setFormData] = useState({
    avatarUrl: user?.avatarUrl || '',
    name: user?.name || '',
    email: user?.email || '',
    // Personal
    // password: '',
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
    password: '',
    confirmPassword: '',
    twofa: user?.twofa || false,
    emailVerified: user?.emailVerified || false,
    // Settings
    notifications: user?.notifications ?? true,
    language: user?.language || 'en',
    theme: user?.theme || 'light',
    privacy: user?.privacy || false,
  });
  const [formDataBackup, setFormDataBackup] = useState(formData);

  // Unified handleChange supports dot notation for nested fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  // Handle document file selection
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(prevDocs => [
      ...prevDocs,
      ...files.map(f => ({ name: f.name, file: f }))
    ]);
  };
  // Remove a document from the list
  const handleRemoveDocument = (index) => {
    setDocuments(prevDocs => prevDocs.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setFormData(prev => ({ ...prev, avatarUrl: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    // Password validation (only if editing Account tab and in editMode)
    if (activeTab === 3 && editMode) {
      if ((formData.password || formData.confirmPassword) && formData.password !== formData.confirmPassword) {
        setValidationError("Passwords do not match.");
        return;
      }
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      reloadUser && reloadUser();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
          {/* Personal Tab */}
          {activeTab === 0 && (
            <form onSubmit={handleSubmit}>
              <Card title="Personal Info" className="p-6 mb-6">
                <div className="flex flex-col gap-4">
                  {editMode ? (
                    <>
                      <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled
                      />
                      {/* Uncomment to allow password change
                      <Input
                        label="New Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      */}
                    </>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Name:</span> {formData.name}</div>
                      <div className="mb-2"><span className="font-semibold">Email:</span> {formData.email}</div>
                    </>
                  )}

                  {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                  {error && <div className="text-red-600 text-center mt-2">{error}</div>}
                </div>
              </Card>
            </form>
          )}
          {/* Professional Tab */}
          {activeTab === 1 && (
            <form onSubmit={handleSubmit}>
              <Card title="Professional Info" className="p-6 mb-6">
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
                  <div className="flex justify-end gap-3 w-full mt-2">
                    {!editMode && <Button type="button" color="primary" onClick={handleEdit}>Edit</Button>}
                    {editMode && (
                      <>
                        <Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                      </>
                    )}
                  </div>
                  {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                  {error && <div className="text-red-600 text-center mt-2">{error}</div>}
                </div>
              </Card>
            </form>
          )}
          {/* Bank Tab */}
          {activeTab === 2 && (
            <form onSubmit={handleSubmit}>
              <Card title="Bank Details" className="p-6 mb-6">
                <div className="flex flex-col gap-4">
                  {editMode ? (
                    <>
                      <Input label="Account Holder" name="bankHolder" value={formData.bankHolder} onChange={handleChange} />
                      <Input label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} />
                      <Input label="Account Number" name="account" value={formData.account} onChange={handleChange} />
                      <Input label="IFSC" name="ifsc" value={formData.ifsc} onChange={handleChange} />
                      <Input label="UPI" name="upi" value={formData.upi} onChange={handleChange} />
                      <Input label="PAN" name="pan" value={formData.pan} onChange={handleChange} />
                      <Input label="Salary/Pay Info" name="salary" value={formData.salary} onChange={handleChange} />
                    </>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Account Holder:</span> {formData.bankHolder}</div>
                      <div className="mb-2"><span className="font-semibold">Bank Name:</span> {formData.bankName}</div>
                      <div className="mb-2"><span className="font-semibold">Account Number:</span> {formData.account}</div>
                      <div className="mb-2"><span className="font-semibold">IFSC:</span> {formData.ifsc}</div>
                      <div className="mb-2"><span className="font-semibold">UPI:</span> {formData.upi}</div>
                      <div className="mb-2"><span className="font-semibold">PAN:</span> {formData.pan}</div>
                      <div className="mb-2"><span className="font-semibold">Salary/Pay Info:</span> {formData.salary}</div>
                    </>
                  )}
                  <div className="flex justify-end gap-3 w-full mt-2">
                    {!editMode && <Button type="button" color="primary" onClick={handleEdit}>Edit</Button>}
                    {editMode && (
                      <>
                        <Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                      </>
                    )}
                  </div>
                  {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                  {error && <div className="text-red-600 text-center mt-2">{error}</div>}
                </div>
              </Card>
            </form>
          )}
          {/* Account Tab */}
          {activeTab === 3 && (
            <form onSubmit={handleSubmit}>
              <Card title="Account Security" className="p-6 mb-6">
                <div className="flex flex-col gap-4">
                  {editMode ? (
                    <>
                      <Input label="New Password" name="password" type="password" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                      <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                      <div className="flex items-center gap-2">
                        <label className="font-semibold">2FA Enabled:</label>
                        <input type="checkbox" name="twofa" checked={formData.twofa} onChange={handleChange} />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="font-semibold">Email Verified:</label>
                        <input type="checkbox" name="emailVerified" checked={formData.emailVerified} onChange={handleChange} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Password:</span> ******</div>
                      <div className="mb-2"><span className="font-semibold">2FA Enabled:</span> {formData.twofa ? 'Yes' : 'No'}</div>
                      <div className="mb-2"><span className="font-semibold">Email Verified:</span> {formData.emailVerified ? 'Yes' : 'No'}</div>
                    </>
                  )}
                  <div className="flex justify-end gap-3 w-full mt-2">
                    {!editMode && <Button type="button" color="primary" onClick={handleEdit}>Edit</Button>}
                    {editMode && (
                      <>
                        <Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                      </>
                    )}
                  </div>
                  {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                  {error && <div className="text-red-600 text-center mt-2">{error}</div>}
                </div>
              </Card>
            </form>
          )}

          {/* Documents Tab */}
          {activeTab === 4 && (
            <Card title="User Documents" className="p-6 mb-6">
              <div className="flex flex-col gap-4">
                {editMode && (
                  <div>
                    <label className="block font-medium mb-2">Upload Document</label>
                    <input type="file" multiple className="block" onChange={handleDocumentUpload} />
                  </div>
                )}
                {/* Uploaded documents list */}
                <div className="mt-4">
                  <div className="font-semibold mb-2">Uploaded Documents:</div>
                  <ul className="list-disc ml-6 text-gray-700">
                    {documents.length === 0 && <li className="text-gray-400">No documents uploaded.</li>}
                    {documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{doc.name}</span>
                        {editMode && (
                          <button type="button" className="ml-4 text-red-500 hover:underline" onClick={() => handleRemoveDocument(idx)}>
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
          {/* Activity Tab */}
          {activeTab === 5 && (
            <Card title="Activity" className="p-6 mb-6">
              <div className="text-gray-500">(To be implemented: Login history, recent actions, etc.)</div>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 6 && (
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
          {/* Settings Tab */}
          {activeTab === 5 && (
            <form onSubmit={handleSubmit}>
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
                  <div className="flex justify-end gap-3 w-full mt-2">
                    {!editMode && <Button type="button" color="primary" onClick={handleEdit}>Edit</Button>}
                    {editMode && (
                      <>
                        <Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" color="primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                      </>
                    )}
                  </div>
                  {success && <div className="text-green-600 text-center mt-2">{success}</div>}
                  {error && <div className="text-red-600 text-center mt-2">{error}</div>}
                </div>
              </Card>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
