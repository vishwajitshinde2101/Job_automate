import React, { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Trash2,
  Star,
  Search,
  RefreshCw,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Paperclip,
  User,
  Clock,
  Tag,
  Filter,
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  read: boolean;
  starred: boolean;
  labels: string[];
}

interface EmailDetails {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  attachments?: string[];
}

const EmailManagement: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: '',
  });

  // Check if user has connected Gmail
  useEffect(() => {
    checkGmailConnection();
  }, []);

  const checkGmailConnection = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/gmail/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.connected) {
        setIsConnected(true);
        fetchEmails();
      }
    } catch (err) {
      console.error('Error checking Gmail connection:', err);
    }
  };

  const connectGmail = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/gmail/auth-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.url) {
        // Open Google OAuth popup
        window.open(data.url, '_blank', 'width=600,height=700');

        // Listen for OAuth callback
        window.addEventListener('message', (event) => {
          if (event.data.type === 'gmail-auth-success') {
            setIsConnected(true);
            setSuccess('Gmail connected successfully!');
            fetchEmails();
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Gmail');
    }
  };

  const fetchEmails = async () => {
    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/gmail/emails?filter=${filter}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setEmails(data.emails || []);
      } else {
        throw new Error(data.error || 'Failed to fetch emails');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch emails');
    } finally {
      setIsLoading(false);
    }
  };

  const viewEmail = async (emailId: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/gmail/email/${emailId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSelectedEmail(data.email);
        // Mark as read
        setEmails(emails.map(e => e.id === emailId ? { ...e, read: true } : e));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load email');
    }
  };

  const sendEmail = async () => {
    if (!composeForm.to || !composeForm.subject) {
      setError('Please fill recipient and subject');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/gmail/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(composeForm),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Email sent successfully!');
        setShowCompose(false);
        setComposeForm({ to: '', subject: '', body: '' });
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmails = emails.filter((email) => {
    if (filter === 'unread' && email.read) return false;
    if (filter === 'starred' && !email.starred) return false;
    if (searchQuery && !email.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !email.from.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-neon-blue" />
            Email Management
          </h2>
          <p className="text-gray-400 mt-1">
            Manage your Gmail emails directly from the dashboard
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-semibold rounded-lg hover:bg-neon-blue/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Compose
            </button>
            <button
              onClick={fetchEmails}
              disabled={isLoading}
              className="p-2 bg-dark-800 border border-white/10 rounded-lg hover:bg-dark-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-400 text-sm">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gmail Not Connected */}
      {!isConnected ? (
        <div className="bg-dark-800 border border-white/10 rounded-xl p-12">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-neon-blue/10 flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-neon-blue" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Connect Your Gmail</h3>
            <p className="text-gray-400 mb-6">
              Connect your Gmail account to read, send, and manage emails directly from your
              dashboard. Your credentials are secure and encrypted.
            </p>
            <button
              onClick={connectGmail}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-blue-600 text-white font-semibold rounded-lg hover:from-neon-blue/90 hover:to-blue-600/90 transition-all shadow-lg shadow-neon-blue/20"
            >
              <Mail className="w-5 h-5" />
              Connect Gmail Account
            </button>
            <p className="text-xs text-gray-500 mt-4">
              We only request read and send permissions. We never store your password.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-1 bg-dark-800 border border-white/10 rounded-xl p-4 space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search emails..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white text-sm focus:border-neon-blue focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-neon-blue text-black'
                      : 'bg-dark-900 text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    filter === 'unread'
                      ? 'bg-neon-blue text-black'
                      : 'bg-dark-900 text-gray-400 hover:text-white'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('starred')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    filter === 'starred'
                      ? 'bg-neon-blue text-black'
                      : 'bg-dark-900 text-gray-400 hover:text-white'
                  }`}
                >
                  Starred
                </button>
              </div>
            </div>

            {/* Email Items */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-neon-blue animate-spin" />
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  No emails found
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => viewEmail(email.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedEmail?.id === email.id
                        ? 'bg-neon-blue/10 border border-neon-blue/20'
                        : 'bg-dark-900 border border-white/5 hover:border-white/10'
                    } ${!email.read ? 'border-l-2 border-l-neon-blue' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-sm truncate flex-1 ${
                        !email.read ? 'font-semibold text-white' : 'text-gray-400'
                      }`}>
                        {email.from}
                      </span>
                      {email.starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                    </div>
                    <p className={`text-sm truncate mb-1 ${
                      !email.read ? 'font-semibold text-white' : 'text-gray-300'
                    }`}>
                      {email.subject || '(No subject)'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{email.snippet}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">{email.date}</span>
                      {email.labels.length > 0 && (
                        <div className="flex gap-1">
                          {email.labels.slice(0, 2).map((label, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-neon-purple/10 text-neon-purple text-xs rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Email Viewer / Compose */}
          <div className="lg:col-span-2 bg-dark-800 border border-white/10 rounded-xl p-6">
            {showCompose ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Compose Email</h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
                  <input
                    type="email"
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    placeholder="Email subject"
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    value={composeForm.body}
                    onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                    placeholder="Write your message..."
                    rows={12}
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={sendEmail}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-neon-blue text-black font-semibold rounded-lg hover:bg-neon-blue/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-6 py-2 bg-dark-900 text-gray-400 rounded-lg hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedEmail ? (
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-xl font-semibold text-white mb-3">{selectedEmail.subject}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{selectedEmail.from}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedEmail.date}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    To: {selectedEmail.to}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-gray-300 text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>

                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments ({selectedEmail.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-dark-900 rounded-lg text-sm text-gray-400"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Mail className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Email Selected</h3>
                <p className="text-gray-500">
                  Select an email from the list to view its content
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagement;
