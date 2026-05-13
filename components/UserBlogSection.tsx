import React, { useState } from 'react';
import {
  BookOpen, Plus, Eye, MessageSquare, Share2, Tag, Calendar,
  Clock, CheckCircle, XCircle, AlertCircle, Trash2, ChevronRight,
  TrendingUp, FileText, Send, ArrowLeft, Lightbulb, Bold, Italic,
  List, Link as LinkIcon, Image, AlignLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Types ─────────────────────────────────────────────── */
type PostStatus = 'pending' | 'approved' | 'rejected';

interface UserPost {
  id: number;
  title: string;
  category: string;
  tag: string;
  tagColor: string;
  excerpt: string;
  date: string;
  readTime: string;
  status: PostStatus;
  views: number;
  comments: number;
  shares: number;
}

/* ─── Mock Data ─────────────────────────────────────────── */
const mockPosts: UserPost[] = [
  {
    id: 1,
    title: 'How I Got 5 Interview Calls in One Week Using AutoJobzy',
    category: 'job-hunting',
    tag: 'Job Hunting',
    tagColor: 'sky',
    excerpt: 'I was manually applying for weeks with no response. Then I switched to automated applications and everything changed...',
    date: 'Feb 20, 2026',
    readTime: '4 min',
    status: 'approved',
    views: 342,
    comments: 18,
    shares: 27,
  },
  {
    id: 2,
    title: 'My Tips for Writing a Resume That Actually Gets Read',
    category: 'resume',
    tag: 'Resume & CV',
    tagColor: 'purple',
    excerpt: 'After submitting 100+ applications I learned what works. Here are my hard-earned tips for crafting a resume that passes ATS...',
    date: 'Feb 14, 2026',
    readTime: '6 min',
    status: 'pending',
    views: 0,
    comments: 0,
    shares: 0,
  },
  {
    id: 3,
    title: 'Why I Switched From LinkedIn to Naukri for Job Search',
    category: 'job-hunting',
    tag: 'Job Hunting',
    tagColor: 'sky',
    excerpt: 'Both platforms have their strengths but for IT roles in India, one clearly outperforms the other...',
    date: 'Feb 5, 2026',
    readTime: '5 min',
    status: 'rejected',
    views: 0,
    comments: 0,
    shares: 0,
  },
];

/* ─── Helpers ───────────────────────────────────────────── */
const tagClasses: Record<string, string> = {
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
  blue: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const statusConfig: Record<PostStatus, { label: string; icon: React.FC<any>; cls: string }> = {
  approved: {
    label: 'Published',
    icon: CheckCircle,
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  pending: {
    label: 'Pending Review',
    icon: AlertCircle,
    cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    cls: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

const categories = [
  { id: 'job-hunting', label: 'Job Hunting', color: 'sky' },
  { id: 'career-tips', label: 'Career Tips', color: 'orange' },
  { id: 'automation', label: 'Automation', color: 'blue' },
  { id: 'ai-tools', label: 'AI Tools', color: 'green' },
  { id: 'resume', label: 'Resume & CV', color: 'purple' },
];

const catColors: Record<string, string> = {
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  blue: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30',
};

const writingTips = [
  "Start with a compelling headline that tells readers exactly what they'll learn.",
  'Use short paragraphs (2-3 sentences max) for better readability.',
  'Back up your points with specific examples and data.',
  'End with a clear takeaway or action item for the reader.',
];

/* ─── Write Form ────────────────────────────────────────── */
interface WriteFormProps {
  onSubmit: (post: Omit<UserPost, 'id' | 'views' | 'comments' | 'shares' | 'date'>) => void;
  onCancel: () => void;
}

const WriteForm: React.FC<WriteFormProps> = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    title: '', category: '', tag: '', tagColor: '',
    excerpt: '', content: '', readTime: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedRead = `${Math.max(1, Math.ceil(wordCount / 200))} min`;

  const isValid = form.title.trim() && form.category && form.excerpt.trim() && form.content.trim();

  const handleCategorySelect = (cat: { id: string; label: string; color: string }) => {
    set('category', cat.id);
    set('tag', cat.label);
    set('tagColor', cat.color);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      title: form.title,
      category: form.category,
      tag: form.tag,
      tagColor: form.tagColor,
      excerpt: form.excerpt,
      readTime: form.readTime || estimatedRead,
      status: 'pending',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Blogs
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{wordCount} words · ~{estimatedRead} read</span>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              isValid
                ? 'bg-neon-blue text-black hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Submit for Review
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Editor ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Your blog title..."
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              <AlignLeft className="w-3.5 h-3.5 text-neon-blue" />
              Short Description
            </label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              placeholder="Write a 1-2 sentence summary..."
              className="w-full bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none resize-none text-sm leading-relaxed"
            />
          </div>

          {/* Editor */}
          <div className="bg-dark-800/50 border border-white/10 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5 flex-wrap">
              {[Bold, Italic, List, LinkIcon, Image].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <textarea
              rows={14}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder={`Start writing your blog post here...\n\nShare your experiences, tips, or insights with the AutoJobzy community.`}
              className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none resize-none p-5 leading-relaxed text-sm"
            />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Category */}
          <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <Tag className="w-4 h-4 text-neon-blue" />
              Category *
            </label>
            <div className="space-y-2">
              {categories.map(cat => {
                const isSelected = form.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      isSelected ? catColors[cat.color] : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all ${isSelected ? 'bg-current' : 'bg-gray-600'}`} />
                    {cat.label}
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status info */}
          <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
              <FileText className="w-4 h-4 text-neon-blue" />
              Post Status
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-400">Pending Review</p>
                <p className="text-xs text-gray-500 mt-0.5">Reviewed & published within 1-2 days</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 border border-neon-blue/10 rounded-xl p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Writing Tips
            </label>
            <ul className="space-y-3">
              {writingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400 leading-relaxed">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isValid
                ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
            }`}
          >
            <Send className="w-4 h-4" />
            {isValid ? 'Submit for Review' : 'Fill all required fields'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Success Screen ─────────────────────────────────────── */
const SubmitSuccess: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-6">
      <CheckCircle className="w-10 h-10 text-neon-blue" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">Blog Submitted!</h3>
    <p className="text-gray-400 mb-1">Your post has been sent to the admin for review.</p>
    <p className="text-gray-500 text-sm mb-8">It will be published under your name once approved (within 1-2 days).</p>
    <button
      onClick={onBack}
      className="px-6 py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.4)]"
    >
      View My Blog Posts
    </button>
  </div>
);

/* ─── Post Card ─────────────────────────────────────────── */
const PostCard: React.FC<{ post: UserPost; onDelete: (id: number) => void }> = ({ post, onDelete }) => {
  const status = statusConfig[post.status];
  const StatusIcon = status.icon;
  const isPublished = post.status === 'approved';

  return (
    <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${tagClasses[post.tagColor] || tagClasses.blue}`}>
              <Tag className="w-3 h-3" />
              {post.tag}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${status.cls}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug mb-1">{post.title}</h3>
          <p className="text-gray-500 text-xs line-clamp-2">{post.excerpt}</p>
        </div>
        <button
          onClick={() => onDelete(post.id)}
          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} read</span>
      </div>

      {/* Stats row – only for published */}
      {isPublished ? (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Eye, label: 'Views', value: post.views, color: 'text-neon-blue' },
            { icon: MessageSquare, label: 'Comments', value: post.comments, color: 'text-neon-purple' },
            { icon: Share2, label: 'Shares', value: post.shares, color: 'text-emerald-400' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold text-white">{stat.value.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      ) : post.status === 'rejected' ? (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">This post was not approved. Please review our content guidelines and resubmit.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-orange-500/5 border border-orange-500/10 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <p className="text-xs text-orange-400">Awaiting admin review. Stats will appear once published.</p>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────── */
type View = 'list' | 'write' | 'success';

const UserBlogSection: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [posts, setPosts] = useState<UserPost[]>(mockPosts);

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'approved').length,
    pending: posts.filter(p => p.status === 'pending').length,
    totalViews: posts.reduce((s, p) => s + p.views, 0),
    totalComments: posts.reduce((s, p) => s + p.comments, 0),
    totalShares: posts.reduce((s, p) => s + p.shares, 0),
  };

  const handleDelete = (id: number) => setPosts(ps => ps.filter(p => p.id !== id));

  const handleSubmit = (newPost: Omit<UserPost, 'id' | 'views' | 'comments' | 'shares' | 'date'>) => {
    const post: UserPost = {
      id: Date.now(),
      ...newPost,
      views: 0,
      comments: 0,
      shares: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setPosts(ps => [post, ...ps]);
    setView('success');
  };

  if (view === 'write') {
    return (
      <div className="max-w-5xl mx-auto">
        <WriteForm onSubmit={handleSubmit} onCancel={() => setView('list')} />
      </div>
    );
  }

  if (view === 'success') {
    return (
      <div className="max-w-5xl mx-auto">
        <SubmitSuccess onBack={() => setView('list')} />
      </div>
    );
  }

  /* ── List View ── */
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Blog Posts</h2>
          <p className="text-gray-400 mt-1 text-sm">Share your career insights with the AutoJobzy community</p>
        </div>
        <button
          onClick={() => setView('write')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)]"
        >
          <Plus className="w-5 h-5" />
          Write New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Posts', value: stats.total, icon: BookOpen, color: 'text-neon-blue', bg: 'bg-neon-blue/10 border-neon-blue/20' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-neon-blue', bg: 'bg-neon-blue/5 border-white/10' },
          { label: 'Comments', value: stats.totalComments, icon: MessageSquare, color: 'text-neon-purple', bg: 'bg-neon-purple/5 border-white/10' },
          { label: 'Shares', value: stats.totalShares, icon: Share2, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-white/10' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
              <Icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-xl font-bold text-white">{s.value.toLocaleString()}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-dark-800/30 border border-white/5 rounded-2xl">
          <BookOpen className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No blog posts yet</h3>
          <p className="text-gray-500 text-sm mb-6">Share your job search experience with the community!</p>
          <button
            onClick={() => setView('write')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write Your First Post
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 border border-neon-blue/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 bg-neon-blue/10 rounded-xl flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-neon-blue" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white mb-1">How it works</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Write your post and submit for review. Our team approves within 1-2 business days. Once published, your article appears on the AutoJobzy Blog under your name — and you can track views, comments, and shares right here.
          </p>
        </div>
        <button
          onClick={() => setView('write')}
          className="flex items-center gap-1.5 px-4 py-2 bg-neon-blue text-black text-sm font-bold rounded-xl hover:bg-white transition-colors flex-shrink-0"
        >
          Write Post <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UserBlogSection;
