import React, { useState, useEffect, useRef } from "react";
import Profile from "../components/common/Profile";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import TabButton from "../components/common/TabButton";
import { FaUser, FaBriefcase, FaUniversity, FaLock, FaHistory, FaCog, FaUpload, FaFileAlt, FaCheckCircle, FaShieldAlt, FaEllipsisV, FaKey, FaDownload, FaListAlt, FaLinkedin, FaPlus, FaTimes, FaCreditCard, FaPaypal, FaStar, FaStar as FaStarOutline, FaBell, FaEye, FaEyeSlash, FaMobile, FaEnvelope, FaTrash, FaSignOutAlt, FaToggleOn, FaToggleOff, FaFilter, FaSearch, FaCalendar, FaSignInAlt, FaEdit } from 'react-icons/fa';
import { getProfile, updateProfile } from '../services/userService';
import ProfileBankSection from "../components/ProfileBankSection";
import ProfileDocumentsSection from "../components/ProfileDocumentsSection";
import { getFiles, uploadFile, deleteFile } from '../services/fileService';
import countryList from 'react-select-country-list';
import { useState as useReactSelectState } from 'react';

const tabList = [
  { label: 'Personal & Address', icon: <FaUser />, tooltip: 'Personal details and address' },
  { label: 'Professional Information', icon: <FaBriefcase />, tooltip: 'Job, department, skills' },
  { label: 'Bank Account & Payment', icon: <FaUniversity />, tooltip: 'Bank and payment methods' },
  { label: 'Documents', icon: <FaFileAlt />, tooltip: 'Your uploaded documents' },
  { label: 'Settings', icon: <FaCog />, tooltip: 'Preferences and privacy' },
  { label: 'Activity Log', icon: <FaHistory />, tooltip: 'Comprehensive activity history' },
];

// Helper for country/state data
const countries = countryList().getData();
const statesByCountry = {
  US: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  IN: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
  // ... add more as needed
};

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [addressCopied, setAddressCopied] = useState(false);
  const countryCode = countries.find(c => c.label === formData.address.country)?.value || '';
  const states = countryCode && statesByCountry[countryCode] ? statesByCountry[countryCode] : [];
  const [skills, setSkills] = useState(formData.skills ? formData.skills.split(',').map(s => s.trim()) : []);
  const [newSkill, setNewSkill] = useState('');
  const [primaryBankIndex, setPrimaryBankIndex] = useState(0);
  const [primaryPaymentIndex, setPrimaryPaymentIndex] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [showActivityFilters, setShowActivityFilters] = useState(false);

  const activityLog = [
    {
      id: 1,
      type: 'login',
      action: 'Successful login',
      description: 'Logged in from Chrome on Windows',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      ip: '192.168.1.1',
      location: 'New York, US',
      icon: FaSignInAlt,
      color: 'green'
    },
    {
      id: 2,
      type: 'profile',
      action: 'Profile updated',
      description: 'Updated personal information',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: FaEdit,
      color: 'blue'
    },
    {
      id: 3,
      type: 'security',
      action: 'Password changed',
      description: 'Password was successfully updated',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: FaKey,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'login',
      action: 'Failed login attempt',
      description: 'Failed login from unknown device',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      ip: '203.0.113.1',
      location: 'Unknown',
      icon: FaSignInAlt,
      color: 'red'
    },
    {
      id: 5,
      type: 'settings',
      action: '2FA enabled',
      description: 'Two-factor authentication was enabled',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      icon: FaShieldAlt,
      color: 'purple'
    }
  ];

  const filteredActivities = activityLog.filter(activity => {
    const matchesFilter = activityFilter === 'all' || activity.type === activityFilter;
    const matchesSearch = activity.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
                         activity.description.toLowerCase().includes(activitySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActivityColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return colors[color] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return timestamp.toLocaleDateString();
  };

  const handleExportActivity = () => {
    const csvContent = [
      ['Date', 'Action', 'Description', 'Type', 'IP', 'Location'],
      ...filteredActivities.map(activity => [
        activity.timestamp.toLocaleString(),
        activity.action,
        activity.description,
        activity.type,
        activity.ip || '',
        activity.location || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Section completeness checks
  const isPersonalComplete = !!formData.name && !!formData.email;
  const isProfessionalComplete = !!formData.jobTitle && !!formData.department;
  const isBankComplete = bankAccounts.length > 0 && bankAccounts.every(b => b.bankHolder && b.account && b.ifsc);
  const isDocumentsComplete = documents.length > 0;
  const isSettingsComplete = true; // Always accessible
  const tabBadges = [
    isPersonalComplete,
    isProfessionalComplete,
    isBankComplete,
    isDocumentsComplete,
    isSettingsComplete
  ];

  const handleCopyAddress = () => {
    const addr = formData.address;
    const text = `${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.postalCode}`;
    navigator.clipboard.writeText(text);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setFormData(prev => ({ ...prev, skills: updatedSkills.join(', ') }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setFormData(prev => ({ ...prev, skills: updatedSkills.join(', ') }));
  };

  const handleDownloadResume = () => {
    if (formData.resume) {
      window.open(formData.resume, '_blank');
    }
  };

  const handleSetPrimaryBank = (index) => {
    setPrimaryBankIndex(index);
    // Update the bank accounts to mark primary
    setBankAccounts(prev => prev.map((bank, i) => ({ ...bank, isPrimary: i === index })));
  };

  const handleSetPrimaryPayment = (index) => {
    setPrimaryPaymentIndex(index);
    // Update the payment methods to mark primary
    setPaymentMethods(prev => prev.map((payment, i) => ({ ...payment, isPrimary: i === index })));
  };

  const getPaymentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
      case 'mastercard':
      case 'credit card':
        return <FaCreditCard className="text-blue-600" />;
      case 'paypal':
        return <FaPaypal className="text-blue-500" />;
      case 'upi':
        return <FaUniversity className="text-green-600" />;
      default:
        return <FaCreditCard className="text-gray-600" />;
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      // Call API to change password
      // await changePassword(passwordData);
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password');
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // Call API to toggle 2FA
  };

  const handleLogoutAllSessions = () => {
    // Call API to logout all sessions
    setSuccess('All sessions logged out successfully');
  };

  if (loading) return <div className="flex justify-center items-center min-h-[300px]">Loading...</div>;

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      <div className="w-full">
        {/* Header: Avatar, Name/Description, Edit Btn (matches AgencyProfile) */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6 relative">
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
              {/* Status Badges */}
              <div className="flex gap-2 mt-2">
                {user.emailVerified && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><FaCheckCircle className="text-green-500" /> Email Verified</span>
                )}
                {user.twofa && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"><FaShieldAlt className="text-blue-500" /> 2FA Enabled</span>
                )}
              </div>
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
          {/* Quick Actions Dropdown */}
          <div className="absolute top-0 right-0 md:static md:ml-4 z-10" ref={dropdownRef}>
            <button
              className="flex items-center justify-center p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring"
              onClick={() => setDropdownOpen(v => !v)}
              aria-label="Quick actions"
              type="button"
            >
              <FaEllipsisV className="text-xl text-blue-700" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-blue-100 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-blue-50 text-blue-700" onClick={() => { setDropdownOpen(false); setActiveTab(4); }}>
                  <FaKey className="text-blue-500" /> Change Password
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-blue-50 text-blue-700" onClick={() => { setDropdownOpen(false); /* implement download profile */ }}>
                  <FaDownload className="text-green-500" /> Download Profile
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 hover:bg-blue-50 text-blue-700" onClick={() => { setDropdownOpen(false); /* implement view activity log */ }}>
                  <FaListAlt className="text-purple-500" /> View Activity Log
                </button>
              </div>
            )}
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
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton
            active={activeTab === 0}
            onClick={() => setActiveTab(0)}
            icon={<FaUser />}
            label="Personal & Address"
            badge={isPersonalComplete ? '✓' : '!'}
            tooltip={isPersonalComplete ? 'Complete' : 'Incomplete'}
          />
          <TabButton
            active={activeTab === 1}
            onClick={() => setActiveTab(1)}
            icon={<FaBriefcase />}
            label="Professional"
            badge={isProfessionalComplete ? '✓' : '!'}
            tooltip={isProfessionalComplete ? 'Complete' : 'Incomplete'}
          />
          <TabButton
            active={activeTab === 2}
            onClick={() => setActiveTab(2)}
            icon={<FaUniversity />}
            label="Bank & Payment"
            badge={isBankComplete ? '✓' : '!'}
            tooltip={isBankComplete ? 'Complete' : 'Incomplete'}
          />
          <TabButton
            active={activeTab === 3}
            onClick={() => setActiveTab(3)}
            icon={<FaFileAlt />}
            label="Documents"
            badge={isDocumentsComplete ? '✓' : '!'}
            tooltip={isDocumentsComplete ? 'Complete' : 'Incomplete'}
          />
          <TabButton
            active={activeTab === 4}
            onClick={() => setActiveTab(4)}
            icon={<FaCog />}
            label="Settings"
            badge={isSettingsComplete ? '✓' : '!'}
            tooltip={isSettingsComplete ? 'Complete' : 'Incomplete'}
          />
          <TabButton
            active={activeTab === 5}
            onClick={() => setActiveTab(5)}
            icon={<FaHistory />}
            label="Activity Log"
            badge={filteredActivities.length}
            tooltip={`${filteredActivities.length} activities`}
          />
        </div>

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
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block font-semibold mb-1">Gender</label>
                          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded px-3 py-2">
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block font-semibold mb-1">Country</label>
                          <select name="address.country" value={formData.address.country} onChange={handleChange} className="w-full border rounded px-3 py-2">
                            <option value="">Select</option>
                            {countries.map(c => <option key={c.value} value={c.label}>{c.label}</option>)}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block font-semibold mb-1">State</label>
                          <select name="address.state" value={formData.address.state} onChange={handleChange} className="w-full border rounded px-3 py-2">
                            <option value="">Select</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <Input label="Street" name="address.street" value={formData.address.street} onChange={handleChange} />
                      <Input label="City" name="address.city" value={formData.address.city} onChange={handleChange} />
                      <Input label="Postal Code" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} />
                      <button type="button" className="self-end px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-semibold" onClick={handleCopyAddress}>{addressCopied ? 'Copied!' : 'Copy Address'}</button>
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
                      <button type="button" className="self-end px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-semibold" onClick={handleCopyAddress}>{addressCopied ? 'Copied!' : 'Copy Address'}</button>
                    </>
                  )}
                  {validationError && <div className="text-red-600 text-center mt-2">{validationError}</div>}
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
                      <div>
                        <label className="block font-semibold mb-2">Skills</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {skills.map((skill, index) => (
                            <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {skill}
                              <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-blue-500 hover:text-blue-700">
                                <FaTimes className="text-xs" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill"
                            className="flex-1 border rounded px-3 py-2"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          />
                          <button type="button" onClick={handleAddSkill} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                      <Input label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                      <Input label="Resume Link" name="resume" value={formData.resume} onChange={handleChange} />
                    </>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Job Title:</span> {formData.jobTitle}</div>
                      <div className="mb-2"><span className="font-semibold">Department:</span> {formData.department}</div>
                      <div className="mb-2"><span className="font-semibold">Employee ID:</span> {formData.employeeId}</div>
                      <div className="mb-2"><span className="font-semibold">Joining Date:</span> {formData.joiningDate}</div>
                      <div className="mb-2">
                        <span className="font-semibold">Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">LinkedIn:</span>
                        {formData.linkedin && (
                          <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                            <FaLinkedin /> View Profile
                          </a>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Resume:</span>
                        {formData.resume && (
                          <button onClick={handleDownloadResume} className="ml-2 inline-flex items-center gap-1 text-green-600 hover:text-green-800">
                            <FaDownload /> Download Resume
                          </button>
                        )}
                      </div>
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
            <div>
              <Card title="Bank Accounts" className="p-6 mb-6">
                {editMode ? (
                  <div className="space-y-4">
                    {bankAccounts.map((bank, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">Bank Account {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryBank(index)}
                              className={`p-1 rounded ${primaryBankIndex === index ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                            >
                              {primaryBankIndex === index ? <FaStar /> : <FaStarOutline />}
                            </button>
                            {bankAccounts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBank(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Account Holder"
                            value={bank.bankHolder}
                            onChange={(e) => handleBankChange(index, 'bankHolder', e.target.value)}
                            required
                          />
                          <Input
                            label="Bank Name"
                            value={bank.bankName}
                            onChange={(e) => handleBankChange(index, 'bankName', e.target.value)}
                            required
                          />
                          <Input
                            label="Account Number"
                            value={bank.account}
                            onChange={(e) => handleBankChange(index, 'account', e.target.value)}
                            required
                          />
                          <Input
                            label="IFSC Code"
                            value={bank.ifsc}
                            onChange={(e) => handleBankChange(index, 'ifsc', e.target.value.toUpperCase())}
                            required
                          />
                          <Input
                            label="UPI ID"
                            value={bank.upi}
                            onChange={(e) => handleBankChange(index, 'upi', e.target.value)}
                          />
                          <Input
                            label="PAN Number"
                            value={bank.pan}
                            onChange={(e) => handleBankChange(index, 'pan', e.target.value.toUpperCase())}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddBank}
                      className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 transition"
                    >
                      + Add Bank Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bankAccounts.map((bank, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">Bank Account {index + 1}</h4>
                          {primaryBankIndex === index && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><span className="font-semibold">Account Holder:</span> {bank.bankHolder}</div>
                          <div><span className="font-semibold">Bank Name:</span> {bank.bankName}</div>
                          <div><span className="font-semibold">Account Number:</span> {bank.account}</div>
                          <div><span className="font-semibold">IFSC Code:</span> {bank.ifsc}</div>
                          {bank.upi && <div><span className="font-semibold">UPI ID:</span> {bank.upi}</div>}
                          {bank.pan && <div><span className="font-semibold">PAN Number:</span> {bank.pan}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Payment Methods" className="p-6 mb-6">
                {editMode ? (
                  <div className="space-y-4">
                    {paymentMethods.map((payment, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getPaymentIcon(payment.type)}
                            <h4 className="font-semibold">Payment Method {index + 1}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryPayment(index)}
                              className={`p-1 rounded ${primaryPaymentIndex === index ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                            >
                              {primaryPaymentIndex === index ? <FaStar /> : <FaStarOutline />}
                            </button>
                            {paymentMethods.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePayment(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Payment Type"
                            value={payment.type}
                            onChange={(e) => handlePaymentChange(index, 'type', e.target.value)}
                            required
                          />
                          <Input
                            label="Details"
                            value={payment.details}
                            onChange={(e) => handlePaymentChange(index, 'details', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddPayment}
                      className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 transition"
                    >
                      + Add Payment Method
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((payment, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getPaymentIcon(payment.type)}
                            <h4 className="font-semibold">{payment.type}</h4>
                          </div>
                          {primaryPaymentIndex === index && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              Primary
                            </span>
                          )}
                        </div>
                        <div><span className="font-semibold">Details:</span> {payment.details}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
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
            <div className="space-y-6">
              {/* Security Section */}
              <Card title="Security Settings" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaShieldAlt className="text-blue-600" />
                      <div>
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      className={`p-2 rounded-full transition ${twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {twoFactorEnabled ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Change Password</h4>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="relative">
                        <Input
                          label="Current Password"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          label="New Password"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          label="Confirm New Password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <Button type="submit" color="primary">Change Password</Button>
                    </form>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Active Sessions</h4>
                        <p className="text-sm text-gray-600">Manage your active login sessions</p>
                      </div>
                      <Button
                        type="button"
                        color="danger"
                        onClick={handleLogoutAllSessions}
                        className="flex items-center gap-2"
                      >
                        <FaSignOutAlt /> Logout All Sessions
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notifications Section */}
              <Card title="Notification Preferences" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-blue-600" />
                      <div>
                        <h4 className="font-semibold">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`p-2 rounded-full transition ${emailNotifications ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {emailNotifications ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaMobile className="text-green-600" />
                      <div>
                        <h4 className="font-semibold">SMS Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSmsNotifications(!smsNotifications)}
                      className={`p-2 rounded-full transition ${smsNotifications ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {smsNotifications ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>
                </div>
              </Card>

              {/* Privacy Section */}
              <Card title="Privacy Settings" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Data Sharing</h4>
                      <p className="text-sm text-gray-600">Allow us to use your data for service improvements</p>
                    </div>
                    <button
                      onClick={() => setDataSharing(!dataSharing)}
                      className={`p-2 rounded-full transition ${dataSharing ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {dataSharing ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>
                </div>
              </Card>

              {/* Activity Log Section */}
              <Card title="Activity Log" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FaHistory className="text-gray-600" />
                    <h4 className="font-semibold">Recent Profile Changes</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Password changed</p>
                        <p className="text-sm text-gray-600">2 days ago</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Security</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Profile information updated</p>
                        <p className="text-sm text-gray-600">1 week ago</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Profile</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">New device login</p>
                        <p className="text-sm text-gray-600">2 weeks ago</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Login</span>
                    </div>
                  </div>
                </div>
              </Card>

              {success && <div className="text-green-600 text-center mt-2 p-2 bg-green-50 rounded">{success}</div>}
              {error && <div className="text-red-600 text-center mt-2 p-2 bg-red-50 rounded">{error}</div>}
            </div>
          )}
          {/* Activity Log Tab */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <Card title="Activity Log" className="p-6">
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search activities..."
                        value={activitySearch}
                        onChange={(e) => setActivitySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowActivityFilters(!showActivityFilters)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <FaFilter /> Filter
                      </button>
                      <button
                        onClick={handleExportActivity}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <FaDownload /> Export
                      </button>
                    </div>
                  </div>

                  {/* Filter Options */}
                  {showActivityFilters && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        {['all', 'login', 'profile', 'security', 'settings'].map(filter => (
                          <button
                            key={filter}
                            onClick={() => setActivityFilter(filter)}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                              activityFilter === filter
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity List */}
                  <div className="space-y-3">
                    {filteredActivities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FaHistory className="mx-auto text-4xl mb-2" />
                        <p>No activities found.</p>
                      </div>
                    ) : (
                      filteredActivities.map(activity => {
                        const IconComponent = activity.icon;
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className={`p-2 rounded-full ${getActivityColor(activity.color)}`}>
                              <IconComponent className="text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">{activity.action}</h4>
                                <span className="text-sm text-gray-500">
                                  {formatTimestamp(activity.timestamp)}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                              {(activity.ip || activity.location) && (
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {activity.ip && (
                                    <span className="flex items-center gap-1">
                                      <FaCog /> {activity.ip}
                                    </span>
                                  )}
                                  {activity.location && (
                                    <span className="flex items-center gap-1">
                                      <FaUser /> {activity.location}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
