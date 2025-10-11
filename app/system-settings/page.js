'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Shield,
  Settings,
  UserPlus,
  Edit2,
  Trash2,
  Mail,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Search,
  Filter,
  AlertCircle,
  Building2,
  Crown,
  X
} from 'lucide-react';
import RolesPermissionsTab from '@/components/RolesPermissionsTab';
import CreateRoleModal from '@/components/CreateRoleModal';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [companySettings, setCompanySettings] = useState(null);
  const [customRoles, setCustomRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Role definitions (kept for compatibility)
  const roles = [
    { value: 'primary_admin', label: 'Primary Admin', description: 'Full system access, cannot be modified by other admins' },
    { value: 'admin', label: 'Administrator', description: 'Can manage users and all system settings' },
    { value: 'manager', label: 'Manager', description: 'Can manage data and run reports' },
    { value: 'user', label: 'User', description: 'Can view and edit assigned data' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
  ];

  useEffect(() => {
    checkAuth();
    fetchUsers();
    fetchCompanySettings();
    fetchCustomRoles();
    fetchPermissions();
  }, []);

  const checkAuth = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);

      // Check if user has admin access
      if (userData.role !== 'primary_admin' && userData.role !== 'admin') {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch('/api/company/settings');
      if (response.ok) {
        const data = await response.json();
        setCompanySettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    }
  };

  const fetchCustomRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setCustomRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching custom roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          role: formData.get('role')
        })
      });

      if (response.ok) {
        setShowInviteModal(false);
        fetchUsers();
        alert('User invitation sent successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('An error occurred while sending the invitation');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          role: formData.get('role'),
          isActive: formData.get('isActive') === 'true'
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
        alert('User updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  };

  const canModifyUser = (user) => {
    if (!currentUser) return false;

    // Primary admin can't be modified by anyone
    if (user.role === 'primary_admin') {
      return currentUser.isPrimary && user.id === currentUser.userId;
    }

    // Only primary admin and admin can modify users
    return currentUser.role === 'primary_admin' || currentUser.role === 'admin';
  };

  const canDeleteUser = (user) => {
    if (!currentUser) return false;

    // Can't delete primary admin
    if (user.role === 'primary_admin') return false;

    // Can't delete yourself
    if (user.id === currentUser.userId) return false;

    // Only primary admin and admin can delete
    return currentUser.role === 'primary_admin' || currentUser.role === 'admin';
  };

  // Custom Role Handlers
  const handleCreateRole = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleName: formData.get('roleName'),
          description: formData.get('description'),
          permissions: selectedPermissions
        })
      });

      if (response.ok) {
        setShowCreateRoleModal(false);
        setSelectedPermissions([]);
        fetchCustomRoles();
        alert('Custom role created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('An error occurred while creating the role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role? Users with this role will need to be reassigned.')) {
      return;
    }

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCustomRoles();
        alert('Role deleted successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('An error occurred while deleting the role');
    }
  };

  const togglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  if (!currentUser) {
    return <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
      <p className="text-gray-600">Loading...</p>
    </div>;
  }

  return (
    <div className="p-8 bg-[#f7f5f2] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#101828] mb-2">System Settings</h1>
        <p className="text-gray-600">Manage users, permissions, and company settings</p>
      </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users size={20} />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'permissions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield size={20} />
                Roles & Permissions
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'company'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 size={20} />
                Company Settings
              </button>
            </div>

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="p-6">
                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 bg-[#101828] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
                  >
                    <UserPlus size={20} />
                    Invite User
                  </button>
                </div>

                {/* Users Table */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Login</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 flex items-center gap-2">
                                    {user.first_name} {user.last_name}
                                    {user.role === 'primary_admin' && (
                                      <Crown size={14} className="text-yellow-500" title="Primary Admin" />
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">@{user.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-gray-900">{user.email}</p>
                              {user.is_verified ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle size={12} /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                                  <AlertCircle size={12} /> Not Verified
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'primary_admin' ? 'bg-yellow-100 text-yellow-800' :
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'user' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {roles.find(r => r.value === user.role)?.label || user.role}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {user.is_active ? (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle size={16} /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600">
                                  <XCircle size={16} /> Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-2">
                                {canModifyUser(user) && (
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowEditModal(true);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit user"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                )}
                                {canModifyUser(user) && user.role !== 'primary_admin' && (
                                  <button
                                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      user.is_active
                                        ? 'text-yellow-600 hover:bg-yellow-50'
                                        : 'text-green-600 hover:bg-green-50'
                                    }`}
                                    title={user.is_active ? 'Deactivate user' : 'Activate user'}
                                  >
                                    {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                                  </button>
                                )}
                                {canDeleteUser(user) && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete user"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Roles & Permissions Tab */}
            {activeTab === 'permissions' && (
              <RolesPermissionsTab
                customRoles={customRoles}
                permissions={permissions}
                currentUser={currentUser}
                onCreateRole={() => setShowCreateRoleModal(true)}
                onDeleteRole={handleDeleteRole}
              />
            )}

            {/* Company Settings Tab */}
            {activeTab === 'company' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>

                {companySettings ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          defaultValue={companySettings.company_name}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={currentUser?.role !== 'primary_admin'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Slug</label>
                        <input
                          type="text"
                          defaultValue={companySettings.company_slug}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
                        <select
                          defaultValue={companySettings.subscription_tier}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={currentUser?.role !== 'primary_admin'}
                        >
                          <option value="basic">Basic</option>
                          <option value="professional">Professional</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`inline-block px-3 py-2 text-sm font-medium rounded-lg ${
                          companySettings.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {companySettings.subscription_status}
                        </span>
                      </div>
                    </div>

                    {currentUser?.role === 'primary_admin' && (
                      <div className="pt-4">
                        <button className="bg-[#101828] text-white px-6 py-2 rounded-lg hover:bg-[#1e293b] transition-colors">
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">Loading company settings...</p>
                )}
              </div>
            )}
          </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Invite New User</h3>
                <p className="text-sm text-slate-300 mt-1">Send an invitation to join your organization</p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                >
                  {roles.filter(r => r.value !== 'primary_admin').map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200 shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Edit User</h3>
                <p className="text-sm text-slate-300 mt-1">Update user information and permissions</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={selectedUser.first_name}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={selectedUser.last_name}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  defaultValue={selectedUser.role}
                  required
                  disabled={selectedUser.role === 'primary_admin'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828] disabled:bg-gray-100"
                >
                  {roles.filter(r => currentUser?.role === 'primary_admin' || r.value !== 'primary_admin').map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  name="isActive"
                  defaultValue={selectedUser.is_active.toString()}
                  disabled={selectedUser.role === 'primary_admin'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828] disabled:bg-gray-100"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200 shadow-md"
                >
                  Update User
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <CreateRoleModal
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onTogglePermission={togglePermission}
          onSubmit={handleCreateRole}
          onClose={() => {
            setShowCreateRoleModal(false);
            setSelectedPermissions([]);
          }}
        />
      )}
    </div>
  );
}
