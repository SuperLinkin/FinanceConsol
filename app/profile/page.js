'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Building2,
  Shield,
  Bell,
  Globe,
  Save,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    systemNotifications: true,
    weeklyReports: false,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);

        // Fetch full user details from API
        const response = await fetch(`/api/users/${userData.userId}`);
        if (response.ok) {
          const data = await response.json();
          const user = data.user;

          setProfileForm({
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            jobTitle: user.job_title || '',
            department: user.department || ''
          });

          // Load preferences from localStorage or API
          const savedPreferences = localStorage.getItem(`preferences_${userData.userId}`);
          if (savedPreferences) {
            setPreferences(JSON.parse(savedPreferences));
          }
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`/api/users/${currentUser.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          jobTitle: profileForm.jobTitle,
          department: profileForm.department
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });

        // Update localStorage
        const updatedUser = {
          ...currentUser,
          name: `${profileForm.firstName} ${profileForm.lastName}`
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setSaving(false);
      return;
    }

    // Validate password strength
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${currentUser.userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'An error occurred while changing your password' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Save to localStorage
      localStorage.setItem(`preferences_${currentUser.userId}`, JSON.stringify(preferences));

      // Could also save to database via API
      // const response = await fetch(`/api/users/${currentUser.userId}/preferences`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences)
      // });

      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating your preferences' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your account settings and preferences"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Message Banner */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User size={20} />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Lock size={20} />
                Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell size={20} />
                Preferences
              </button>
            </div>

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {profileForm.firstName?.[0]}{profileForm.lastName?.[0]}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Camera size={18} />
                        Change Photo
                      </button>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Contact admin to change email</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={profileForm.jobTitle}
                          onChange={(e) => setProfileForm({...profileForm, jobTitle: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={profileForm.department}
                          onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Info (Read-only) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <div className="flex items-center gap-2">
                          <Shield size={18} className="text-gray-500" />
                          <span className="text-gray-900 font-medium capitalize">
                            {currentUser.role?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <div className="flex items-center gap-2">
                          <Building2 size={18} className="text-gray-500" />
                          <span className="text-gray-900 font-medium">
                            {currentUser.companyName || 'Your Company'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Ensure your account is using a strong password to stay secure.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Lock size={18} />
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="p-6">
                <form onSubmit={handlePreferencesUpdate} className="space-y-6 max-w-2xl">
                  {/* Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Email Notifications</div>
                          <div className="text-sm text-gray-500">Receive email updates about your activity</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">System Notifications</div>
                          <div className="text-sm text-gray-500">Receive in-app notifications</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.systemNotifications}
                          onChange={(e) => setPreferences({...preferences, systemNotifications: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Weekly Reports</div>
                          <div className="text-sm text-gray-500">Receive weekly activity summaries</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.weeklyReports}
                          onChange={(e) => setPreferences({...preferences, weeklyReports: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select
                          value={preferences.dateFormat}
                          onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                          value={preferences.theme}
                          onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#101828]"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
