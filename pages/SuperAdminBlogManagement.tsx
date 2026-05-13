import React, { useState } from 'react';
import {
  BookOpen, Plus, Search, Edit2, Trash2, Eye, Tag,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  X, Save, FileText, User, ThumbsUp, ThumbsDown,
  MessageSquare, Share2,
} from 'lucide-react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

/* ─── Types ─────────────────────────────────────────────── */
type BlogStatus = 'published' | 'draft';
type RequestStatus = 'pending' | 'approved' | 'rejected';

interface Blog {
  id: number;
  title: string;
  category: string;
  tag: string;
  author: string;
  date: string;
  readTime: string;
  status: BlogStatus;
  views: number;
  comments: number;
  shares: number;
  excerpt: string;
}

interface PendingRequest {
  id: number;
  title: string;
  category: string;
  tag: string;
  tagColor: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorEmail: string;
  submittedAt: string;
  readTime: string;
  status: RequestStatus;
}

/* ─── Mock Data ─────────────────────────────────────────── */
const initialBlogs: Blog[] = [
  {
    id: 1, title: 'How to Apply to 50 Jobs on Naukri in Under 5 Minutes',
    category: 'automation', tag: 'Automation', author: 'AutoJobzy Team',
    date: 'Feb 18, 2026', readTime: '5 min', status: 'published',
    views: 1240, comments: 34, shares: 58,
    excerpt: 'Stop spending 3+ hours daily on repetitive job applications...',
  },
  {
    id: 2, title: '7 Resume Mistakes That Are Costing You Interviews in 2026',
    category: 'resume', tag: 'Resume & CV', author: 'Career Expert',
    date: 'Feb 15, 2026', readTime: '7 min', status: 'published',
    views: 980, comments: 21, shares: 40,
    excerpt: 'ATS systems reject 75% of resumes before a human ever sees them...',
  },
  {
    id: 3, title: 'Top 5 AI Tools Every Job Seeker Should Use in 2026',
    category: 'ai-tools', tag: 'AI Tools', author: 'AutoJobzy Team',
    date: 'Feb 10, 2026', readTime: '6 min', status: 'published',
    views: 760, comments: 15, shares: 29,
    excerpt: 'From AI-powered resume builders to interview simulators...',
  },
  {
    id: 4, title: 'LinkedIn Optimization: The Complete 2026 Guide',
    category: 'job-hunting', tag: 'Job Hunting', author: 'AutoJobzy Team',
    date: 'Feb 5, 2026', readTime: '8 min', status: 'draft',
    views: 0, comments: 0, shares: 0,
    excerpt: 'Your LinkedIn profile is your digital resume and networking hub...',
  },
];

const initialRequests: PendingRequest[] = [
  {
    id: 101,
    title: 'How I Got 5 Interview Calls in One Week Using AutoJobzy',
    category: 'job-hunting',
    tag: 'Job Hunting',
    tagColor: 'sky',
    excerpt: 'I was manually applying for weeks with no response. Then I switched to automated applications and everything changed...',
    content: 'Full article content goes here. The user wrote a detailed post about their experience using AutoJobzy to automate job applications on Naukri, resulting in 5 interview calls within a week. They describe the setup process, configuration, and results they achieved.',
    authorName: 'Rahul Sharma',
    authorEmail: 'rahul.sharma@email.com',
    submittedAt: 'Feb 20, 2026',
    readTime: '4 min',
    status: 'pending',
  },
  {
    id: 102,
    title: 'My Tips for Writing a Resume That Actually Gets Read',
    category: 'resume',
    tag: 'Resume & CV',
    tagColor: 'purple',
    excerpt: 'After submitting 100+ applications I learned what works. Here are my hard-earned tips for crafting a resume that passes ATS...',
    content: 'Full article content goes here. The user shares their experience with resume writing and what they learned after 100+ applications. They cover ATS optimization, keyword usage, formatting tips, and more.',
    authorName: 'Priya Nair',
    authorEmail: 'priya.nair@email.com',
    submittedAt: 'Feb 18, 2026',
    readTime: '6 min',
    status: 'pending',
  },
  {
    id: 103,
    title: 'Career Switch from Banking to IT: My 6-Month Journey',
    category: 'career-tips',
    tag: 'Career Tips',
    tagColor: 'orange',
    excerpt: 'I made the jump from banking to software development at 28. Here is the honest truth about what it takes and how AutoJobzy helped...',
    content: 'Full article content goes here. A detailed account of transitioning careers from banking to IT, including skills learned, certifications, interview process, and how job automation helped during the job search.',
    authorName: 'Amit Patil',
    authorEmail: 'amit.patil@email.com',
    submittedAt: 'Feb 15, 2026',
    readTime: '8 min',
    status: 'pending',
  },
];

/* ─── Helpers ───────────────────────────────────────────── */
const tagColorMap: Record<string, string> = {
  Automation: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
  'Resume & CV': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'AI Tools': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Career Tips': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Job Hunting': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

const reqTagColors: Record<string, string> = {
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  blue: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const categories = ['All', 'automation', 'resume', 'ai-tools', 'job-hunting', 'career-tips'];

/* ─── Blog Modal ─────────────────────────────────────────── */
interface ModalProps {
  blog?: Partial<Blog>;
  onClose: () => void;
  onSave: (b: Partial<Blog>) => void;
}

const BlogModal: React.FC<ModalProps> = ({ blog, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Blog>>({
    title: '', category: 'automation', tag: 'Automation',
    author: 'AutoJobzy Team', readTime: '5 min', status: 'draft', excerpt: '',
    ...blog,
  });
  const set = (k: keyof Blog, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{blog?.id ? 'Edit Blog Post' : 'New Blog Post'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Enter blog title..."
              className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
            <textarea rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Short description..."
              className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all">
                <option value="automation">Automation</option>
                <option value="resume">Resume & CV</option>
                <option value="ai-tools">AI Tools</option>
                <option value="job-hunting">Job Hunting</option>
                <option value="career-tips">Career Tips</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tag Label</label>
              <select value={form.tag} onChange={e => set('tag', e.target.value)}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all">
                <option>Automation</option><option>Resume & CV</option>
                <option>AI Tools</option><option>Job Hunting</option><option>Career Tips</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name"
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Read Time</label>
              <input value={form.readTime} onChange={e => set('readTime', e.target.value)} placeholder="e.g. 5 min"
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <div className="flex gap-3">
              {(['draft', 'published'] as BlogStatus[]).map(s => (
                <button key={s} onClick={() => set('status', s)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.status === s
                      ? s === 'published' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}>
                  {s === 'published' ? <CheckCircle className="inline w-4 h-4 mr-1.5" /> : <FileText className="inline w-4 h-4 mr-1.5" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-colors">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Save className="w-4 h-4" />
            {blog?.id ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Review Modal ───────────────────────────────────────── */
interface ReviewModalProps {
  request: PendingRequest;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ request, onClose, onApprove, onReject }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Review Submission</h2>
            <p className="text-xs text-gray-500">Submitted by {request.authorName}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Author Info */}
      <div className="mx-6 mt-5 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-neon-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{request.authorName}</p>
          <p className="text-xs text-gray-500">{request.authorEmail}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${reqTagColors[request.tagColor] || reqTagColors.blue}`}>
            <Tag className="w-3 h-3" />
            {request.tag}
          </span>
          <p className="text-xs text-gray-600 mt-1 flex items-center justify-end gap-1">
            <Calendar className="w-3 h-3" />{request.submittedAt}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{request.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-neon-blue/30 pl-4">{request.excerpt}</p>
        </div>
        <div className="bg-dark-900/60 border border-white/5 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">Article Content Preview</p>
          <p className="text-sm text-gray-300 leading-relaxed">{request.content}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{request.readTime} read</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Submitted {request.submittedAt}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-6 border-t border-white/10">
        <button
          onClick={() => { onReject(request.id); onClose(); }}
          className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 font-bold flex items-center justify-center gap-2 transition-all"
        >
          <ThumbsDown className="w-4 h-4" />
          Reject
        </button>
        <button
          onClick={() => { onApprove(request.id); onClose(); }}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <ThumbsUp className="w-4 h-4" />
          Approve & Publish
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────── */
type TabType = 'manage' | 'pending';

const SuperAdminBlogManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | BlogStatus>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<Partial<Blog> | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [reviewRequest, setReviewRequest] = useState<PendingRequest | null>(null);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    drafts: blogs.filter(b => b.status === 'draft').length,
    totalViews: blogs.reduce((s, b) => s + b.views, 0),
    pending: pendingCount,
  };

  const filteredBlogs = blogs.filter(b => {
    const q = search.toLowerCase();
    return (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
      && (categoryFilter === 'All' || b.category === categoryFilter)
      && (statusFilter === 'All' || b.status === statusFilter);
  });

  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    return !q || r.title.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q);
  });

  const handleSave = (form: Partial<Blog>) => {
    if (form.id) {
      setBlogs(bs => bs.map(b => b.id === form.id ? { ...b, ...form } as Blog : b));
    } else {
      const newBlog: Blog = {
        id: Date.now(), views: 0, comments: 0, shares: 0,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        ...(form as any),
      };
      setBlogs(bs => [newBlog, ...bs]);
    }
  };

  const handleDelete = (id: number) => { setBlogs(bs => bs.filter(b => b.id !== id)); setDeleteId(null); };
  const toggleStatus = (id: number) => setBlogs(bs => bs.map(b => b.id === id ? { ...b, status: b.status === 'published' ? 'draft' : 'published' } : b));

  const handleApprove = (id: number) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    const newBlog: Blog = {
      id: Date.now(), title: req.title, category: req.category,
      tag: req.tag, author: req.authorName, readTime: req.readTime,
      status: 'published', views: 0, comments: 0, shares: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      excerpt: req.excerpt,
    };
    setBlogs(bs => [newBlog, ...bs]);
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleReject = (id: number) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  return (
    <SuperAdminSidebar>
      <div className="min-h-screen bg-dark-900 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Blog Management</h1>
            <p className="text-gray-400 mt-1">Manage blog posts and review user submissions</p>
          </div>
          <button
            onClick={() => { setEditBlog(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            <Plus className="w-5 h-5" />
            New Blog Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Posts', value: stats.total, icon: BookOpen, cls: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
            { label: 'Published', value: stats.published, icon: CheckCircle, cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
            { label: 'Drafts', value: stats.drafts, icon: FileText, cls: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
            { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, cls: 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue' },
            { label: 'Pending Review', value: stats.pending, icon: AlertCircle, cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.cls} border rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium opacity-70">{s.label}</span>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Pending Approval
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'manage'
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Manage All Posts
          </button>
        </div>

        {/* Search */}
        <div className="bg-dark-800 border border-white/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts or authors..."
              className="w-full pl-9 pr-4 py-2.5 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/40 transition-all" />
          </div>
          {activeTab === 'manage' && (
            <>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-dark-900 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-purple-500/40 transition-all">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 bg-dark-900 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-purple-500/40 transition-all">
                <option value="All">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </>
          )}
        </div>

        {/* ── Pending Approval Tab ── */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-dark-800 border border-white/10 rounded-xl py-16 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">All caught up!</p>
                <p className="text-gray-500 text-sm">No pending blog submissions.</p>
              </div>
            ) : filteredRequests.map(req => {
              const isPending = req.status === 'pending';
              return (
                <div key={req.id} className={`bg-dark-800 border rounded-xl p-5 transition-all ${
                  isPending ? 'border-orange-500/20' : req.status === 'approved' ? 'border-emerald-500/20' : 'border-red-500/10 opacity-60'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Author */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:w-24 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-neon-blue" />
                      </div>
                      <div className="sm:text-center">
                        <p className="text-xs font-semibold text-white whitespace-nowrap">{req.authorName}</p>
                        <p className="text-[10px] text-gray-600 hidden sm:block">{req.submittedAt}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${reqTagColors[req.tagColor] || reqTagColors.blue}`}>
                          <Tag className="w-3 h-3" />{req.tag}
                        </span>
                        {!isPending && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${
                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {req.status === 'approved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {req.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mb-1 leading-snug">{req.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{req.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{req.submittedAt}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.readTime} read</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex sm:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setReviewRequest(req)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-xs font-medium text-emerald-400 transition-all"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-lg text-xs font-medium text-red-400 transition-all"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Manage All Posts Tab ── */}
        {activeTab === 'manage' && (
          <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Post</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Author</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Engagement</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500">No blog posts found</p>
                      </td>
                    </tr>
                  ) : filteredBlogs.map(blog => (
                    <tr key={blog.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white line-clamp-1">{blog.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{blog.excerpt}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{blog.date}</span>
                              <span className="text-xs text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${tagColorMap[blog.tag] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          <Tag className="w-3 h-3" />{blog.tag}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-300">{blog.author}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-neon-blue" />{blog.views.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-neon-purple" />{blog.comments}</span>
                          <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-emerald-400" />{blog.shares}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => toggleStatus(blog.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            blog.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20'
                          }`}>
                          {blog.status === 'published'
                            ? <><CheckCircle className="w-3 h-3" /> Published</>
                            : <><FileText className="w-3 h-3" /> Draft</>}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditBlog(blog); setModalOpen(true); }}
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(blog.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <BlogModal blog={editBlog} onClose={() => { setModalOpen(false); setEditBlog(undefined); }} onSave={handleSave} />
      )}

      {/* Review Modal */}
      {reviewRequest && (
        <ReviewModal
          request={reviewRequest}
          onClose={() => setReviewRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-gray-400 mb-6 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminSidebar>
  );
};

export default SuperAdminBlogManagement;
