import React, { useState } from 'react';
import { FaUsersCog, FaPlus, FaTrash, FaEdit, FaShieldAlt } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';

const initialRoles = [
  { id: 1, name: 'Administrator', users: 2, description: 'Full access to all system features.' },
  { id: 2, name: 'Dispatcher', users: 5, description: 'Manages bookings, drivers, and vehicles.' },
  { id: 3, name: 'Driver Manager', users: 3, description: 'Manages driver profiles and performance.' },
  { id: 4, name: 'Accountant', users: 1, description: 'Access to financial reports and billing.' },
];

const allPermissions = [
    { id: 'dashboard', label: 'View Dashboard' },
    { id: 'bookings_manage', label: 'Manage Bookings' },
    { id: 'users_manage', label: 'Manage Users' },
    { id: 'drivers_manage', label: 'Manage Drivers' },
    { id: 'vehicles_manage', label: 'Manage Vehicles' },
    { id: 'reports_view', label: 'View Reports' },
    { id: 'settings_manage', label: 'Manage Settings' },
];

function RoleManagement() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    // Mock permissions for selected role
    if (role.name === 'Administrator') setRolePermissions(allPermissions.map(p => p.id));
    else if (role.name === 'Dispatcher') setRolePermissions(['dashboard', 'bookings_manage', 'drivers_manage', 'vehicles_manage']);
    else setRolePermissions(['dashboard', 'reports_view']);
  };

  const handlePermissionChange = (permId) => {
    setRolePermissions(prev => 
        prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };
  
  const columns = [
    { key: 'role', label: 'Role Name', render: (r) => <div className="font-bold">{r.name}</div> },
    { key: 'users', label: 'Users Assigned', render: (r) => <div className="text-center">{r.users}</div> },
    { key: 'description', label: 'Description', render: (r) => <div className="text-sm text-gray-600">{r.description}</div> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleSelectRole(r)}><FaEdit/> Edit</Button>
        <Button size="sm" variant="danger-outline"><FaTrash/> Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaUsersCog className="text-blue-700" />
            Role & Permission Management
          </h1>
          <p className="text-gray-600 mt-2">Define user roles and control access to features.</p>
        </div>
        <Button>
          <FaPlus className="mr-2" /> Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Existing Roles</h3>
                <Table data={roles} columns={columns} />
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-gray-500"/>
                {selectedRole ? `Permissions for ${selectedRole.name}`: 'Select a Role to Edit'}
              </h3>
              {selectedRole ? (
                <div className="space-y-3">
                  {allPermissions.map(perm => (
                    <label key={perm.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rolePermissions.includes(perm.id)}
                        onChange={() => handlePermissionChange(perm.id)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">{perm.label}</span>
                    </label>
                  ))}
                  <Button className="w-full mt-4"><FaSave className="mr-2"/> Save Permissions</Button>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>Select a role from the left to view and edit its permissions.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RoleManagement; 