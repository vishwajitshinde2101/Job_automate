import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ChangePassword: React.FC = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggle = (field: 'current' | 'new' | 'confirm') =>
    setShow(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from the current password');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({
    label,
    field,
    placeholder,
    value,
    showKey,
  }: {
    label: string;
    field: 'currentPassword' | 'newPassword' | 'confirmPassword';
    placeholder: string;
    value: string;
    showKey: 'current' | 'new' | 'confirm';
  }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type={show[showKey] ? 'text' : 'password'}
          required
          className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-300 dark:border-gray-700 rounded-lg py-3 pl-10 pr-10 text-gray-900 dark:text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
          placeholder={placeholder}
          value={value}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
        />
        <button
          type="button"
          onClick={() => toggle(showKey)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          tabIndex={-1}
        >
          {show[showKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Update your account password. Make sure it's at least 6 characters.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label="Current Password"
            field="currentPassword"
            placeholder="Enter your current password"
            value={form.currentPassword}
            showKey="current"
          />

          <div className="border-t border-gray-200 dark:border-white/10 pt-5">
            <PasswordField
              label="New Password"
              field="newPassword"
              placeholder="Min. 6 characters"
              value={form.newPassword}
              showKey="new"
            />
          </div>

          <PasswordField
            label="Confirm New Password"
            field="confirmPassword"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            showKey="confirm"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
